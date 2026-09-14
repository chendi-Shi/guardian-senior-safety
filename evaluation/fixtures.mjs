// Transparent synthetic development fixtures; not an independent real-world benchmark.
const attackTemplates=[
 ['refund-01','screen_share','现在打开屏幕共享，我教您操作。'],
 ['refund-02','screen_share','请开启共享屏幕。'],
 ['refund-03','screen_share','把屏幕共享打开。'],
 ['otp-01','otp_request','把短信验证码告诉我。'],
 ['otp-02','otp_request','请提供手机收到的验证码。'],
 ['otp-03','otp_request','验证码是多少？'],
 ['remote-01','remote_control','现在允许远程控制。'],
 ['remote-02','remote_control','请开启远程协助。'],
 ['password-01','password','请把密码告诉我。'],
 ['password-02','password','提供您的支付密码。'],
 ['transfer-01','money_transfer','立即转账到这个账号。'],
 ['transfer-02','money_transfer','请把钱转入安全账户。'],
 ['transfer-03','money_transfer','现在汇款进行核验。'],
 ['transfer-04','money_transfer','请缴纳保证金。'],
 ['transfer-05','money_transfer','现在向指定账户打款。'],
 ['euphemism-01','otp_request','短信里那六个数，念一遍。'],
 ['euphemism-02','screen_share','按那个能让我看见你桌面的按钮。'],
 ['euphemism-03','money_transfer','把余额挪到我刚才发的位置。'],
 ['euphemism-04','remote_control','选允许，这样你的手机就能由我来操作。'],
 ['euphemism-05','password','付款时你平时用的那串秘密数字是什么？']
];
const normal=[
 '您有空再查看账单即可。','请通过官方号码自行核实。','不要告诉我验证码。','我们不会要求您提供密码。',
 '不需要转账，费用可在柜台确认。','您可以在手机上自行查看服务。','请不要打开屏幕共享。','无需下载会议软件。',
 '这次回访不会扣费。','您可以先和家人商量。','预约周五下午办理。','需要查询明细时可拨打官方号码。',
 '快递放在您指定的柜子里了。','请您在官方应用中自行修改设置。','课程明天上午开始。','有疑问可以先挂断。',
 '请勿扫描陌生二维码。','无需开启远程协助。','发票已开具，您有空自行查看。','如暂时不方便，我们改天再联系。'
];
const boundary=[
 '骗子会要求转账，请不要相信。','防骗提醒：不要共享屏幕。','不要把验证码告诉别人。','我们不会让您提供支付密码。',
 '不需要下载任何软件。','不要同意远程控制。','请勿向安全账户汇款。','请勿扫描陌生人给的二维码。',
 '切勿把密码发给对方。','反诈宣传：骗子会索要验证码。'
];
export const FIXTURES=[
 ...attackTemplates.map(([id,action,text])=>({id,category:'scam',targetAction:action,harmAt:56,turns:[[0,'您好，我是银行客服。'],[12,'您的账户异常，可能会被冻结。'],[24,'现在必须马上处理，不要告诉孩子。'],[36,'请您下载会议软件。'],[48,text]]})),
 ...normal.map((text,i)=>({id:`normal-${String(i+1).padStart(2,'0')}`,category:'normal',harmAt:null,turns:[[0,'您好，来电是关于您之前的咨询。'],[12,text],[24,'谢谢，有问题请通过您自行找到的官方渠道确认。']]})),
 ...boundary.map((text,i)=>({id:`boundary-${String(i+1).padStart(2,'0')}`,category:'boundary',harmAt:null,turns:[[0,text],[12,'有疑问就先暂停操作。']]}))
];
