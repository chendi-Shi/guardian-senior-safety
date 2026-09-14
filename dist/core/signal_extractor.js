/** Feature mapping only. Rules are the offline provider, not a trained LLM. */
export const SIGNAL_LABELS={authority:'自称权威',fear:'损失恐吓',urgency:'催促操作',isolation:'隔离家属',reward:'收益诱惑',install_app:'安装软件',screen_share:'屏幕共享',otp_request:'索要验证码',money_transfer:'要求转账',password:'索要密码',qr:'扫描二维码',remote_control:'远程控制'};
export const ACTIONS=['install_app','screen_share','otp_request','money_transfer','password','qr','remote_control'];
const rules={
 authority:[/(?:我是|这里是|我们是|本人是|这边是|自称).{0,18}(?:客服|公安|警官|警察|检察院|法院|银行|工作人员|经理)/,.75],
 fear:[/扣(?:除|费|款|钱|\d)|账户.{0,6}异常|涉嫌|洗钱|冻结|逮捕|影响征信|账户异常|扣.{0,5}元/,.85],
 urgency:[/马上|立刻|现在|今天.{0,12}(?:处理|扣|转)|不处理|立即|限时|最后.{0,3}(?:机会|分钟)/,.78],
 isolation:[/(?:不要|不能|不许|别).{0,8}(?:告诉|联系|通知).{0,8}(?:孩子|家人|女儿|儿子|家属)|保密|独自操作/,.95],
 reward:[/稳赚|保本|高收益|翻倍|返利|保证收益|内部投资|收益.{0,4}(?:%|百分)/,.85],
 install_app:[/(?:下载|安装|装一个).{0,15}(?:软件|会议|APP|app|应用|客户端)|(?:软件|会议|APP|应用).{0,6}(?:下载|安装)/,.86],
 screen_share:[/(?:打开|开启|开始|点击|进行|请|把).{0,12}(?:共享屏幕|屏幕共享)|(?:共享屏幕|屏幕共享).{0,8}(?:打开|开启|开始)|共享.{0,4}(?:你的|您的|手机)?屏幕/,.98],
 otp_request:[/(?:把|告诉|发给|提供|报给|念|读出|发送).{0,20}验证码|验证码.{0,14}(?:告诉|发给|报给|念|读给|提供|是多少)/,.99],
 money_transfer:[/(?:转账|汇款|转入|打款|转到|转钱|追加投资|充值|缴纳保证金)|安全账户/,.95],
 password:[/(?:告诉|发给|提供|报给|把|输入).{0,15}(?:密码|口令)|(?:密码|口令).{0,10}(?:告诉|发给|提供)/,.99],
 qr:[/(?:扫描|扫一下|识别|扫这个).{0,10}(?:二维码|码)/,.75],
 remote_control:[/(?:打开|开启|同意|允许|接受|授权).{0,12}(?:远程控制|远程协助)|(?:远程控制|远程协助).{0,8}(?:打开|开启|权限)/,.99]
};
export function validateSignals(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new TypeError('Signals must be an object');
 const out={};for(const key of Object.keys(SIGNAL_LABELS)){const value=input[key]??0;if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>1)throw new TypeError(`Invalid signal: ${key}`);out[key]=value;}return out;
}
function isProtective(clause){return /(?:不要|不用|无需|不必|不需要|不能|切勿|千万别|请勿|别给|不会要求|不会让|不用再|不得|别把|别告诉|拒绝).{0,28}(?:下载|安装|共享|验证码|转账|汇款|转入|密码|二维码|远程|充值)|(?:防骗提醒|反诈宣传|诈骗案例|骗子会|诈骗者会|例如骗子)/.test(clause);}
export function extractSignals(text,role='caller'){
 if(typeof text!=='string'||!text.trim()||text.length>500)throw new TypeError('Text must contain 1–500 characters');
 if(!['caller','user'].includes(role))throw new TypeError('Unknown speaker');
 const signals=Object.fromEntries(Object.keys(SIGNAL_LABELS).map(key=>[key,0]));
 const reportedHarm=role==='user'&&/(?:已经|刚刚|已).{0,14}(?:转账|转了|汇款|共享|开启远程|(?:发给|告诉|给了|发送).{0,12}(?:验证码|密码)|(?:验证码|密码).{0,12}(?:发给|告诉|给了|发送))/.test(text);
 if(role==='user')return {signals,evidence:[],reportedHarm,provider:'offline-rules-v1'};
 const clauses=text.split(/[，,。；;！!？?\n]+/).filter(Boolean);const evidence=[];
 for(const clause of clauses){if(isProtective(clause))continue;for(const [key,[pattern,strength]]of Object.entries(rules)){if(pattern.test(clause)){signals[key]=Math.max(signals[key],strength);evidence.push({signal:key,strength,text:clause});}}}
 return {signals:validateSignals(signals),evidence,reportedHarm,provider:'offline-rules-v1'};
}
