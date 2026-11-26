'use strict';

const crypto = require('node:crypto');
const ORIGIN = 'https://www.chicanito.app';
const CALLBACK = ORIGIN + '/tiktok-callback.html';
const API = '/api/tiktok-sandbox';
const SCOPES = 'user.info.basic,video.upload';
const MAX = 4_000_000;
const SESSION = '__Host-chicanito-sandbox';
const STATE = '__Host-chicanito-tiktok-state';
const UPLOAD_HOSTS = new Set(['open-upload.tiktokapis.com','upload.us.tiktokapis.com','upload.tiktokapis.com']);

const rand = () => crypto.randomBytes(32).toString('base64url');
const hash = s => crypto.createHash('sha256').update(s).digest();
const eq = (a,b) => typeof a==='string' && typeof b==='string' && crypto.timingSafeEqual(hash(a),hash(b));
const asText = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const machine = s => typeof s==='string' && /^[a-zA-Z0-9~_.-]{1,80}$/.test(s) ? s : '';
const cookie = (name,value,age) => name+'='+value+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age='+age;

function createHandler({env=process.env,fetch:remote=globalThis.fetch,save,load,remove,reserve}={}) {
  const key=Buffer.from(env.TIKTOK_SANDBOX_SESSION_KEY || '', 'base64');
  const settings=key.length===32 && /^sbaw/.test(env.TIKTOK_SANDBOX_CLIENT_KEY||'') &&
    !!env.TIKTOK_SANDBOX_CLIENT_SECRET && (env.TIKTOK_SANDBOX_ADMIN_PASSWORD||'').length>=24 &&
    !!env.TIKTOK_SANDBOX_DATABASE_URL;
  if (!save && settings) {
    ({save,load,remove,reserve}=createSupabaseStore(env.TIKTOK_SANDBOX_DATABASE_URL,require('pg').Pool));
  }
  const seal=value=>{
    const iv=crypto.randomBytes(12), c=crypto.createCipheriv('aes-256-gcm',key,iv);
    return Buffer.concat([iv,c.update(JSON.stringify(value)),c.final(),c.getAuthTag()]).toString('base64url');
  };
  const unseal=value=>{
    try{
      if(!value || value.length>8192)return null;
      const b=Buffer.from(value,'base64url'), d=crypto.createDecipheriv('aes-256-gcm',key,b.subarray(0,12));
      d.setAuthTag(b.subarray(-16));
      const v=JSON.parse(Buffer.concat([d.update(b.subarray(12,-16)),d.final()]));
      return v.exp>Date.now()?v:null;
    }catch{return null;}
  };
  const loadUser=async id=>{const row=await load(id);return row&&Number(row.expires)>Date.now()?unseal(row.enc):null;};
  const provider=async(url,options)=>{
    let r;
    try { r=await remote(url,{...options,redirect:'error',signal:AbortSignal.timeout(15000)}); }
    catch { throw Object.assign(Error(),{http:502,label:'TIKTOK_NO_RESPONSE'}); }
    if(options.binary){
      if(r.status===201)return {};
      throw Object.assign(Error(),{http:502,label:'TIKTOK_MEDIA_REJECTED'});
    }
    const data=await r.json().catch(()=>({}));
    const error=typeof data.error==='object'?data.error:{code:data.error,log_id:data.log_id};
    if(!r.ok || (error?.code&&error.code!=='ok')) {
      throw Object.assign(Error(),{http:502,label:machine(error?.code)||'TIKTOK_REJECTED',log_id:machine(error?.log_id||error?.logid)});
    }
    return data;
  };
  const api=(path,access,body)=>provider('https://open.tiktokapis.com'+path,{
    method:body?'POST':'GET',
    headers:{Authorization:'Bearer '+access,...(body?{'Content-Type':'application/json'}:{})},
    ...(body?{body:JSON.stringify(body)}:{})
  });

  return async(req,res)=>{
    const nonce=rand();
    res.setHeader('Cache-Control','no-store');
    // Chromium serializes a native POST Origin as null under no-referrer.
    res.setHeader('Referrer-Policy','same-origin');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('X-Robots-Tag','noindex, nofollow');
    res.setHeader('Content-Security-Policy',"default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self' https://www.tiktok.com; connect-src 'self'; style-src 'nonce-"+nonce+"'; script-src 'nonce-"+nonce+"'");
    const end=(status,body,type='text/html; charset=utf-8')=>{res.statusCode=status;res.setHeader('Content-Type',type);res.end(body);};
    const json=(status,body)=>end(status,JSON.stringify(body),'application/json; charset=utf-8');
    const redirect=location=>{res.statusCode=303;res.setHeader('Location',location);res.end();};
    if(!settings)return end(503,'Sandbox no configurado. No se inició ninguna conexión.','text/plain; charset=utf-8');
    const url=new URL(req.url,ORIGIN), op=url.searchParams.get('op')||'panel';
    if(op==='callback')res.setHeader('Referrer-Policy','no-referrer');
    if(!['panel','login','connect','callback','upload','status','logout'].includes(op))return json(404,{error:'NOT_FOUND'});
    if(req.method!==(['panel','callback'].includes(op)?'GET':'POST'))return json(405,{error:'METHOD_NOT_ALLOWED'});
    if(req.method==='POST'&&req.headers.origin!==ORIGIN)return json(403,{error:'ORIGIN_NOT_ALLOWED'});
    const cookies=Object.fromEntries((req.headers.cookie||'').split(';').map(s=>s.trim().split('=')).filter(x=>x.length===2));
    const session=unseal(cookies[SESSION]), id=session?.id;
    try{
      if(op==='login'){
        const form=new URLSearchParams((await readBody(req,2048)).toString());
        if(!eq(form.get('password'),env.TIKTOK_SANDBOX_ADMIN_PASSWORD))return end(401,page(nonce,null,'Clave incorrecta.'));
        res.setHeader('Set-Cookie',cookie(SESSION,seal({id:rand(),exp:Date.now()+3_600_000}),3600));
        return redirect(API);
      }
      if(!id)return op==='panel'?end(401,page(nonce,null)):json(401,{error:'LOGIN_REQUIRED'});
      if(op==='logout'){
        await remove(id);
        res.setHeader('Set-Cookie',[cookie(SESSION,'',0),cookie(STATE,'',0)]);
        return redirect(API);
      }
      if(op==='panel'){
        let user;
        try { user=await loadUser(id); }
        catch (e) {
          const code=machine(e.code)||(/timeout/i.test(e.message||'')?'DB_TIMEOUT':'UNCLASSIFIED');
          console.error('[tiktok-sandbox] session lookup failed:',code);
          return end(503,'No se pudo conectar a la base de prueba. No se ha enviado nada a TikTok.','text/plain; charset=utf-8');
        }
        return end(200,page(nonce,user||{},url.searchParams.get('notice')));
      }
      if(op==='connect'){
        const state=rand();
        res.setHeader('Set-Cookie',cookie(STATE,seal({id,state,exp:Date.now()+600_000}),600));
        const auth=new URL('https://www.tiktok.com/v2/auth/authorize/');
        auth.search=new URLSearchParams({client_key:env.TIKTOK_SANDBOX_CLIENT_KEY,response_type:'code',scope:SCOPES,redirect_uri:CALLBACK,state,disable_auto_auth:'1'});
        return redirect(auth.href);
      }
      if(op==='callback'){
        const pending=unseal(cookies[STATE]);
        res.setHeader('Set-Cookie',cookie(STATE,'',0));
        const code=url.searchParams.get('code');
        if(!pending||pending.id!==id||!eq(pending.state,url.searchParams.get('state'))||!code||code.length>2048||url.searchParams.has('error'))
          return redirect(API+'?notice=No+se+pudo+autorizar.+Vuelve+a+conectar.');
        try{
          const t=await provider('https://open.tiktokapis.com/v2/oauth/token/',{
            method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
            body:new URLSearchParams({client_key:env.TIKTOK_SANDBOX_CLIENT_KEY,client_secret:env.TIKTOK_SANDBOX_CLIENT_SECRET,code,grant_type:'authorization_code',redirect_uri:CALLBACK})
          });
          if(!t.access_token||!Number.isFinite(t.expires_in)||t.expires_in<=0||!String(t.scope).split(',').includes('video.upload'))
            return redirect(API+'?notice=No+se+autorizó+el+permiso+de+borradores.');
          const profile=(await api('/v2/user/info/?fields=open_id,display_name',t.access_token)).data?.user;
          if(!profile?.open_id || !profile?.display_name || (t.open_id && t.open_id!==profile.open_id))
            return redirect(API+'?notice=No+se+pudo+verificar+la+cuenta.');
          // Never retain the refresh token. Keep this connection no longer than the admin session.
          const exp=Math.min(session.exp,Date.now()+1000*t.expires_in);
          await save(id,seal({exp,access:t.access_token,name:profile.display_name}),exp);
          return redirect(API);
        }catch(e){
          const label=machine(e.label)||'CONNECTION_FAILED';
          const log=machine(e.log_id);
          return redirect(API+'?notice='+encodeURIComponent(label+(log?' · '+log:'')));
        }
      }
      const user=await loadUser(id);
      if(!user?.access)return json(409,{error:'CONNECT_FIRST'});
      if(op==='status'){
        if(!user.last)return json(409,{error:'NO_DRAFT'});
        const status=(await api('/v2/post/publish/status/fetch/',user.access,{publish_id:user.last})).data;
        return json(200,{status:machine(status?.status)||'UNKNOWN',reason:machine(status?.fail_reason)||undefined});
      }
      if(req.headers['content-type']!=='video/mp4')return json(415,{error:'MP4_REQUIRED'});
      const bytes=await readBody(req,MAX);
      if(bytes.length<16||bytes.toString('ascii',4,8)!=='ftyp'||bytes.readUInt32BE(0)<8||bytes.readUInt32BE(0)>bytes.length)
        return json(415,{error:'MP4_REQUIRED'});
      if(!await reserve(id))return json(409,{error:'ONE_DRAFT_PER_SESSION'});
      const init=(await api('/v2/post/publish/inbox/video/init/',user.access,{source_info:{source:'FILE_UPLOAD',video_size:bytes.length,chunk_size:bytes.length,total_chunk_count:1}})).data;
      const publishId=machine(init?.publish_id);
      const dest=new URL(init?.upload_url);
      if(!publishId||dest.protocol!=='https:'||!UPLOAD_HOSTS.has(dest.hostname)||dest.port||dest.username||dest.password||dest.pathname!=='/video/')
        return json(502,{error:'INVALID_TIKTOK_UPLOAD_RESPONSE'});
      await save(id,seal({...user,last:publishId}),user.exp);
      await provider(dest.href,{method:'PUT',binary:true,body:bytes,headers:{
        'Content-Type':'video/mp4','Content-Length':String(bytes.length),'Content-Range':'bytes 0-'+(bytes.length-1)+'/'+bytes.length
      }});
      return json(202,{status:'PROCESSING_UPLOAD'});
    }catch(e){
      return json(e.http||500,{error:machine(e.label)||'SANDBOX_ERROR',...(machine(e.log_id)?{log_id:e.log_id}:{})});
    }
  };
}

