import {clone} from './engine.js';
export function makeSeason(entries,gamesPerTeam,leagueId){
 const n=entries.length,x=Number(gamesPerTeam);if(n<3||n>12)throw Error('A league needs 3–12 teams.');if(!Number.isInteger(x)||x<1||x>30)throw Error('Choose 1–30 regular-season games per team.');if(n%2&&x%2)throw Error('With an odd number of teams, games per team must be even so everyone plays the same number.');
 const games=[];const add=(a,b,round)=>{const i=games.length,flip=(round+i)%2;if(flip)[a,b]=[b,a];games.push({id:`S${i+1}`,code:`${leagueId}-S${i+1}`,away:entries[a].uid,home:entries[b].uid,round:round+1,stage:'season',result:null});};
 if(n%2===0){let circle=Array.from({length:n},(_,i)=>i),rounds=[];for(let r=0;r<n-1;r++){let pairs=[];for(let i=0;i<n/2;i++)pairs.push([circle[i],circle[n-1-i]]);rounds.push(pairs);circle=[circle[0],circle.at(-1),...circle.slice(1,-1)];}for(let r=0;r<x;r++)for(const[a,b]of rounds[r%(n-1)])add(a,b,r);}
 else {for(let r=0;r<x/2;r++){const d=r%((n-1)/2)+1;for(let i=0;i<n;i++)add(i,(i+d)%n,r);}}
 return games;
}
export function standings(league){
 const fixtures=JSON.parse(league.seasonJSON||'[]'),rows=league.entries.map((t,i)=>({...t,seed:i+1,w:0,l:0,gp:0,rf:0,ra:0,diff:0})),map=new Map(rows.map(r=>[r.uid,r]));
 for(const g of fixtures){if(!g.result)continue;const a=map.get(g.away),h=map.get(g.home);if(!a||!h)continue;a.gp++;h.gp++;a.rf+=g.result.runs[0];a.ra+=g.result.runs[1];h.rf+=g.result.runs[1];h.ra+=g.result.runs[0];const w=map.get(g.result.winner),l=map.get(g.result.winner===g.away?g.home:g.away);w.w++;l.l++;}
 rows.forEach(r=>{r.diff=r.rf-r.ra;r.pct=r.gp?r.w/r.gp:0;});
 for(const r of rows){let w=0,gp=0;for(const g of fixtures){if(!g.result||![g.away,g.home].includes(r.uid))continue;const other=map.get(g.away===r.uid?g.home:g.away);if(other.pct===r.pct&&other.w===r.w){gp++;if(g.result.winner===r.uid)w++;}}r.h2h=gp?w/gp:0;}
 rows.sort((a,b)=>b.pct-a.pct||b.w-a.w||b.h2h-a.h2h||b.diff-a.diff||b.rf-a.rf||a.name.localeCompare(b.name)||a.uid.localeCompare(b.uid));return rows.map((r,i)=>({...r,seed:i+1}));
}
function headToHead(games,a,b){let aw=0,bw=0;for(const g of games)if(g.result&&[g.away,g.home].includes(a)&&[g.away,g.home].includes(b)){if(g.result.winner===a)aw++;else bw++;}return bw-aw;}
const seedOrder=n=>n===2?[1,2]:n===4?[1,4,2,3]:[1,8,4,5,2,7,3,6];
export function makePlayoffs(league){const ranked=standings(league);let n=2;while(n*2<=Math.min(Number(league.playoffTeams)||4,ranked.length))n*=2;const order=seedOrder(n),round=[];for(let i=0;i<n;i+=2){const a=ranked[order[i]-1],b=ranked[order[i+1]-1];round.push({id:`P1-${i/2+1}`,code:`${league.id}-P1-${i/2+1}`,home:a.uid,away:b.uid,homeSeed:a.seed,awaySeed:b.seed,round:1,stage:'playoffs',result:null});}return [round];}
export function recordLeagueResult(league,code,runs,winnerUid){
 const l=clone(league),season=JSON.parse(l.seasonJSON||'[]'),bracket=JSON.parse(l.playoffsJSON||'[]'),all=[...season,...bracket.flat()],g=all.find(g=>g.code===code);
 if(!g)throw Error('This match is not on the league schedule.');if(g.result)return {league:l,changed:false};if(![g.away,g.home].includes(winnerUid)||runs[0]===runs[1])throw Error('Invalid league result.');g.result={runs:[...runs],winner:winnerUid};
 l.seasonJSON=JSON.stringify(season);l.playoffsJSON=JSON.stringify(bracket);
 if(g.stage==='season'&&season.every(x=>x.result)){l.status='playoffs';l.playoffsJSON=JSON.stringify(makePlayoffs(l));}
 if(g.stage==='playoffs'){
  const last=bracket.at(-1);if(last.every(x=>x.result)){
   if(last.length===1){l.status='complete';l.champion=last[0].result.winner;}
   else {const seeds=new Map(bracket[0].flatMap(x=>[[x.home,x.homeSeed],[x.away,x.awaySeed]])),next=[];for(let i=0;i<last.length;i+=2){let a=last[i].result.winner,b=last[i+1].result.winner;if(seeds.get(a)>seeds.get(b))[a,b]=[b,a];const r=bracket.length+1,id=`P${r}-${i/2+1}`;next.push({id,code:`${l.id}-${id}`,home:a,away:b,homeSeed:seeds.get(a),awaySeed:seeds.get(b),round:r,stage:'playoffs',result:null});}bracket.push(next);l.playoffsJSON=JSON.stringify(bracket);}
  }
 }
 return {league:l,changed:true};
}
