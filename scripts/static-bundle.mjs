import {readFile} from 'node:fs/promises';
import {resolve,dirname,relative,sep} from 'node:path';

// Bundles this project's named, synchronous ES modules without dependencies.
// Keeping the script inside the HTML avoids authenticated subresource requests
// when a private Static Space is embedded with third-party cookies restricted.
export async function bundleStaticEntry(entry,root=resolve('dist')){
 const modules=new Map(),visiting=new Set();
 async function visit(file){
  file=resolve(file);
  const path=relative(root,file);
  if(path==='..'||path.startsWith('..'+sep))throw new Error('Module outside dist');
  if(modules.has(file))return;
  if(visiting.has(file))throw new Error('Circular static imports are unsupported');
  visiting.add(file);
  let source=await readFile(file,'utf8');
  const imports=[...source.matchAll(/^import\s*\{([\w\s,]+)\}\s*from\s*['"]([^'"]+)['"];?\r?$/gm)];
  for(const match of imports){
   if(!match[2].startsWith('./'))throw new Error('Only relative imports are supported');
   const dependency=resolve(dirname(file),match[2]);
   await visit(dependency);
   source=source.replace(match[0],`const {${match[1]}}=modules[${JSON.stringify(relative(root,dependency))}];`);
  }
  const exports=[];
  source=source.replace(/^export\s+(const|let|function|class)\s+(\w+)/gm,(_,kind,name)=>{exports.push(name);return `${kind} ${name}`;});
  if(/^\s*(import|export)\s/m.test(source))throw new Error('Unsupported module syntax');
  modules.set(file,`modules[${JSON.stringify(path)}]=(()=>{\n${source}\nreturn {${exports.join(',')}};\n})();`);
  visiting.delete(file);
 }
 const file=resolve(root,entry);
 await visit(file);
 return `(()=>{\n'use strict';\nconst modules=Object.create(null);\n${[...modules.values()].join('\n')}\nreturn modules[${JSON.stringify(relative(root,file))}];\n})();`;
}
