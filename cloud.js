import {makeSeason,recordLeagueResult} from './league.js';
import {firebaseConfig} from './firebase-config.js';
import {createState,clone,replay,applyRoll,playFromTurn} from './engine.js';
let sdk, pending, auth, db;
export let user=null;
let callbacks=[];
function decodeTurn(t){return t?{...t,start:JSON.parse(t.startJSON)}:null;}
function decodeMatch(m){return {...m,revision:m.revision||0,turnStart:JSON.parse(m.stateJSON),state:JSON.parse(m.progress?.afterJSON||m.stateJSON),lastTurn:decodeTurn(m.lastTurn)};}
export const onUser=fn=>{callbacks.push(fn);return()=>callbacks=callbacks.filter(x=>x!==fn);};
export async function connect(){
 if(sdk)return sdk;if(pending)return pending;
 pending=(async()=>{
  const base='https://www.gstatic.com/firebasejs/12.3.0/';
  const [app,A,F]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')]);
  const instance=app.initializeApp(firebaseConfig);auth=A.getAuth(instance);db=F.getFirestore(instance);
  await new Promise((resolve,reject)=>{let first=true;A.onAuthStateChanged(auth,u=>{user=u;if(first){first=false;resolve();}callbacks.forEach(fn=>fn(u));},reject);});
  sdk={A,F,auth,db};return sdk;
 })().catch(e=>{pending=null;throw e;});return pending;
}
export async function login(email,password,signup=false){const {A}=await connect();return signup?A.createUserWithEmailAndPassword(auth,email,password):A.signInWithEmailAndPassword(auth,email,password);}
export async function google(){const {A}=await connect();return A.signInWithPopup(auth,new A.GoogleAuthProvider());}
export async function logout(){const {A}=await connect();return A.signOut(auth);}
export async function reset(email){const {A}=await connect();return A.sendPasswordResetEmail(auth,email);}
export async function loadTeam(){const {F}=await connect();if(!user)return null;const s=await F.getDoc(F.doc(db,'cardparkUsers',user.uid));return s.exists()?s.data().team:null;}
export async function saveTeam(team){const {F}=await connect();if(!user)throw Error('Sign in first.');await F.setDoc(F.doc(db,'cardparkUsers',user.uid),{team,updatedAt:F.serverTimestamp()});}
function requireUser(){if(!user)throw Error('Sign in to play online.');return user.uid;}
function randomCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const b=crypto.getRandomValues(new Uint8Array(8));return Array.from(b,x=>chars[x%32]).join('');}

export function friendly(e){const c=e?.code||'';if(c.includes('permission-denied'))return 'Firestore blocked this request. Publish the included firestore.rules in Firebase → Firestore Database → Rules.';if(c.includes('unauthorized-domain'))return 'Add your GitHub Pages hostname to Firebase → Authentication → Settings → Authorized domains.';if(c.includes('invalid-credential')||c.includes('wrong-password')||c.includes('user-not-found'))return 'Email or password was not recognized.';if(c.includes('email-already-in-use'))return 'That email already has an account. Choose Sign in.';if(c.includes('weak-password'))return 'Use a password with at least six characters.';if(c.includes('invalid-email'))return 'Enter a valid email address.';if(c.includes('popup-blocked'))return 'Your browser blocked Google sign-in. Allow popups for this site or use email and password.';if(c.includes('popup-closed'))return 'Google sign-in was closed. Try again when ready.';if(c.includes('operation-not-allowed'))return 'Enable this sign-in provider in Firebase Authentication.';if(c.includes('network')||/fetch|dynamically imported/i.test(e?.message||''))return 'Cannot connect right now. Check your connection and try again. Offline games still work.';return e?.message||'Something went wrong. Please try again.';}

