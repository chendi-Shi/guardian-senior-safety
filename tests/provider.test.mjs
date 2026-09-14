import test from 'node:test';
import assert from 'node:assert/strict';
import {extractWithModel} from '../providers/llm_extractor.mjs';
const env={GUARDIAN_LLM_URL:'https://example.invalid/chat/completions',GUARDIAN_LLM_KEY:'test-only-token',GUARDIAN_LLM_MODEL:'test-model'};
test('模型返回隐晦动作特征并校验，不进行真实API请求',async()=>{const result=await extractWithModel([{role:'caller',text:'短信里那六个数念一下'}],{env,fetcher:async(url,options)=>{const body=JSON.parse(options.body);assert.equal(body.response_format.type,'json_object');assert.equal(body.messages[0].role,'system');return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({signals:{otp_request:.97}})}}]})};}});assert.equal(result.signals.otp_request,.97);});
test('上游失败与无效JSON不会作为合法模型输出',async()=>{await assert.rejects(extractWithModel([{role:'caller',text:'你好'}],{env,fetcher:async()=>({ok:false,status:429})}));await assert.rejects(extractWithModel([{role:'caller',text:'你好'}],{env,fetcher:async()=>({ok:true,json:async()=>({choices:[{message:{content:'wrong'}}]})})}));});
test('禁止通过非HTTPS发送密钥',async()=>{await assert.rejects(extractWithModel([{role:'caller',text:'你好'}],{env:{...env,GUARDIAN_LLM_URL:'http://example.invalid'}}));});
