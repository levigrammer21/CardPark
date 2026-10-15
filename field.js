import {batter} from './engine.js';
const POS={0:[50,88],1:[75,63],2:[50,39],3:[25,63],4:[50,88]};
const DEF=[[50,60],[51,96],[73,43],[31,25]];
const PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function cardHTML(p,team){const photo=typeof p.photo==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(p.photo)?p.photo:'';const color=/^#[\da-f]{6}$/i.test(team.color)?team.color:'#34644b';return `<div class="card" style="--team:${color}"><div class="portrait">${photo?`<img src="${photo}" alt="" draggable="false">`:esc(p.icon||'⚾')}<span class="number">${esc(p.number)}</span></div><div class="player-name">${esc(p.name)}</div></div>`;}
export function dieHTML(n=1){return `<div class="die" aria-label="Die ${n}">${Array.from({length:9},(_,i)=>`<i style="visibility:${PIPS[n].includes(i)?'visible':'hidden'}"></i>`).join('')}</div>`;}
export const fieldSVG=`<svg viewBox="0 0 800 606" preserveAspectRatio="none" aria-hidden="true"><defs><pattern id="grass" width="110" height="110" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="110" height="110" fill="#34634c"/><rect width="55" height="110" fill="#396c50"/></pattern><pattern id="seats" width="18" height="15" patternUnits="userSpaceOnUse"><rect x="3" y="3" width="10" height="6" rx="2" fill="#d6c9a7" opacity=".24"/></pattern><radialGradient id="vignette"><stop offset=".4" stop-color="#183c2a" stop-opacity="0"/><stop offset="1" stop-color="#142b21" stop-opacity=".4"/></radialGradient></defs><rect width="800" height="606" fill="#183b32"/><path d="M-30 225 Q400 -195 830 225 L830 -20 L-30 -20Z" fill="url(#seats)"/><path d="M15 214 Q400 -135 785 214" stroke="#9dbaa0" stroke-width="4" fill="none"/><path d="M400 550 L32 220 Q400 -105 768 220Z" fill="url(#grass)"/><path d="M400 550 L32 220 Q400 -105 768 220Z" fill="url(#vignette)"/><path d="M400 550 L32 220 M400 550 L768 220" stroke="#e6e4c4" stroke-width="2" opacity=".7"/><path d="M400 551 L168 370 Q400 91 632 370Z" fill="#ba9764"/><path d="M400 529 L227 381 L400 234 L573 381Z" fill="#477655"/><path d="M400 533 L600 382 L400 236 L200 382Z" fill="none" stroke="#e8d7b1" stroke-width="2"/><ellipse cx="400" cy="364" rx="31" ry="20" fill="#c7a272"/><rect x="390" y="361" width="20" height="5" rx="1" fill="#f3e7c9"/><g fill="#fff7db" stroke="#c3b28c" stroke-width="1"><rect x="591" y="374" width="15" height="15" transform="rotate(45 598 381)"/><rect x="392" y="228" width="15" height="15" transform="rotate(45 399 235)"/><rect x="191" y="374" width="15" height="15" transform="rotate(45 198 381)"/><path d="M391 528 L409 528 L409 538 L400 546 L391 538Z"/></g><path d="M367 535 h-23 v27 h23 M433 535 h23 v27 h-23" fill="none" stroke="#e7dbba" stroke-width="1.5" opacity=".6"/><path d="M54 432 L140 508" stroke="#dfcfaa" stroke-width="7" opacity=".4"/><path d="M660 508 L746 432" stroke="#dfcfaa" stroke-width="7" opacity=".4"/></svg>`;
let speed=1,soundOn=false,audio;
export function setSpeed(x){speed=x;}
export function setSound(x){soundOn=x;}
function tone(freq,duration=.08,type='sine',vol=.07){if(!soundOn)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(vol,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch{}}
export function clickSound(){tone(500,.04,'triangle');}
const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait=ms=>new Promise(r=>setTimeout(r,reduce()?Math.min(ms,60):ms/speed));
export function paintField(el,s,teams){
 el.innerHTML=fieldSVG+`<div class="field-label">CARDPARK BALL CLUB</div><span class="distance">400</span><div class="play-call" id="playCall"></div>`;
 const offense=s.half,defense=1-offense;
 DEF.forEach((pos,id)=>addToken(el,teams[defense].players[id],teams[defense],pos,`def-${id}`,''));
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
 tone(250,.07,'triangle');await travel(ball,[[50,60],[50,70],[50,88]],330);
 if(!el.isConnected)return;
 if(!['BB','K'].includes(e.code)){
  tone(850,.06,'square',.035);
  const target=['HR'].includes(e.code)?[60,-7]:['FO','PO','SF'].includes(e.code)?[31,25]:['GO','DP'].includes(e.code)?[73,43]:[20+(before.plays*17)%60,18];
  const dest=['FO','PO','SF'].includes(e.code)?el.querySelector('[data-key="def-3"]'):el.querySelector('[data-key="def-2"]');
  if(dest){dest.classList.add('fielding');travel(dest,[['FO','PO','SF'].includes(e.code)?DEF[3]:DEF[2],target],520);}
  await travel(ball,[[50,88],[target[0],Math.max(2,target[1]-18)],target],600);
 }else await wait(130);
 ball.remove();
 const call=el.querySelector('#playCall');call.innerHTML=`<strong>${esc(e.label)}${e.code==='HR'?'!':''}</strong><small>${esc(teams[e.team].players[e.batter].name)}${e.runs?` • ${e.runs} run${e.runs>1?'s':''}`:''}</small>`;call.classList.add('show');
 if(e.runs){[523,659,784].forEach((f,i)=>setTimeout(()=>tone(f,.18,'triangle'),i*90));}
 if(e.code==='HR'){for(let i=0;i<26;i++){const c=document.createElement('i');c.className='confetti';c.style.cssText=`left:${15+Math.random()*70}%;background:${['#e5eda2','#e4864c','#fff7da'][i%3]};--dx:${Math.random()*160-80}px`;el.append(c);}}
 await Promise.all(e.moves.map(async m=>{const token=el.querySelector(`[data-key="run-${m.id}"]`);if(!token)return;token.classList.add('running');const points=[POS[m.from]];for(let b=m.from+1;b<=Math.min(4,m.to);b++)points.push(POS[b]);await travel(token,points,Math.max(1,points.length-1)*470);token.classList.remove('running');if(m.to>=4)token.style.opacity='0';}));
 e.retired.forEach(id=>el.querySelector(`[data-key="run-${id}"]`)?.classList.add('out'));
 if(e.retired.length)tone(190,.16,'triangle');
 await wait(650);call.classList.remove('show');await wait(120);
}
export async function animateDice(container,dice){
 const end=performance.now()+(reduce()?100:480/speed);
 container.innerHTML=dieHTML(1)+dieHTML(1);container.querySelectorAll('.die').forEach(x=>x.classList.add('rolling'));
 while(performance.now()<end){container.innerHTML=[0,1].map(()=>dieHTML(Math.floor(Math.random()*6)+1).replace('class="die"','class="die rolling"')).join('');tone(180+Math.random()*300,.025,'triangle',.025);await new Promise(r=>setTimeout(r,65));}
 container.innerHTML=dice.map(dieHTML).join('');await wait(160);
}