function freshMatch(code,owner,team,innings,options={}){return {v:2,code,owner,players:[owner],teams:[clone(team),null],status:'waiting',turnUid:owner,seq:0,revision:0,clutchUsed:[false,false],stateJSON:JSON.stringify(createState(innings)),progress:null,lastAction:null,lastTurn:null,locked:!!options.pin,joinProof:'',leagueId:options.leagueId||'',fixtureId:options.fixtureId||'',createdAt:sdk.F.serverTimestamp(),updatedAt:sdk.F.serverTimestamp()};}
async function pinHash(code,pin){if(!pin)return '';const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(code+':'+pin));return Array.from(new Uint8Array(d),b=>b.toString(16).padStart(2,'0')).join('');}
function listing(m){return {code:m.code,owner:m.owner,name:m.teams[0].name,color:m.teams[0].color,innings:JSON.parse(m.stateJSON).innings,locked:m.locked,createdAt:sdk.F.serverTimestamp()};}
export async function createMatch(team,innings,options={}){
 const {F}=await connect(),uid=requireUser();
 for(let i=0;i<5;i++){const code=randomCode(),ref=F.doc(db,'cardparkMatches',code),proof=await pinHash(code,options.pin||''),m=freshMatch(code,uid,team,innings,options);
  const okay=await F.runTransaction(db,async tx=>{const s=await tx.get(ref);if(s.exists())return false;tx.set(ref,m);tx.set(F.doc(db,'cardparkLocks',code),{owner:uid,hash:proof});tx.set(F.doc(db,'cardparkOpenGames',code),listing(m));return true;});if(okay)return code;
 }throw Error('Could not create an invite. Please try again.');
}
export async function joinMatch(code,team,pin=''){
 const {F}=await connect(),uid=requireUser();code=code.trim().toUpperCase();if(!/^[A-HJ-NP-Z2-9]{8}$/.test(code))throw Error('Enter the eight-character game ID.');const proof=await pinHash(code,pin.trim());
 await F.runTransaction(db,async tx=>{const ref=F.doc(db,'cardparkMatches',code),s=await tx.get(ref);if(!s.exists())throw Error('Game not found.');const m=s.data();if(m.players.includes(uid))return;if(m.status!=='waiting'||m.players.length!==1)throw Error('Someone already took the second seat.');tx.update(ref,{players:[m.owner,uid],teams:[m.teams[0],clone(team)],status:'active',joinProof:proof,updatedAt:F.serverTimestamp()});tx.delete(F.doc(db,'cardparkOpenGames',code));});return code;
}
export async function watchList(next,error){const {F}=await connect(),uid=requireUser();return F.onSnapshot(F.query(F.collection(db,'cardparkMatches'),F.where('players','array-contains',uid)),s=>next(s.docs.map(d=>decodeMatch({...d.data(),code:d.id})).sort((a,b)=>(b.updatedAt?.toMillis?.()||0)-(a.updatedAt?.toMillis?.()||0))),error);}
export async function watchOpenGames(next,error){const {F}=await connect();requireUser();return F.onSnapshot(F.query(F.collection(db,'cardparkOpenGames'),F.limit(60)),s=>next(s.docs.map(d=>({...d.data(),code:d.id}))),error);}
export async function watchMatch(code,next,error){const {F}=await connect();requireUser();return F.onSnapshot(F.doc(db,'cardparkMatches',code),s=>s.exists()?next(decodeMatch({...s.data(),code:s.id})):error(Error('Game not found.')),error);}
export async function getMatch(code){const {F}=await connect();requireUser();const s=await F.getDoc(F.doc(db,'cardparkMatches',code));if(!s.exists())throw Error('Game not found.');return decodeMatch({...s.data(),code:s.id});}
export async function upgradeMatch(code,draft=null){
 const {F}=await connect(),uid=requireUser();await F.runTransaction(db,async tx=>{
  const ref=F.doc(db,'cardparkMatches',code),snap=await tx.get(ref);if(!snap.exists())return;const m=snap.data();if(m.v>=2||m.status==='complete'||!m.players.includes(uid))return;
  const state=JSON.parse(m.stateJSON);state.clutch??=[false,false];let progress=null;
  if(m.turnUid===uid&&draft?.seq===m.seq&&draft.rolls?.length){try{let after=clone(state),ended=false;for(const r of draft.rolls){if(ended)throw Error('Invalid old draft');const x=playFromTurn(after,[],r.dice,!!r.clutch);after=x.result.state;ended=x.result.event.endTurn;}progress={rolls:clone(draft.rolls),afterJSON:JSON.stringify(after),ended};}catch{progress=null;}}
  const update={v:2,revision:0,stateJSON:JSON.stringify(state),progress,lastAction:null,clutchUsed:state.clutch,locked:false,joinProof:'',leagueId:'',fixtureId:'',updatedAt:F.serverTimestamp()};tx.update(ref,update);
  if(m.status==='waiting'&&m.owner===uid)tx.set(F.doc(db,'cardparkOpenGames',code),listing({...m,...update}));
 });
}

