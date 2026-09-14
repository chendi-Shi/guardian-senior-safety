/** Ordered graph state, with evidence persistence and distinct observed stages. */
export const STAGES=['建立身份','制造问题','施加压力','诱导操作','危险动作'];
export const PREDICTION_LABELS={screen_share:'屏幕共享',otp_request:'索要验证码',money_transfer:'要求转账',remote_control:'远程控制',install_app:'安装软件',other:'其他动作'};
export function emptyGraph(){return {visited:{},events:[],score:0,current:-1,orderedEdges:0};}
export function updateGraph(previous,signals,turn){
 const graph={...previous,visited:{...previous.visited},events:[...previous.events]};
 const hits=[signals.authority>0,signals.fear>0||signals.reward>0,signals.urgency>0||signals.isolation>0,signals.install_app>0||signals.qr>0,Math.max(signals.screen_share,signals.otp_request,signals.money_transfer,signals.password,signals.remote_control)>0];
 hits.forEach((hit,index)=>{if(hit&&!(index in graph.visited)){graph.visited[index]=turn;graph.events.push({stage:index,turn});}});
 const seen=Object.keys(graph.visited).map(Number).sort((a,b)=>a-b);graph.current=seen.length?Math.max(...seen):-1;
 // Only cross-turn progression earns the sequence bonus; one sentence is not a complete temporal chain.
 const ordered=seen.slice(1).reduce((n,stage,i)=>n+(graph.visited[seen[i]]<graph.visited[stage]?1:0),0);
 graph.orderedEdges=ordered;graph.score=Math.min(.98,seen.length*.09+ordered*.12+(ordered>=3?.12:0));return graph;
}
export function predictNext(signals,graph){
 let weights=[];
 if(signals.screen_share)weights=[['otp_request',60],['money_transfer',25],['other',15]];
 else if(signals.install_app)weights=[['screen_share',61],['remote_control',23],['otp_request',16]];
 else if(signals.isolation)weights=[['money_transfer',65],['install_app',20],['other',15]];
 else if(signals.otp_request||signals.password)weights=[['money_transfer',75],['other',25]];
 else if(signals.money_transfer)weights=[['money_transfer',55],['other',45]];
 else if(graph.current>=1)weights=[['install_app',50],['money_transfer',30],['other',20]];
 return weights.map(([action,weight])=>({action,label:PREDICTION_LABELS[action],weight,kind:'heuristic_weight'}));
}