async function readBody(req,limit){
  const reject=()=>Object.assign(Error(),{http:413,label:'CLIP_TOO_LARGE'});
  if(Number(req.headers['content-length'])>limit)throw reject();
  if(req.headers['content-type']!=='video/mp4' && req.body!==undefined){
    if(Buffer.isBuffer(req.body)){if(req.body.length>limit)throw reject();return req.body;}
    if(typeof req.body==='string' && req.headers['content-type']!=='video/mp4'){const b=Buffer.from(req.body);if(b.length>limit)throw reject();return b;}
    if(req.body&&typeof req.body==='object'&&req.headers['content-type']==='application/x-www-form-urlencoded'){
      const b=Buffer.from(new URLSearchParams(req.body).toString());if(b.length>limit)throw reject();return b;
    }
  }
  const chunks=[];let total=0;
  for await(const chunk of req){total+=chunk.length;if(total>limit)throw reject();chunks.push(chunk);}
  return Buffer.concat(chunks);
}

function page(nonce,user,notice=''){
  const note=notice?'<p role="status">'+asText(String(notice).slice(0,170))+'</p>':'';
  let body;
  if(!user)body='<p>Acceso para preparación de la demo.</p><form method="POST" action="'+API+'?op=login"><label>Clave de acceso <input name="password" type="password" required autocomplete="current-password"></label><button>Entrar</button></form>';
  else if(!user.access)body='<p>Autoriza con el usuario de prueba del Sandbox. No se hará ninguna publicación.</p><form method="POST" action="'+API+'?op=connect"><button>Conectar TikTok</button></form>';
  else body='<p>Cuenta conectada: <strong>'+asText(user.name)+'</strong></p><p>Selecciona un MP4 corto de hasta 4 MB. El clip llegará como borrador, sin publicar.</p><label>Video de prueba <input id="clip" type="file" accept="video/mp4"></label><button type="button" id="send">Enviar borrador a TikTok</button><button type="button" id="check">Comprobar bandeja</button><p id="status" aria-live="polite"></p>';
  const script=user?.access?`<script nonce="${nonce}">
const r=document.querySelector('#status'), file=document.querySelector('#clip'), send=document.querySelector('#send');
async function run(op,body){
 r.textContent=op==='upload'?'Enviando…':'Consultando…';
 try{
  const response=await fetch('?op='+op,{method:'POST',...(body?{body,headers:{'Content-Type':'video/mp4'}}:{})});
  const d=await response.json();
  const messages={PROCESSING_UPLOAD:'Clip enviado. TikTok lo está procesando.',PROCESSING_DOWNLOAD:'TikTok está procesando el clip.',SEND_TO_USER_INBOX:'Borrador confirmado en la bandeja de TikTok. No se publicó desde aquí.',PUBLISH_COMPLETE:'TikTok reporta que el usuario terminó de publicar.',FAILED:'TikTok no pudo procesar el borrador.'};
  r.textContent=(messages[d.status]||d.error||d.status||'Sin respuesta')+(d.reason?' · '+d.reason:'')+(d.log_id?' · '+d.log_id:'');
  if(op==='upload'&&!response.ok)send.disabled=false;
 }catch{r.textContent='No pude consultar. Revisa el estado antes de intentar otro envío.'}
}
send.onclick=()=>{const f=file.files[0];if(!f||f.size>4000000){r.textContent='Elige un MP4 de hasta 4 MB.';return;}send.disabled=true;run('upload',f);};
document.querySelector('#check').onclick=()=>run('status');
</script>`:'';
  return `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Sandbox TikTok | Chicken Chicanito</title><style nonce="${nonce}">*{box-sizing:border-box}body{background:#fff7ec;color:#17213e;font:17px/1.5 system-ui;margin:0;padding:5vh 18px}main{background:white;border-radius:20px;max-width:680px;margin:auto;padding:clamp(18px,5vw,48px);border-top:8px solid #e30613}h1{line-height:1.1}button{background:#b2040f;color:white;border:0;border-radius:8px;padding:12px;font:700 15px system-ui;margin:8px 8px 8px 0;cursor:pointer}button:disabled{opacity:.6}input{max-width:100%;display:block;margin:9px 0;padding:9px}small{letter-spacing:.12em;font-weight:800}form:last-of-type{margin-top:14px}</style><main><small>CHICKEN CHICANITO · SANDBOX</small><h1>Conexión de TikTok</h1>${note}${body}${user?'<form method="POST" action="'+API+'?op=logout"><button>Salir</button></form>':''}</main>${script}</html>`;
}