export async function play(code,revision,dice,clutch,actionId,mode='swing'){
 const {F}=await connect(),uid=requireUser();
 return F.runTransaction(db,async tx=>{
  const ref=F.doc(db,'cardparkMatches',code),eventRef=F.doc(db,'cardparkMatches',code,'events',actionId),[snap,previous]=await Promise.all([tx.get(ref),tx.get(eventRef)]);
  if(previous.exists())return previous.data();if(!snap.exists())throw Error('Game not found.');const m=snap.data();
  if(m.v<2)throw Error('Reopen this game to update it.');if(m.status!=='active'||m.turnUid!==uid)throw Error('It is not your turn.');if(m.revision!==revision)throw Error('The game changed on another device. Reopen it before rolling.');
  const turnStart=JSON.parse(m.stateJSON),played=playFromTurn(turnStart,m.progress?.rolls||[],dice,clutch,mode),rev=revision+1;
  const action={id:actionId,revision:rev,seq:m.seq,by:uid,dice:[...dice],mode:played.rolls.at(-1).mode||'swing',clutch:!!clutch,originalDice:played.rolls.at(-1).originalDice||null,beforeJSON:JSON.stringify(played.before),afterJSON:JSON.stringify(played.result.state),time:Date.now()};
  const progress={rolls:played.rolls,afterJSON:action.afterJSON,ended:played.result.event.endTurn};
  tx.set(eventRef,action);tx.update(ref,{progress,clutchUsed:played.result.state.clutch,revision:rev,lastAction:action,updatedAt:F.serverTimestamp()});return action;
 });
}
export async function watchEvents(code,since,next,error){const {F}=await connect();requireUser();return F.onSnapshot(F.query(F.collection(db,'cardparkMatches',code,'events'),F.where('revision','>',since),F.orderBy('revision')),s=>next(s.docChanges().filter(c=>c.type==='added').map(c=>c.doc.data())),error);}
export async function finishTurn(code,seq,revision){
 const {F}=await connect(),uid=requireUser();
 return F.runTransaction(db,async tx=>{
  const ref=F.doc(db,'cardparkMatches',code),s=await tx.get(ref);if(!s.exists())throw Error('Game not found.');const m=s.data();if(m.seq===seq+1)return decodeMatch(m);
  if(m.seq!==seq||m.revision!==revision||m.status!=='active'||m.turnUid!==uid)throw Error('This turn changed. Reopen the game.');if(!m.progress?.ended)throw Error('Finish the half-inning first.');
  const state=replay(JSON.parse(m.stateJSON),m.progress.rolls);let leagueUpdate=null,leagueRef;
  if(state.over&&m.leagueId){leagueRef=F.doc(db,'cardparkLeagues',m.leagueId);const ls=await tx.get(leagueRef);if(ls.exists())leagueUpdate=recordLeagueResult({...ls.data(),id:m.leagueId},code,state.runs,m.players[state.winner]);}
  const turn={index:seq,by:uid,startJSON:m.stateJSON,rolls:clone(m.progress.rolls),time:Date.now()};
  tx.set(F.doc(db,'cardparkMatches',code,'turns',String(seq)),turn);
  const update={stateJSON:JSON.stringify(state),progress:null,lastTurn:turn,seq:seq+1,status:state.over?'complete':'active',turnUid:state.over?'':m.players[state.half],updatedAt:F.serverTimestamp()};if(state.over)update.completedAt=F.serverTimestamp();tx.update(ref,update);
  if(leagueUpdate?.changed){const l=leagueUpdate.league;tx.update(leagueRef,{seasonJSON:l.seasonJSON,playoffsJSON:l.playoffsJSON,status:l.status,champion:l.champion||'',lastResultCode:code,updatedAt:F.serverTimestamp()});}
  return decodeMatch({...m,...update});
 });
}
export async function history(code){const {F}=await connect();requireUser();const s=await F.getDocs(F.collection(db,'cardparkMatches',code,'turns'));return s.docs.map(x=>decodeTurn(x.data())).sort((a,b)=>a.index-b.index);}
export async function presence(code,active){const {F}=await connect(),uid=requireUser();return F.setDoc(F.doc(db,'cardparkMatches',code,'presence',uid),{active,at:F.serverTimestamp()});}
export async function watchPresence(code,next,error){const {F}=await connect();requireUser();return F.onSnapshot(F.collection(db,'cardparkMatches',code,'presence'),s=>next(Object.fromEntries(s.docs.map(d=>[d.id,d.data()]))),error);}
export async function createLeague(team,options){
 const {F}=await connect(),uid=requireUser(),id=randomCode();const entry={uid,name:team.name,color:team.color};
 const league={id,owner:uid,name:options.name.trim().slice(0,32)||'Cardpark League',cap:Number(options.cap),gamesPerTeam:Number(options.gamesPerTeam),innings:Number(options.innings),playoffTeams:Number(options.playoffTeams),status:'forming',memberIds:[uid],entries:[entry],seasonJSON:'[]',playoffsJSON:'[]',champion:'',lastResultCode:'',createdAt:F.serverTimestamp(),updatedAt:F.serverTimestamp()};
 if(league.cap<3||league.cap>12||league.gamesPerTeam<1||league.gamesPerTeam>30)throw Error('Choose 3–12 teams and 1–30 games per team.');
 await F.runTransaction(db,async tx=>{const r=F.doc(db,'cardparkLeagues',id),s=await tx.get(r);if(s.exists())throw Error('Please try creating the league again.');tx.set(r,league);tx.set(F.doc(db,'cardparkLeagues',id,'members',uid),{team:clone(team)});});return id;
}
export async function joinLeague(id,team){const {F}=await connect(),uid=requireUser();await F.runTransaction(db,async tx=>{const r=F.doc(db,'cardparkLeagues',id),s=await tx.get(r);if(!s.exists())throw Error('League not found.');const l=s.data();if(l.memberIds.includes(uid))return;if(l.status!=='forming')throw Error('This season has already started.');if(l.memberIds.length>=l.cap)throw Error('This league is full.');tx.update(r,{memberIds:[...l.memberIds,uid],entries:[...l.entries,{uid,name:team.name,color:team.color}],updatedAt:F.serverTimestamp()});tx.set(F.doc(db,'cardparkLeagues',id,'members',uid),{team:clone(team)});});}
export async function startLeague(id,gamesPerTeam,playoffTeams){const {F}=await connect(),uid=requireUser();await F.runTransaction(db,async tx=>{const ref=F.doc(db,'cardparkLeagues',id),s=await tx.get(ref);if(!s.exists())throw Error('League not found.');const l=s.data();if(l.owner!==uid||l.status!=='forming')throw Error('Only the commissioner can start a forming league.');const games=makeSeason(l.entries,Number(gamesPerTeam),id);tx.update(ref,{status:'season',gamesPerTeam:Number(gamesPerTeam),playoffTeams:Number(playoffTeams),seasonJSON:JSON.stringify(games),updatedAt:F.serverTimestamp()});});}
export async function watchLeagues(next,error){const {F}=await connect();requireUser();return F.onSnapshot(F.query(F.collection(db,'cardparkLeagues'),F.limit(80)),s=>next(s.docs.map(x=>({...x.data(),id:x.id}))),error);}
export async function watchLeague(id,next,error){const {F}=await connect();requireUser();return F.onSnapshot(F.doc(db,'cardparkLeagues',id),s=>s.exists()?next({...s.data(),id:s.id}):error(Error('League not found.')),error);}
export async function ensureLeagueGame(id,fixtureId){
 const {F}=await connect(),uid=requireUser();
 return F.runTransaction(db,async tx=>{
  const ls=await tx.get(F.doc(db,'cardparkLeagues',id));if(!ls.exists())throw Error('League not found.');const l=ls.data();if(!l.memberIds.includes(uid))throw Error('Join this league first.');const fixtures=[...JSON.parse(l.seasonJSON||'[]'),...JSON.parse(l.playoffsJSON||'[]').flat()],g=fixtures.find(x=>x.id===fixtureId);if(!g)throw Error('Fixture not found.');const ref=F.doc(db,'cardparkMatches',g.code),existing=await tx.get(ref);if(existing.exists())return g.code;if(![g.away,g.home].includes(uid))throw Error('One of these teams needs to open the fixture first.');
  const [as,hs]=await Promise.all([tx.get(F.doc(db,'cardparkLeagues',id,'members',g.away)),tx.get(F.doc(db,'cardparkLeagues',id,'members',g.home))]);if(!as.exists()||!hs.exists())throw Error('A league roster is missing.');
  const m=freshMatch(g.code,g.away,as.data().team,l.innings,{leagueId:id,fixtureId:g.id});m.players=[g.away,g.home];m.teams=[as.data().team,hs.data().team];m.status='active';m.turnUid=g.away;tx.set(ref,m);return g.code;
 });
}
