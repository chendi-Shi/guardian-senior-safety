import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {bundleStaticEntry} from './static-bundle.mjs';
const destination=resolve('work/huggingface-static');
await mkdir(destination,{recursive:true});
await cp(resolve('dist'),destination,{recursive:true});
const html=await readFile(resolve(destination,'index.html'),'utf8');
const script=(await bundleStaticEntry('app.js')).replace(/<\/script/gi,'<\\/script');
const css=(await readFile(resolve(destination,'style.css'),'utf8')).replace(/<\/style/gi,'<\\/style');
const page=html.replace('<head>','<head><meta name="guardian-runtime" content="static">')
 .replace('<link rel="stylesheet" href="./style.css">',()=>`<style>${css}</style>`)
 .replace('<script type="module" src="./app.js"></script>',()=>`<script>${script}</script>`);
if(page.includes('src="./app.js"')||page.includes('href="./style.css"'))throw new Error('Static entry replacement failed');
await writeFile(resolve(destination,'index.html'),page);
await writeFile(resolve(destination,'README.md'),await readFile('deploy/huggingface-static.md','utf8'));
console.log(`Static Space files: ${destination}`);