function createSupabaseStore(uri, Pool){
  const u = new URL(uri);
  if (!['postgresql:','postgres:'].includes(u.protocol) ||
      !/^aws-[0-9]+-[a-z0-9-]+\.pooler\.supabase\.com$/.test(u.hostname) ||
      u.port!=='6543' || u.pathname!=='/postgres' ||
      decodeURIComponent(u.username)!=='tiktok_panel.uvacqokoiewifowdxwhw' || !u.password)
    throw new Error('Invalid isolated Supabase connection');
  const pool=new Pool({host:u.hostname,port:6543,database:'postgres',
    user:decodeURIComponent(u.username),password:decodeURIComponent(u.password),
    ssl:{rejectUnauthorized:true},max:2,idleTimeoutMillis:5000,connectionTimeoutMillis:5000,query_timeout:5000});
  pool.on?.('error',()=>{}); // An idle socket error must not crash the function or log credentials.
  const table='public.chicanito_tiktok_sandbox_sessions';
  return {
    save:(id,enc,expires)=>pool.query('INSERT INTO '+table+' (id, enc, expires) VALUES($1,$2,$3) ON CONFLICT (id) DO UPDATE SET enc=EXCLUDED.enc,expires=EXCLUDED.expires',[id,enc,expires]),
    load:async id=>(await pool.query('SELECT enc,expires FROM '+table+' WHERE id=$1 AND expires>$2',[id,Date.now()])).rows[0],
    remove:id=>pool.query('DELETE FROM '+table+' WHERE id=$1',[id]),
    reserve:async id=>(await pool.query('UPDATE '+table+' SET upload_started=true WHERE id=$1 AND NOT upload_started AND expires>$2 RETURNING id',[id,Date.now()])).rowCount===1
  };
}

let handler;
module.exports=(req,res)=>{
  try { return (handler ||= createHandler())(req,res); }
  catch { res.statusCode=503; res.setHeader('Cache-Control','no-store'); res.end('Sandbox no configurado.'); }
};
module.exports.createHandler=createHandler;
module.exports.createSupabaseStore=createSupabaseStore;
