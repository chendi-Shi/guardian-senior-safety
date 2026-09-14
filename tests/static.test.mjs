import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {bundleStaticEntry} from '../scripts/static-bundle.mjs';
import {Guardian} from '../dist/core/guardian.js';
import {SCENARIOS} from '../dist/scenarios.js';

test('静态打包保留四个场景的每轮分析结果',async()=>{
 const {Guardian:Bundled}=vm.runInNewContext(await bundleStaticEntry('core/guardian.js'),{structuredClone});
 for(const scenario of Object.values(SCENARIOS)){
  const original=new Guardian(),bundled=new Bundled();
  for(const [seconds,text] of scenario.turns){
   const expected=original.process(text,{seconds,source:'script'});
   const actual=bundled.process(text,{seconds,source:'script'});
   assert.deepEqual(JSON.parse(JSON.stringify(actual)),JSON.parse(JSON.stringify(expected)));
  }
 }
});

test('静态应用包是完整且无剩余模块导入的有效脚本',async()=>{
 const script=await bundleStaticEntry('app.js');
 new vm.Script(script);
 assert.doesNotMatch(script,/^\s*(import|export)\s/m);
 assert.match(script,/function renderAbout/);
});
