const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { once } = require('node:events');
const { createHandler } = require('../api/tiktok-sandbox.js');

const token = 'test-access-token-not-for-browser';
const origin = 'https://www.chicanito.app';
test('Sandbox login, OAuth state, exact callback, media upload and inbox status', async (t) => {
  const rows = new Map(), calls = [];
  const handler = createHandler({
    env:{TIKTOK_SANDBOX_CLIENT_KEY:'sbaw_test',TIKTOK_SANDBOX_CLIENT_SECRET:'test-secret',TIKTOK_SANDBOX_ADMIN_PASSWORD:'a'.repeat(28),TIKTOK_SANDBOX_SESSION_KEY:Buffer.alloc(32,1).toString('base64'),TIKTOK_SANDBOX_DATABASE_URL:'postgres://test'},
    save:async (id, enc, expires)=>rows.set(id,{...rows.get(id),enc,expires}),
    load:async id=>rows.get(id),
    remove:async id=>rows.delete(id),
    reserve:async id=>{const row=rows.get(id); if(!row||row.locked) return false;row.locked=true;return true},
    fetch:async (url, init) => {
      const path = new URL(url).pathname;
      calls.push(path);
      if(path==='/v2/oauth/token/'){
        assert.equal(init.body.get('redirect_uri'),origin+'/tiktok-callback.html');
        assert.equal(init.body.get('client_secret'),'test-secret');
        return Response.json({access_token:token,expires_in:7200,scope:'user.info.basic,video.upload'});
      }
      if(path==='/v2/user/info/') return Response.json({data:{user:{display_name:'Chicken Chicanito',open_id:'abc'}},error:{code:'ok'}});
      if(path==='/v2/post/publish/inbox/video/init/'){
        assert.equal(init.headers.Authorization,'Bearer '+token);
        return Response.json({data:{publish_id:'draft123',upload_url:'https://open-upload.tiktokapis.com/video/?signed=private'},error:{code:'ok'}});
      }
      if(path==='/video/'){assert.equal(init.headers['Content-Range'],'bytes 0-23/24');return new Response(null,{status:201})}
      if(path==='/v2/post/publish/status/fetch/') return Response.json({data:{status:'SEND_TO_USER_INBOX'},error:{code:'ok'}});
      throw new Error('unexpected request');
    }
  });
  const server=createServer(handler).listen(0,'127.0.0.1'); t.after(()=>server.close());
  await once(server,'listening');
  const base='http://127.0.0.1:'+server.address().port;
  const req=(op,opts={})=>fetch(base+'/api/tiktok-sandbox?op='+op,{redirect:'manual',...opts});
  const post=(op,body,cookie,type='application/x-www-form-urlencoded',site=origin)=>req(op,{method:'POST',body,headers:{Origin:site,'Content-Type':type,...(cookie?{Cookie:cookie}:{})}});
  const loginPage=await req('panel');
  assert.equal(loginPage.status,401);
  assert.equal(loginPage.headers.get('referrer-policy'),'same-origin');
  assert.equal((await req('callback&code=synthetic')).headers.get('referrer-policy'),'no-referrer');
  assert.equal((await post('login','password=unused',null,undefined,'null')).status,403);
  assert.equal((await post('login','password='+ 'a'.repeat(28),null,undefined,'https://untrusted.test')).status,403);
  const login=await post('login','password='+ 'a'.repeat(28));
  assert.equal(login.status,303);
  const session=login.headers.get('set-cookie').split(';')[0];
  assert.match(login.headers.get('set-cookie'),/HttpOnly.*Secure.*SameSite=Lax/i);
  assert.equal((await req('panel',{headers:{Cookie:session}})).status,200);
  const connect=await post('connect','',session);
  const location=new URL(connect.headers.get('location'));
  assert.equal(location.searchParams.get('scope'),'user.info.basic,video.upload');
  const state=location.searchParams.get('state');
  const cookie=session+'; '+connect.headers.get('set-cookie').split(';')[0];
  assert.equal((await req('callback&code=demo&state=wrong',{headers:{Cookie:cookie}})).status,303);
  assert.equal(calls.length,0);
  const done=await req('callback&code=demo&state='+state,{headers:{Cookie:cookie}});
  assert.equal(done.status,303);
  assert.doesNotMatch(JSON.stringify([...rows]),new RegExp(token));
  const panel=await (await req('panel',{headers:{Cookie:session}})).text();
  assert.match(panel,/Chicken Chicanito/);
  assert.doesNotMatch(panel,/test-access-token|test-secret/);
  const bad=await post('upload',Buffer.alloc(24),session,'video/mp4');
  assert.equal(bad.status,415);
  const mp4=Buffer.alloc(24); mp4.writeUInt32BE(24); mp4.write('ftyp',4);
  const output=await post('upload',mp4,session,'video/mp4');
  assert.equal(output.status,202);
  assert.equal((await output.json()).status,'PROCESSING_UPLOAD');
  const check=await post('status','',session);
  assert.equal((await check.json()).status,'SEND_TO_USER_INBOX');
  assert.equal((await post('upload',mp4,session,'video/mp4')).status,409);
  assert.ok(!calls.includes('/v2/post/publish/video/init/'));
});

test('Missing secrets fail closed and never call TikTok', async (t) => {
  const handler=createHandler({env:{},fetch:async()=>{assert.fail('external request') }});
  const server=createServer(handler).listen(0,'127.0.0.1'); t.after(()=>server.close());
  await once(server,'listening');
  const response=await fetch('http://127.0.0.1:'+server.address().port+'/api/tiktok-sandbox');
  assert.equal(response.status,503);
  assert.equal(response.headers.get('cache-control'),'no-store');
  assert.match(await response.text(),/Sandbox no configurado/);
});

test('Callback rewrite preserves the registered URI without the code-display page', () => {
  const c=require('../vercel.json');
  assert.deepEqual(c.rewrites,[{source:'/tiktok-callback.html',destination:'/api/tiktok-sandbox?op=callback'}]);
});

test('Supabase storage is pinned to the isolated project and uses parameterized queries', async () => {
  const { createSupabaseStore } = require('../api/tiktok-sandbox.js');
  const calls=[];
  class Pool {
    constructor(options){ assert.equal(options.port,6543);assert.equal(options.ssl.rejectUnauthorized,true); }
    async query(sql,params){ calls.push({sql,params});return {rows:[{enc:'sealed',expires:9999}],rowCount:1};}
  }
  const correct='postgresql://tiktok_panel.uvacqokoiewifowdxwhw:not-a-real-secret@aws-0-us-east-1.pooler.supabase.com:6543/postgres';
  assert.throws(()=>createSupabaseStore(correct.replace('uvacqokoiewifowdxwhw','different-project'),Pool));
  assert.throws(()=>createSupabaseStore(correct.replace('tiktok_panel.','postgres.'),Pool));
  const db=createSupabaseStore(correct,Pool);
  await db.save('opaque-id','ciphertext',9999);
  assert.equal((await db.load('opaque-id')).enc,'sealed');
  assert.equal(await db.reserve('opaque-id'),true);
  await db.remove('opaque-id');
  assert.equal(calls.length,4);
  assert.ok(calls.every(c=>c.sql.includes('public.chicanito_tiktok_sandbox_sessions') && c.params[0]==='opaque-id' && !c.sql.includes('opaque-id')));
});
