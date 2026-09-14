import {extractSignals,validateSignals} from './signal_extractor.js';
import {emptyGraph,updateGraph,predictNext} from './scam_graph.js';
import {updateRisk} from './risk_engine.js';
import {decideIntervention} from './intervention_policy.js';
export class Guardian{
 constructor(){this.reset();}
 reset(){this.history=[];this.graph=emptyGraph();this.risk={risk:0};this.policy=null;this.predictions=[];this.acknowledged=false;}
 acknowledge(){if(this.policy)this.policy={...this.policy,sticky:false,speak:false,acknowledged:true};this.acknowledged=true;}
 process(text,{role='caller',seconds=0,source='manual',features=null}={}){
  if(!Number.isFinite(seconds)||seconds<0)throw new TypeError('Invalid event time');
  if(seconds<(this.history.at(-1)?.seconds??0))throw new TypeError('Event times must be monotonic');
  const extracted=extractSignals(text,role); // also validates input, speaker, and self-reported action
  if(features&&role==='caller'){extracted.signals=validateSignals(features);extracted.provider='external-features';extracted.evidence=[];}
  const signals=extracted.signals;const turn=this.history.length+1;
  const hit=this.predictions.length>0&&role==='caller'&&signals[this.predictions[0].action]>0;
  if(role==='caller')this.graph=updateGraph(this.graph,signals,turn);
  this.risk=updateRisk(this.risk,signals,this.graph,role);
  this.policy=decideIntervention(this.risk,signals,this.graph,this.policy,extracted.reportedHarm);
  if(role==='caller')this.predictions=predictNext(signals,this.graph);
  const event={turn,text,role,seconds,source,...extracted,risk:{...this.risk},graph:structuredClone(this.graph),policy:{...this.policy},predictions:[...this.predictions],predictionHit:hit};
  this.history.push(event);return event;
 }
 export(){return {schemaVersion:1,product:'Guardian',mode:this.history.some(e=>e.provider==='external-features')?'mixed-external-features':'offline-rules',scoreMeaning:'heuristic_not_probability',callIntegration:false,familyNotification:'same_page_simulation',events:this.history};}
}
