import {extractWithModel} from '../providers/llm_extractor.mjs';
import {Guardian} from '../dist/core/guardian.js';
const text=process.argv[2];if(!text){console.error('Usage: node --env-file=.env scripts/model_demo.mjs "一句虚构对话"');process.exitCode=1;}else{try{const {signals}=await extractWithModel([{role:'caller',text}]);const g=new Guardian();console.log(JSON.stringify(g.process(text,{features:signals,source:'model-cli'}),null,2));}catch(error){console.error(error.message);process.exitCode=1;}}
