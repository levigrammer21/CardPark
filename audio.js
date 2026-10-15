// Original synthesized ballpark soundscape; no downloads or audio assets required.
let ctx,master,ambience,ambientFilter,enabled=true,volume=.8,crowd=true,inPark=false,noise;
const muted=()=>!enabled||!ctx||ctx.state!=='running'||(typeof document!=='undefined'&&document.hidden);
function init(){if(ctx)return;const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Context)return;ctx=new Context();master=ctx.createGain();master.gain.value=enabled?volume:0;const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-13;limiter.knee.value=18;limiter.ratio.value=5;master.connect(limiter);limiter.connect(ctx.destination);noise=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate);const d=noise.getChannelData(0);let brown=0;for(let i=0;i<d.length;i++){brown=(brown+Math.random()*.12-.06)/1.02;d[i]=brown*2.8+(Math.random()*2-1)*.14;}}
export function unlockAudio(){try{init();if(!ctx)return;if(ctx.state==='suspended')ctx.resume().then(syncAmbience).catch(()=>{});else syncAmbience();}catch{}}
export function configureAudio(options={}){if('enabled'in options)enabled=options.enabled;if('volume'in options)volume=Math.max(0,Math.min(1,options.volume));if('crowd'in options)crowd=options.crowd;if(master){master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(enabled?volume:0,ctx.currentTime,.03);}syncAmbience();}
export function parkAudio(active){inPark=active;if(master)master.gain.setTargetAtTime(enabled&&!document.hidden?volume:0,ctx.currentTime,.03);syncAmbience();}
function syncAmbience(){if(!ctx)return;const should=inPark&&enabled&&crowd&&!document.hidden&&ctx.state==='running';if(should&&!ambience){ambience=ctx.createBufferSource();ambience.buffer=noise;ambience.loop=true;ambientFilter=ctx.createBiquadFilter();ambientFilter.type='lowpass';ambientFilter.frequency.value=1100;const gain=ctx.createGain();gain.gain.value=.095;ambience.connect(ambientFilter);ambientFilter.connect(gain);gain.connect(master);ambience.start();ambience._gain=gain;}else if(!should&&ambience){ambience.stop();ambience.disconnect();ambientFilter.disconnect();ambience._gain.disconnect();ambience=null;}}
function tone(f,duration=.12,type='triangle',level=.2,delay=0,end=f){if(muted())return;const at=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,at);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),at+duration);g.gain.setValueAtTime(.001,at);g.gain.exponentialRampToValueAtTime(Math.max(.002,level),at+.007);g.gain.exponentialRampToValueAtTime(.001,at+duration);o.connect(g);g.connect(master);o.start(at);o.stop(at+duration+.02);}
function burst(duration,level,frequency=1100,type='bandpass',delay=0){if(muted())return;const at=ctx.currentTime+delay,n=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();n.buffer=noise;f.type=type;f.frequency.value=frequency;f.Q.value=.7;g.gain.setValueAtTime(.001,at);g.gain.exponentialRampToValueAtTime(level,at+.015);g.gain.exponentialRampToValueAtTime(.001,at+duration);n.connect(f);f.connect(g);g.connect(master);n.start(at,Math.random()*2);n.stop(at+duration+.03);}
function organ(notes,step=.14){notes.forEach((n,i)=>{tone(n,.32,'triangle',.18,i*step);tone(n*2,.24,'sine',.045,i*step);});}
function cheer(big=false){if(!crowd)return;burst(big?2.7:1.5,big?.95:.6,800,'bandpass');burst(big?2.1:1.2,.35,1850,'bandpass',.12);for(let i=0;i<(big?20:10);i++){burst(.05,.23,1900,'highpass',.12+i*.09+Math.random()*.08);}tone(1000,.33,'sine',.035,.3,1600);}
export function soundFX(name){if(muted())return;switch(name){
 case 'click':tone(540,.05,'triangle',.12);break;
 case 'dice':burst(.055,.65,2200,'highpass');tone(260+Math.random()*280,.04,'triangle',.2);break;
 case 'settle':burst(.09,.7,1250,'bandpass');tone(140,.08,'triangle',.16);break;
 case 'pitch':burst(.27,.28,950,'bandpass');break;
 case 'bunt':burst(.065,.62,1600,'highpass');tone(235,.065,'triangle',.22,0,95);break;
 case 'bat':burst(.085,1.5,2300,'highpass');tone(290,.08,'triangle',.6,0,80);break;
 case 'catch':burst(.10,.8,650,'lowpass');tone(120,.08,'sine',.4,0,60);break;
 case 'steps':for(let i=0;i<5;i++)burst(.045,.18,260,'lowpass',i*.12);break;
 case 'out':tone(300,.15,'triangle',.25,0,150);break;
 case 'strikeout':tone(950,.30,'sine',.1,0,280);tone(100,.14,'triangle',.25,.13);break;
 case 'walk':organ([330,440],.12);break;
 case 'hit':cheer(false);break;
 case 'run':organ([523,659,784],.13);cheer(false);break;
 case 'homerun':organ([392,523,659,784,1047],.14);cheer(true);break;
 case 'side':organ([392,330,262],.11);break;
 case 'yourturn':organ([523,659,784,659],.1);break;
 case 'win':organ([523,659,784,1047,784,1047],.18);cheer(true);break;
 }}
