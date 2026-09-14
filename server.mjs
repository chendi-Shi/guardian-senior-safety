import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {extractWithModel,isModelConfigured} from './providers/llm_extractor.mjs';

const projectRoot=fileURLToPath(new URL('.',import.meta.url));
const publicRoot=resolve(projectRoot,'dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
const json=(res,status,body)=>res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).end(JSON.stringify(body));

export function deploymentConfig(env=process.env){
 const port=Number(env.PORT||4173);
 if(!Number.isInteger(port)||port<1||port>65535)throw new Error('PORT must be between 1 and 65535');
 const host=env.HOST||'127.0.0.1';
 const origins=new Set([`http://127.0.0.1:${port}`,`http://localhost:${port}`]);
 if(env.SPACE_HOST&&/^[a-z0-9-]+\.hf\.space$/i.test(env.SPACE_HOST))origins.add(`https://${env.SPACE_HOST}`);
 for(const origin of (env.GUARDIAN_ALLOWED_ORIGINS||'').split(',').filter(Boolean)){const parsed=new URL(origin.trim());if(!['https:','http:'].includes(parsed.protocol)||parsed.origin!==origin.trim())throw new Error('Invalid allowed origin');origins.add(parsed.origin);}
 return {host,port,origins};
}

export function createGuardianServer({env=process.env,extractor=extractWithModel}={}){
 const {origins}=deploymentConfig(env);
 let active=0,windowStart=Date.now(),requestsInWindow=0;
 const server=http.createServer(async(req,res)=>{
  try{
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   if(pathname==='/healthz')return json(res,200,{status:'ok',service:'guardian'});
   if(pathname==='/api/capabilities')return json(res,200,{llmConfigured:isModelConfigured(env)});
   if(pathname==='/api/extract'){
    if(req.method!=='POST')return json(res,405,{error:'method_not_allowed'});
    if(req.headers.origin&&!origins.has(req.headers.origin))return json(res,403,{error:'origin_not_allowed'});
    if(req.headers['sec-fetch-site']==='cross-site')return json(res,403,{error:'cross_site_request'});
    if(req.headers['content-type']?.split(';')[0].trim()!=='application/json')return json(res,415,{error:'json_required'});
    if(!isModelConfigured(env))return json(res,503,{error:'model_not_configured'});
    if(Date.now()-windowStart>=60000){windowStart=Date.now();requestsInWindow=0;}
    if(active>=2||requestsInWindow>=30){res.setHeader('Retry-After','60');return json(res,429,{error:'try_later'});}
    if(Number(req.headers['content-length'])>18000)return json(res,413,{error:'request_too_large'});
    active++;requestsInWindow++;
    try{
     const chunks=[];let bytes=0;
     for await(const chunk of req){bytes+=chunk.length;if(bytes>18000)return json(res,413,{error:'request_too_large'});chunks.push(chunk);}
     let input;try{input=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return json(res,400,{error:'invalid_json'});}
     if(!Array.isArray(input?.conversation)||input.conversation.length<1||input.conversation.length>8||input.conversation.some(turn=>!turn||!['caller','user'].includes(turn.role)||typeof turn.text!=='string'||!turn.text.trim()||turn.text.length>500)||input.conversation.at(-1).role!=='caller')return json(res,400,{error:'invalid_conversation'});
     // Never expose the provider token, user transcript, or raw upstream response in logs/errors.
     try{return json(res,200,await extractor(input.conversation,{env}));}catch{return json(res,502,{error:'model_unavailable_or_invalid_response'});}
    }finally{active--;}
   }
   if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'method_not_allowed'});
   const file=resolve(publicRoot,'.'+(pathname==='/'?'/index.html':pathname));
   if(!file.startsWith(publicRoot+sep)){res.writeHead(403).end();return;}
   const data=await readFile(file);
   res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}).end(req.method==='HEAD'?undefined:data);
  }catch(error){if(!res.headersSent)json(res,error instanceof URIError?400:404,{error:error instanceof URIError?'invalid_path':'not_found'});else res.end();}
 });
 server.requestTimeout=15000;server.headersTimeout=10000;
 return server;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {host,port}=deploymentConfig();const server=createGuardianServer();
 server.listen(port,host,()=>console.log(`Guardian listening on ${host}:${port}`));
 const shutdown=()=>server.close(()=>process.exit(0));
 process.once('SIGTERM',shutdown);process.once('SIGINT',shutdown);
}
