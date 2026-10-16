import {ballparkSVG} from './ballpark.js';
import {configureAudio,soundFX} from './audio.js';
import {batter} from './engine.js';
const POS={0:[50,88],1:[75,63],2:[50,39],3:[25,63],4:[50,88]};
const DEF=[[50,60],[51,96],[73,43],[31,25]];
export function defensiveLineup(state){const shift=Math.max(0,(state.inning||1)-1)%4;return DEF.map((position,slot)=>({id:(slot+shift)%4,slot,role:['P','C','IF','OF'][slot],position}));}
const PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function cardHTML(p,team){const photo=typeof p.photo==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(p.photo)?p.photo:'';const color=/^#[\da-f]{6}$/i.test(team.color)?team.color:'#34644b';return `<div class="card" style="--team:${color}"><div class="portrait">${photo?`<img src="${photo}" alt="" draggable="false">`:esc(p.icon||'⚾')}<span class="number">${esc(p.number)}</span></div><div class="player-name">${esc(p.name)}</div></div>`;}
export function dieHTML(n=1){return `<div class="die" aria-label="Die ${n}">${Array.from({length:9},(_,i)=>`<i style="visibility:${PIPS[n].includes(i)?'visible':'hidden'}"></i>`).join('')}</div>`;}
export const fieldSVG=ballparkSVG;
let speed=1;
export function setSpeed(x){speed=x;}
export function setSound(x){configureAudio({enabled:x});}
export function clickSound(){soundFX('click');}
const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait=ms=>new Promise(r=>setTimeout(r,reduce()?Math.min(ms,60):ms/speed));
export function paintField(el,s,teams){
 el.innerHTML=fieldSVG+`<div class="play-call" id="playCall"></div>`;
 const offense=s.half,defense=1-offense;
 defensiveLineup(s).forEach(({position,id,role})=>{const token=addToken(el,teams[defense].players[id],teams[defense],position,`def-${id}`,'');token.dataset.position=role;token.setAttribute('aria-label',teams[defense].players[id].name+' · '+role);});
 s.bases.forEach((id,i)=>{if(id!==null)addToken(el,teams[offense].players[id],teams[offense],POS[i+1],`run-${id}`,'');});
 if(!s.over)addToken(el,teams[offense].players[batter(s)],teams[offense],POS[0],`run-${batter(s)}`,'batting');
}
function addToken(el,p,t,pos,key,extra){const d=document.createElement('div');d.className='token '+extra;d.dataset.key=key;d.style.left=pos[0]+'%';d.style.top=pos[1]+'%';d.innerHTML=cardHTML(p,t);el.append(d);return d;}
async function travel(el,points,duration){
 if(!el?.isConnected)return;
 const frames=points.map(([x,y],i)=>({left:x+'%',top:y+'%',offset:i/(points.length-1)}));
 if(el.animate&&!reduce()){const a=el.animate(frames,{duration:duration/speed,easing:'linear',fill:'forwards'});await a.finished.catch(()=>{});a.cancel();}
 else await wait(50);
 const end=points.at(-1);el.style.left=end[0]+'%';el.style.top=end[1]+'%';
}
export async function animatePlay(el,before,result,teams){
 const e=result.event;paintField(el,before,teams);
 const ball=document.createElement('div');ball.className='ball';el.append(ball);
 soundFX('pitch');await travel(ball,[[50,60],[50,70],[50,88]],330);
 if(!el.isConnected)return;
 if(!['BB','K'].includes(e.code)){
  soundFX(e.mode==='bunt'?'bunt':'bat');
  const target=e.mode==='bunt'?[53,76]:['HR'].includes(e.code)?[60,-7]:['FO','PO','SF'].includes(e.code)?[31,25]:['GO','DP'].includes(e.code)?[73,43]:[20+(before.plays*17)%60,18];
  const slot=e.mode==='bunt'?0:['FO','PO','SF'].includes(e.code)?3:2,assignment=defensiveLineup(before)[slot],dest=el.querySelector(`[data-key="def-${assignment.id}"]`);
  if(dest){dest.classList.add('fielding');travel(dest,[assignment.position,target],520);}
  await travel(ball,e.mode==='bunt'?[[50,88],[51,82],target]:[[50,88],[target[0],Math.max(2,target[1]-18)],target],e.mode==='bunt'?430:600);
 }else {soundFX('catch');await wait(130);}
 ball.remove();
 const call=el.querySelector('#playCall');call.innerHTML=`<strong>${e.clutch?'CLUTCH · ':''}${esc(e.label)}${e.code==='HR'?'!':''}</strong><small>${esc(teams[e.team].players[e.batter].name)}${e.runs?` • ${e.runs} run${e.runs>1?'s':''}`:''}</small>`;call.classList.add('show');
 if(e.code==='HR')soundFX('homerun');else if(e.runs)soundFX('run');else if(['1B','2B','3B','BH'].includes(e.code))soundFX('hit');else if(e.code==='BB')soundFX('walk');
 if(e.code==='HR'){for(let i=0;i<26;i++){const c=document.createElement('i');c.className='confetti';c.style.cssText=`left:${15+Math.random()*70}%;background:${['#e5eda2','#e4864c','#fff7da'][i%3]};--dx:${Math.random()*160-80}px`;el.append(c);}}
 if(e.moves.length)soundFX('steps');
 await Promise.all(e.moves.map(async m=>{const token=el.querySelector(`[data-key="run-${m.id}"]`);if(!token)return;token.classList.add('running');const points=[POS[m.from]];for(let b=m.from+1;b<=Math.min(4,m.to);b++)points.push(POS[b]);await travel(token,points,Math.max(1,points.length-1)*470);token.classList.remove('running');if(m.to>=4)token.style.opacity='0';}));
 e.retired.forEach(id=>el.querySelector(`[data-key="run-${id}"]`)?.classList.add('out'));
 if(e.retired.length){soundFX('catch');soundFX(e.code==='K'?'strikeout':'out');}
 if(result.state.over)soundFX('win');else if(e.endTurn)soundFX('side');
 await wait(650);call.classList.remove('show');await wait(120);
}
export async function animateDice(container,dice,options={}){
 const mode=options.mode||'swing',field=document.querySelector('#field'),stage=document.createElement('div');stage.className='dice-theater';stage.setAttribute('aria-hidden','true');
 const title=options.clutch?'CLUTCH REROLL':mode==='bunt'?'BUNT':'AT BAT';
 stage.innerHTML=`<div class="theater-label">${title}</div><div class="theater-dice"></div><div class="theater-result">ROLLING</div>`;const bounds=field?.getBoundingClientRect?.();if(field&&(!bounds||(bounds.top>=-bounds.height*.35&&bounds.bottom<=window.innerHeight+bounds.height*.2)))field.append(stage);else {stage.classList.add('floating');document.body.append(stage);}
 container.classList.add('is-rolling');
 const result=document.querySelector('#diceResult');if(result)result.textContent='Rolling';
 const end=performance.now()+(reduce()?100:Math.max(650,1050/speed));
 const faces=(values,rolling)=>values.map(n=>dieHTML(n).replace('class="die"',`class="die${rolling?' rolling':''}"`)).join('');
 try{
  while(performance.now()<end){const values=[0,1].map(()=>Math.floor(Math.random()*6)+1);container.innerHTML=faces(values,true);stage.querySelector('.theater-dice').innerHTML=faces(values,true);soundFX('dice');await new Promise(r=>setTimeout(r,80));}
  container.innerHTML=faces(dice,false);stage.querySelector('.theater-dice').innerHTML=faces(dice,false);stage.classList.add('settled');
  const total=dice[0]+dice[1],label=mode==='bunt'?(total%2===0?'BUNT SINGLE':'BATTER OUT'):`${dice[0]} + ${dice[1]} = ${total}`;
  stage.querySelector('.theater-result').textContent=label;if(result)result.textContent=mode==='bunt'?label:`${dice[0]} + ${dice[1]} = ${total}`;
  soundFX('settle');await wait(360);
 }finally{container.classList.remove('is-rolling');stage.remove();}
}
