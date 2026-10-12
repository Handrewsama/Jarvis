import {json,appUrl,clearCookie,encryptSecret} from '../_lib.js';
export async function onRequestGet({request,env}){
 const u=new URL(request.url), state=u.searchParams.get('state')||'', code=u.searchParams.get('code'), error=u.searchParams.get('error');
 const saved=(request.headers.get('Cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('jarvis_google_state='))?.split('=').slice(1).join('=');
 const headers=new Headers({'Set-Cookie':clearCookie('jarvis_google_state'),'Cache-Control':'no-store'});
 if(error||!code||!saved||state!==saved){headers.set('Location',appUrl(request,env)+'/?integration=google_error');return new Response(null,{status:302,headers});}
 const redirect_uri=appUrl(request,env)+'/api/google/callback';
 const form=new URLSearchParams({code,client_id:env.GOOGLE_CLIENT_ID||'',client_secret:env.GOOGLE_CLIENT_SECRET||'',redirect_uri,grant_type:'authorization_code'});
 const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:form}); const d=await r.json();
 if(!r.ok||!d.refresh_token){headers.set('Location',appUrl(request,env)+'/?integration=google_error');return new Response(null,{status:302,headers});}
 try { const encrypted=await encryptSecret(d.refresh_token,env); await env.DB.prepare("INSERT INTO integration_tokens(provider,encrypted_refresh_token,scopes,updated_at) VALUES('google',?,?,?) ON CONFLICT(provider) DO UPDATE SET encrypted_refresh_token=excluded.encrypted_refresh_token,scopes=excluded.scopes,updated_at=excluded.updated_at").bind(encrypted,(d.scope||'').slice(0,2000),new Date().toISOString()).run(); }
 catch(e){headers.set('Location',appUrl(request,env)+'/?integration=google_storage_error');return new Response(null,{status:302,headers});}
 headers.set('Location',appUrl(request,env)+'/?integration=google_connected'); return new Response(null,{status:302,headers});
}
