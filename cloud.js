import {firebaseConfig} from './firebase-config.js';
import {createState,clone,replay,applyRoll} from './engine.js';
let sdk, pending, auth, db;
export let user=null;
let callbacks=[];
function decodeTurn(t){return t?{...t,start:JSON.parse(t.startJSON)}:null;}
function decodeMatch(m){return {...m,state:JSON.parse(m.stateJSON),lastTurn:decodeTurn(m.lastTurn)};}
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
export async function createMatch(team,innings){
 const {F}=await connect();const uid=requireUser();
 for(let i=0;i<5;i++){
  const code=randomCode(),ref=F.doc(db,'cardparkMatches',code);
  const data={v:1,code,owner:uid,players:[uid],teams:[clone(team),null],status:'waiting',turnUid:uid,seq:0,stateJSON:JSON.stringify(createState(innings)),lastTurn:null,createdAt:F.serverTimestamp(),updatedAt:F.serverTimestamp()};
  const created=await F.runTransaction(db,async tx=>{const snap=await tx.get(ref);if(snap.exists())return false;tx.set(ref,data);return true;});
  if(created)return code;
 }
 throw Error('Could not create a unique invite. Please try again.');
}
export async function joinMatch(code,team){
 const {F}=await connect();const uid=requireUser();code=code.toUpperCase().replace(/[^A-Z2-9]/g,'');
 if(code.length!==8)throw Error('Enter the eight-character invite code.');
 await F.runTransaction(db,async tx=>{
  const ref=F.doc(db,'cardparkMatches',code),snap=await tx.get(ref);
  if(!snap.exists())throw Error('Invite not found. Check the code.');const m=snap.data();
  if(m.players.includes(uid))return;
  if(m.status!=='waiting'||m.players.length!==1)throw Error('This game already has two players.');
  tx.update(ref,{players:[m.owner,uid],teams:[m.teams[0],clone(team)],status:'active',updatedAt:F.serverTimestamp()});
 });return code;
}
export async function watchList(next,error){const {F}=await connect();const uid=requireUser();return F.onSnapshot(F.query(F.collection(db,'cardparkMatches'),F.where('players','array-contains',uid)),s=>next(s.docs.map(d=>decodeMatch({...d.data(),code:d.id})).sort((a,b)=>(b.updatedAt?.toMillis?.()||0)-(a.updatedAt?.toMillis?.()||0))),error);}
export async function watchMatch(code,next,error){const {F}=await connect();requireUser();return F.onSnapshot(F.doc(db,'cardparkMatches',code),s=>{if(!s.exists()){error(Error('Game not found.'));return;}const m=s.data();if(!m.players.includes(user.uid)){error(Error('Join this game using its invite code.'));return;}next(decodeMatch({...m,code:s.id}));},error);}
export async function submitTurn(code,seq,start,rolls){
 const {F}=await connect();const uid=requireUser();
 return F.runTransaction(db,async tx=>{
  const ref=F.doc(db,'cardparkMatches',code),snap=await tx.get(ref);if(!snap.exists())throw Error('Game not found.');const m=decodeMatch(snap.data());
  // An uncertain network response can be retried without submitting twice.
  if(m.seq===seq+1&&m.lastTurn?.by===uid&&JSON.stringify(m.lastTurn.rolls)===JSON.stringify(rolls))return m.state;
  if(m.seq!==seq)throw Error('This turn changed on another device. Return to your games and reopen it.');
  if(m.status!=='active'||m.turnUid!==uid)throw Error('It is not your turn.');
  if(JSON.stringify(m.state)!==JSON.stringify(start)){
   // Firestore map field ordering is not guaranteed; compare values, not key order.
   if(!sameState(m.state,start))throw Error('The saved turn no longer matches this game. Reopen it.');
  }
  if(!rolls.length||rolls.length>2000)throw Error('Invalid turn.');
  let s=clone(start),end=false;
  for(const r of rolls){if(end)throw Error('Turn contains extra rolls.');const result=applyRoll(s,r.dice);s=result.state;end=result.event.endTurn;}
  if(!end)throw Error('Finish the half-inning before sending your turn.');
  const turn={index:seq,by:uid,startJSON:JSON.stringify(start),rolls:clone(rolls),time:Date.now()};
  tx.set(F.doc(db,'cardparkMatches',code,'turns',String(seq)),turn);
  tx.update(ref,{stateJSON:JSON.stringify(s),seq:seq+1,turnUid:s.over?'':m.players[s.half],status:s.over?'complete':'active',lastTurn:turn,updatedAt:F.serverTimestamp()});return s;
 });
}
function sameState(a,b){if(a===b)return true;if(a===null||b===null||typeof a!=='object'||typeof b!=='object')return false;const ak=Object.keys(a).sort(),bk=Object.keys(b).sort();return ak.length===bk.length&&ak.every((k,i)=>k===bk[i]&&sameState(a[k],b[k]));}
export async function history(code){const {F}=await connect();requireUser();const s=await F.getDocs(F.collection(db,'cardparkMatches',code,'turns'));return s.docs.map(x=>decodeTurn(x.data())).sort((a,b)=>b.index-a.index);}
export function friendly(e){const c=e?.code||'';if(c.includes('permission-denied'))return 'Firestore blocked this request. Publish the included firestore.rules in Firebase → Firestore Database → Rules.';if(c.includes('unauthorized-domain'))return 'Add your GitHub Pages hostname to Firebase → Authentication → Settings → Authorized domains.';if(c.includes('invalid-credential')||c.includes('wrong-password')||c.includes('user-not-found'))return 'Email or password was not recognized.';if(c.includes('email-already-in-use'))return 'That email already has an account. Choose Sign in.';if(c.includes('weak-password'))return 'Use a password with at least six characters.';if(c.includes('invalid-email'))return 'Enter a valid email address.';if(c.includes('popup-blocked'))return 'Your browser blocked Google sign-in. Allow popups for this site or use email and password.';if(c.includes('popup-closed'))return 'Google sign-in was closed. Try again when ready.';if(c.includes('operation-not-allowed'))return 'Enable this sign-in provider in Firebase Authentication.';if(c.includes('network')||/fetch|dynamically imported/i.test(e?.message||''))return 'Cannot connect right now. Check your connection and try again. Offline games still work.';return e?.message||'Something went wrong. Please try again.';}
