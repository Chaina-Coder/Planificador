import { getStore } from '@netlify/blobs';
import { timingSafeEqual, createHash } from 'node:crypto';
const headers = {'content-type':'application/json','cache-control':'no-store'};
const reply=(status,body)=>new Response(JSON.stringify(body),{status,headers});
const valid=(a,b)=>{const x=createHash('sha256').update(String(a)).digest();const y=createHash('sha256').update(String(b)).digest();return timingSafeEqual(x,y)};
const types=new Set(['visits','expenses','souvenirs']);
export default async function(req){
  const password=process.env.PLANNER_PASSWORD;
  if(!password)return reply(503,{error:'Configura PLANNER_PASSWORD en Netlify (variables de entorno).'});
  const auth=req.headers.get('authorization')||'';
  if(!auth.startsWith('Bearer ')||!valid(auth.slice(7),password))return reply(401,{error:'Contraseña incorrecta.'});
  const store=getStore({name:'family-trip-data',consistency:'strong'});
  try{
    if(req.method==='GET'){
      const keys=[];let cursor;
      do{const page=await store.list({prefix:'records/', ...(cursor?{cursor}:{})});keys.push(...page.blobs.map(b=>b.key));cursor=page.cursor;}while(cursor);
      const records=await Promise.all(keys.map(async key=>{const value=await store.get(key,{type:'json'});return value?{key,...value}:null}));
      return reply(200,{records:records.filter(Boolean)});
    }
    if(req.method==='POST'){
      const body=await req.json();const {type,id,record,baseVersion,deleted}=body;
      if(type!=='settings'&&!types.has(type))return reply(400,{error:'Tipo inválido'});
      if(typeof id!=='string'||id.length>120||!(/^[\w-]+$/).test(id))return reply(400,{error:'Identificador inválido'});
      if(JSON.stringify(body).length>40000)return reply(413,{error:'Registro demasiado grande'});
      const key=`records/${type}/${id}`;
      const previous=await store.get(key,{type:'json'});
      if((previous?.version||null)!==(baseVersion||null))return reply(409,{error:'Conflicto: el registro cambió en otro dispositivo.',current:previous||null});
      const version=crypto.randomUUID();
      const next={type,id,record:deleted?null:record,deleted:!!deleted,version,updatedAt:new Date().toISOString()};
      await store.setJSON(key,next);
      return reply(200,{saved:next});
    }
    return reply(405,{error:'Método no permitido'});
  }catch(err){console.error(err);return reply(500,{error:'Error al acceder al almacenamiento.'});}
}
export const config={path:'/api/data'};
