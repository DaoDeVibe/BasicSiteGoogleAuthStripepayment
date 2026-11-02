import type {RequestHandler,ErrorRequestHandler} from 'express';
export function publicOrigin(env=process.env){
 const origin=env.PUBLIC_URL;
 if(!origin){if(env.NODE_ENV==='production')throw Error('PUBLIC_URL is required in production.');return 'http://localhost:'+String(env.PORT||5000);}
 const u=new URL(origin);if(u.origin!==origin||u.username||u.password||(env.NODE_ENV==='production'&&u.protocol!=='https:'))throw Error('Configure PUBLIC_URL as an exact HTTPS origin in production.');return u.origin;
}
export function requireSameOrigin(origin:string):RequestHandler{return (q,s,n)=>{
 if(!['GET','HEAD','OPTIONS'].includes(q.method)&&q.get('Origin')!==origin)return void s.status(403).json({message:'Use the website page for this action.'});n();
};}
export const safeError:ErrorRequestHandler=(error,_q,s,_next)=>{
 const status=Number.isInteger(error?.status)&&error.status>=400&&error.status<500?error.status:500;
 s.status(status).json({message:status===500?'Internal Server Error':'Invalid request'});
};
export const apiHeaders:RequestHandler=(_q,s,n)=>{s.set({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});n();};
