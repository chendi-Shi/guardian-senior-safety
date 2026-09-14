import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const destination=resolve('work/huggingface-static');
await mkdir(destination,{recursive:true});
await cp(resolve('dist'),destination,{recursive:true});
const html=await readFile(resolve(destination,'index.html'),'utf8');
await writeFile(resolve(destination,'index.html'),html.replace('<head>','<head><meta name="guardian-runtime" content="static">'));
await writeFile(resolve(destination,'README.md'),await readFile('deploy/huggingface-static.md','utf8'));
console.log(`Static Space files: ${destination}`);
