import {json,isAuthorized} from '../_lib.js';
export async function onRequestGet({request,env}){
 if(!isAuthorized(request,env))return json({ok:false,error:'Connecta primer el token privat de JARVIS a Configuració.'},401);
 let google=false, whatsapp=Boolean(env.WHATSAPP_ACCESS_TOKEN&&env.WHATSAPP_PHONE_NUMBER_ID&&env.WHATSAPP_VERIFY_TOKEN);
 try {const row=await env.DB.prepare("SELECT provider FROM integration_tokens WHERE provider='google'").first();google=Boolean(row)} catch {}
 return json({ok:true,integrations:{gmail:{connected:google,configured:Boolean(env.GOOGLE_CLIENT_ID&&env.GOOGLE_CLIENT_SECRET)},calendar:{connected:google,configured:Boolean(env.GOOGLE_CLIENT_ID&&env.GOOGLE_CLIENT_SECRET)},whatsapp:{connected:false,configured:whatsapp,webhookReady:whatsapp}},features:{gmailRead:google,calendarRead:google,whatsappReceive:whatsapp,externalSend:false}});
}
