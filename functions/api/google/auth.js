import {json,appUrl,randomState,cookie,isAuthorized} from '../_lib.js';
export async function onRequestPost({request,env}){
 if(!isAuthorized(request,env)) return json({ok:false,error:'Connecta primer el token privat de JARVIS a Configuració.'},401);
 if(!env.GOOGLE_CLIENT_ID||!env.GOOGLE_CLIENT_SECRET) return json({ok:false,error:'Falten GOOGLE_CLIENT_ID i GOOGLE_CLIENT_SECRET als secrets de Cloudflare.'},503);
 const state=randomState(); const redirect_uri=appUrl(request,env)+'/api/google/callback';
 const scopes=['openid','email','https://www.googleapis.com/auth/gmail.readonly','https://www.googleapis.com/auth/calendar.readonly'];
 const u=new URL('https://accounts.google.com/o/oauth2/v2/auth'); for(const [k,v] of Object.entries({client_id:env.GOOGLE_CLIENT_ID,redirect_uri,response_type:'code',scope:scopes.join(' '),access_type:'offline',include_granted_scopes:'true',prompt:'consent',state}))u.searchParams.set(k,v);
 return new Response(JSON.stringify({ok:true,url:u.toString()}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store','Set-Cookie':cookie('jarvis_google_state',state)}});
}
