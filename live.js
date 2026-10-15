import {clone,applyRoll} from './engine.js';
// An append-only deterministic animation queue, separate from the committed match state.
export class TurnFeed {
 constructor(seq,by,start){this.seq=seq;this.by=by;this.start=clone(start);this.state=clone(start);this.rolls=[];this.played=0;this.log=[];this.ended=false;}
 update(rolls){
  if(!Array.isArray(rolls)||rolls.length>2000)throw Error('Invalid live turn.');
  const common=Math.min(this.rolls.length,rolls.length);
  for(let i=0;i<common;i++)if(JSON.stringify(this.rolls[i].dice)!==JSON.stringify(rolls[i].dice))throw Error('Live rolls changed unexpectedly.');
  if(rolls.length<=this.rolls.length)return false;
  let state=clone(this.start),ended=false;
  for(const r of rolls){if(ended)throw Error('Live turn contains extra rolls.');const result=applyRoll(state,r.dice);state=result.state;ended=result.event.endTurn;}
  this.rolls=clone(rolls);this.ended=ended;return true;
 }
 next(){if(this.played>=this.rolls.length)return null;const before=clone(this.state),result=applyRoll(before,this.rolls[this.played].dice);this.state=result.state;this.played++;this.log.push({...result.event,inning:before.inning,half:before.half});return {before,result,index:this.played};}
 skip(){while(this.next());return this.state;}
}
