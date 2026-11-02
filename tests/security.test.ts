import {test} from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {once} from 'node:events';
import {publicOrigin,requireSameOrigin,safeError} from '../server/security';
test('production origin cannot be guessed from a Host header or use plaintext HTTP',()=>{
 assert.throws(()=>publicOrigin({NODE_ENV:'production'}));assert.throws(()=>publicOrigin({NODE_ENV:'production',PUBLIC_URL:'http://site.test'}));assert.throws(()=>publicOrigin({NODE_ENV:'production',PUBLIC_URL:'https://site.test/extra'}));assert.equal(publicOrigin({NODE_ENV:'production',PUBLIC_URL:'https://site.test'}),'https://site.test');
});
test('cross-origin and missing-origin payment writes are rejected; error responses do not leak details or kill the server',async()=>{
 const app=express();app.use(requireSameOrigin('https://site.test'));app.post('/checkout',(_q,s)=>s.json({allowed:true}));app.get('/error',()=>{throw Error('fictional private detail')});app.get('/health',(_q,s)=>s.json({ok:true}));app.use(safeError);
 const server=app.listen(0,'127.0.0.1');await once(server,'listening');const base='http://127.0.0.1:'+(server.address() as any).port;
 try{assert.equal((await fetch(base+'/checkout',{method:'POST'})).status,403);assert.equal((await fetch(base+'/checkout',{method:'POST',headers:{Origin:'https://evil.test'}})).status,403);assert.equal((await fetch(base+'/checkout',{method:'POST',headers:{Origin:'https://site.test'}})).status,200);const error=await fetch(base+'/error');assert.equal(error.status,500);assert.equal((await error.text()).includes('private detail'),false);assert.equal((await fetch(base+'/health')).status,200);}finally{await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}
});
