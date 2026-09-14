import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {extractWithModel,isModelConfigured} from './providers/llm_extractor.mjs';
const root=resolve('dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(pathname==='/api/capabilities'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify({llmConfigured:isModelConfigured()}));return;}
 if(pathname==='/api/extract'){
  // Bind to loopback, reject cross-origin callers, and never return the configured key or raw upstream errors.
  if(req.method!=='POST'||req.headers['content-type']!=='application/json'||(req.headers.origin&&req.headers.origin!=='http://127.0.0.1:4173')){res.writeHead(403).end();return;}
  if(!isModelConfigured()){res.writeHead(503,{'Content-Type':'application/json'}).end(JSON.stringify({error:'model_not_configured'}));return;}
  let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>18000){res.writeHead(413).end();return;}}
  try{const input=JSON.parse(body);const result=await extractWithModel(input.conversation);res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify(result));}catch{res.writeHead(502,{'Content-Type':'application/json'}).end(JSON.stringify({error:'model_unavailable_or_invalid_response'}));}return;
 }
 const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+sep)){res.writeHead(403).end();return;}const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).end(data);}catch{res.writeHead(404).end('Not found');}}).listen(4173,'127.0.0.1',()=>console.log('Guardian preview: http://127.0.0.1:4173'));
