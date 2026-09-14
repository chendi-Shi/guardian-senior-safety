const severity={install_app:.45,qr:.45,screen_share:.90,remote_control:1,otp_request:1,password:1,money_transfer:1};
const advice={install_app:'先不要按对方要求安装软件',qr:'先不要扫描陌生二维码',screen_share:'请不要共享屏幕',remote_control:'请不要开启远程控制',otp_request:'不要告诉对方验证码',password:'不要告诉对方密码',money_transfer:'先不要转账'};
export function decideIntervention(riskState,signals,graph,previous=null,reportedHarm=false){
 const actions=Object.entries(severity).map(([key,loss])=>({key,score:signals[key]*loss})).sort((a,b)=>b.score-a.score);
 const strongest=actions[0];let score=riskState.risk*strongest.score;
 if(signals.install_app&&graph.orderedEdges>=2)score=Math.max(score,.37);
 const requested=strongest.score>0?strongest.key:null;
 let level=score>=.8?4:score>=.6?3:score>=.35?2:score>=.15?1:0;
 if(reportedHarm)return {level:4,score:Math.max(.85,score),action:'reported_harm',title:'先停止后续操作',reason:'用户自述已执行操作，不能计为损害前介入',speak:true,sticky:true,reportedHarm:true};
 // Keep a critical warning until explicit acknowledgement. A quiet follow-up cannot dismiss it.
 if(previous?.sticky&&level<previous.level)return {...previous,speak:false,held:true};
 const title=requested&&level>0?advice[requested]:'继续倾听';
 const reason=level===0?'保留线索，暂不打断对话':level<=2?'出现操作诱导，先用屏幕提醒':'涉及敏感操作，请先暂停并通过独立渠道核实';
 return {level,score,action:requested,title,reason,speak:level>=3&&!!(previous?.action!==requested||previous?.level<3||previous?.acknowledged),sticky:level>=3,reportedHarm:false};
}
export const POLICY_LABELS=['静默陪伴','轻提示','谨慎操作','语音提醒','请家人确认'];
