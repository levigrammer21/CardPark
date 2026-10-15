export const RULES = Object.freeze({
 '1-1':['HR','Home run'], '1-2':['2B','Double'], '1-3':['FO','Fly out'], '1-4':['BB','Walk'], '1-5':['PO','Pop out'], '1-6':['1B','Single'],
 '2-2':['DP','Double play'], '2-3':['GO','Ground out'], '2-4':['K','Strikeout'], '2-5':['1B','Single'], '2-6':['K','Strikeout'],
 '3-3':['BB','Walk'], '3-4':['3B','Triple'], '3-5':['GO','Ground out'], '3-6':['FO','Fly out'],
 '4-4':['BB','Walk'], '4-5':['PO','Pop out'], '4-6':['K','Strikeout'], '5-5':['2B','Double'], '5-6':['SF','Sacrifice fly'], '6-6':['HR','Home run']
});
export const clone = x => JSON.parse(JSON.stringify(x));
export function createState(innings=6) {
 if (![3,6,9].includes(Number(innings))) throw Error('Choose 3, 6, or 9 innings.');
 return {v:2, clutch:[false,false], bunt:[false,false], innings:Number(innings), inning:1, half:0, outs:0, bases:[null,null,null], next:[0,0], runs:[0,0], hits:[0,0], lines:[[0],[null]], stats:Array.from({length:2},()=>Array.from({length:4},()=>({ab:0,h:0,hr:0,r:0,rbi:0,bb:0,tb:0,doubles:0,triples:0,k:0,sf:0,sh:0}))), over:false,winner:null,plays:0};
}
export function batter(s) {
 for(let n=0;n<4;n++) { const id=(s.next[s.half]+n)%4; if(!s.bases.includes(id)) return id; }
 throw Error('No available batter.');
}
export function rollDice() {
 const a=new Uint32Array(2); let out=[];
 // Rejection sampling avoids modulo bias.
 while(out.length<2) { crypto.getRandomValues(a); for(const x of a) if(x<4294967292 && out.length<2) out.push(x%6+1); }
 return out;
}
export function applyRoll(state,dice,mode='swing',historical=false) {
 if(state.over) throw Error('This game is final.');
 if(!['swing','bunt'].includes(mode))throw Error('Choose swing or bunt.');
 if(mode==='bunt'&&state.bunt?.[state.half]&&!historical)throw Error('Bunt has already been used this game.');
 if(!Array.isArray(dice)||dice.length!==2||dice.some(x=>!Number.isInteger(x)||x<1||x>6)) throw Error('Invalid dice.');
 const s=clone(state), team=s.half, id=batter(s), key=[...dice].sort((a,b)=>a-b).join('-');let [code,label]=RULES[key];
 const sacrifice=mode==='bunt'&&state.outs<2&&state.bases.some(x=>x!==null);
 if(mode==='bunt'){code=(dice[0]+dice[1])%2===0?'BH':'BO';label=code==='BH'?'Bunt single':sacrifice?'Sacrifice bunt':'Bunt out';}
 s.clutch??=[false,false];s.bunt??=[false,false];if(mode==='bunt')s.bunt[team]=true;for(const roster of s.stats)for(const p of roster)for(const key of ['tb','doubles','triples','k','sf','sh'])p[key]??=0;
 const moves=[], retired=[], oldRuns=s.runs[team];
 const move=(pid,from,to)=>{moves.push({id:pid,from,to}); if(to>=4){s.runs[team]++;s.lines[team][s.inning-1]=(s.lines[team][s.inning-1]||0)+1;s.stats[team][pid].r++;}};
 s.lines[team][s.inning-1]??=0;
 if(code!=='BB'&&code!=='SF'&&!(code==='BO'&&sacrifice)) s.stats[team][id].ab++;
 if(['1B','2B','3B','HR','BH'].includes(code)) {
  const n={ '1B':1,'2B':2,'3B':3,HR:4,BH:1}[code];
  s.hits[team]++;s.stats[team][id].h++;s.stats[team][id].tb+=n;if(n===2)s.stats[team][id].doubles++;if(n===3)s.stats[team][id].triples++;if(n===4)s.stats[team][id].hr++;
  const b=[null,null,null];
  for(let i=2;i>=0;i--)if(s.bases[i]!==null){const pid=s.bases[i],to=i+1+n;move(pid,i+1,to);if(to<4)b[to-1]=pid;}
  move(id,0,n);if(n<4)b[n-1]=id;s.bases=b;
 } else if(code==='BB') {
  s.stats[team][id].bb++;
  if(s.bases[0]!==null){if(s.bases[1]!==null){if(s.bases[2]!==null)move(s.bases[2],3,4);move(s.bases[1],2,3);s.bases[2]=s.bases[1];}move(s.bases[0],1,2);s.bases[1]=s.bases[0];}
  s.bases[0]=id;move(id,0,1);
 } else {
  s.outs++;retired.push(id);if(code==='K')s.stats[team][id].k++;if(code==='SF'&&state.outs<2)s.stats[team][id].sf++;if(code==='BO'&&sacrifice)s.stats[team][id].sh++;
  if(code==='DP'&&s.outs<3){for(let i=2;i>=0;i--)if(s.bases[i]!==null){retired.push(s.bases[i]);s.bases[i]=null;s.outs++;break;}}
  if((code==='SF'||code==='BO')&&s.outs<3){const b=[null,null,null];for(let i=2;i>=0;i--)if(s.bases[i]!==null){move(s.bases[i],i+1,i+2);if(i<2)b[i+1]=s.bases[i];}s.bases=b;}
  if(code==='SF'&&state.outs===2)s.stats[team][id].ab++;
 }
 s.stats[team][id].rbi+=s.runs[team]-oldRuns;
 s.next[team]=(id+1)%4;s.plays++;
 // A home-run walk-off credits every runner; other hits follow the board's fixed advancement.
 if(team===1&&s.inning>=s.innings&&s.runs[1]>s.runs[0]){s.over=true;s.winner=1;}
 let endTurn=s.over;
 if(!s.over&&s.outs>=3){
  endTurn=true;s.outs=0;s.bases=[null,null,null];
  if(team===0){
   if(s.inning>=s.innings&&s.runs[1]>s.runs[0]){s.over=true;s.winner=1;}
   else {s.half=1;s.lines[1][s.inning-1]=0;}
  } else if(s.inning>=s.innings&&s.runs[0]!==s.runs[1]){s.over=true;s.winner=s.runs[0]>s.runs[1]?0:1;}
  else {s.inning++;s.half=0;s.lines[0].push(0);s.lines[1].push(null);}
 }
 return {state:s,event:{dice:[...dice],mode,code,label,team,batter:id,moves,retired,runs:s.runs[team]-oldRuns,endTurn,outs:Math.min(3,state.outs+retired.length)}};
}
export function applyRecord(state,record){
 const before=clone(state);before.clutch??=[false,false];
 if(record.clutch){if(before.clutch[before.half])throw Error('Clutch batter has already been used.');before.clutch[before.half]=true;}
 const result=applyRoll(before,record.dice||record,record.mode||'swing',true);result.event.clutch=!!record.clutch;if(record.originalDice)result.event.originalDice=record.originalDice;
 return result;
}
export function replay(start,rolls){let state=clone(start);for(const r of rolls)state=applyRecord(state,r).state;return state;}
export function playFromTurn(start,rolls,dice,clutch=false,mode='swing'){
 let next=clone(rolls),before;
 if(clutch){if(start.clutch?.[start.half]||next.some(r=>r.clutch))throw Error('Clutch Batter has already been used.');if(!next.length)throw Error('Roll first, then use Clutch Batter before your next roll.');const original=next.pop();before=replay(start,next);if(before.clutch?.[before.half])throw Error('Clutch Batter has already been used.');next.push({dice:[...dice],mode:original.mode||'swing',clutch:true,originalDice:original.originalDice||original.dice});}
 else {before=replay(start,next);if(mode==='bunt'&&before.bunt?.[before.half])throw Error('Bunt has already been used this game.');if(next.length){let b=clone(start),end=false;for(const r of next){const x=applyRecord(b,r);b=x.state;end=x.event.endTurn;}if(end)throw Error('End this half-inning first.');}next.push({dice:[...dice],mode});}
 const result=applyRecord(before,next.at(-1));return {rolls:next,before,result};
}
export function situationOdds(state,mode='swing'){
 if(state.over||mode==='bunt'&&state.bunt?.[state.half])return null;let outs=0,onbase=0,runs=0,total=0;
 for(let a=1;a<=6;a++)for(let b=1;b<=6;b++){const r=applyRoll(state,[a,b],mode);total++;if(r.event.retired.length)outs++;else onbase++;runs+=r.event.runs;}
 return {out:outs/total,onbase:onbase/total,runs:runs/total};
}
