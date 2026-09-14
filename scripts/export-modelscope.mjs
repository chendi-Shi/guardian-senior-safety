import {copyFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import './export-static.mjs';

const destination=resolve('work/modelscope-static');
await mkdir(destination,{recursive:true});
await copyFile('work/huggingface-static/index.html',resolve(destination,'index.html'));
await copyFile('deploy/modelscope-static.md',resolve(destination,'README.md'));
await copyFile('deploy/modelscope-static.json',resolve(destination,'ms_deploy.json'));
console.log(`ModelScope Static files: ${destination}`);
