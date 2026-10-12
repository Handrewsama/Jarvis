(()=>{'use strict';
const $=s=>document.querySelector(s);
const token=()=>sessionStorage.getItem('jarvis.api.token')||'';
const reasons={
 google_access_denied:'Has cancel·lat o denegat els permisos de Google.',
 google_oauth_error:'Google ha retornat un error durant l’autorització.',
 code_missing:'Google no ha retornat el codi d’autorització. Torna-ho a provar.',
 state_cookie_missing:'No ha arribat la cookie temporal de seguretat. Inicia la connexió des de la mateixa adreça de JARVIS i torna-ho a provar.',
 state_mismatch:'La validació de seguretat OAuth no coincideix. Inicia una connexió nova i no reutilitzis la pàgina de retorn.',
 oauth_secrets_missing:'Falten GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET als secrets de Cloudflare.',
 database_binding_missing:'No està disponible el binding D1 DB a Cloudflare.',
 token_endpoint_unreachable:'JARVIS no ha pogut contactar amb el servei de tokens de Google. Revisa els logs de Cloudflare.',
 refresh_token_missing:'Google no ha enviat un token de renovació. Revisa el consentiment i torna a autoritzar l’accés; no es desa cap connexió nova.',
 encryption_or_database_error:'Google ha autoritzat l’accés, però JARVIS no ha pogut desar-lo. Revisa JARVIS_ENCRYPTION_KEY i el binding D1 DB.',
 database_binding_missing:'No està disponible el binding D1 DB a Cloudflare.'
};
function errorDescription(reason){
 if(!reason)return 'No s’ha pogut connectar Google. El retorn no inclou el motiu del problema.';
 if(reason.startsWith('token_exchange_')){
   const m=reason.match(/^token_exchange_(\d+)_([a-z_]+)$/);
   if(m){const detail={invalid_grant:'El codi ha caducat, ja s’ha utilitzat o la URI de retorn no coincideix.',invalid_client:'Google no accepta les credencials OAuth configurades a Cloudflare.',redirect_uri_mismatch:'La URI de retorn no coincideix amb la configurada a Google Cloud.',unauthorized_client:'El client OAuth no està autoritzat per a aquesta petició.',invalid_request:'Google considera invàlida la petició d’intercanvi.'}[m[2]]||'Google ha rebutjat l’intercanvi del codi.';return `Google ha rebutjat l’intercanvi del codi (HTTP ${m[1]}). ${detail}`;}
 }
 return reasons[reason]||`Error de connexió Google (${reason}). Consulta els logs de Cloudflare; no s’hi han d’incloure secrets.`;
}
async function refresh(){
 const out=$('#integrationStatus');
 try{
  const r=await fetch('/api/integrations/status',{headers:{Accept:'application/json','Authorization':'Bearer '+token()}});
  const d=await r.json();
  if(!r.ok||!d.ok)throw Error(d.error||'No es pot consultar l’estat del backend.');
  const set=(selector,connected,configured)=>{const card=$(selector)?.closest('.integration-card');if(!card)return;const badge=card.querySelector('.status-badge');if(badge){badge.textContent=connected?'CONNECTED':configured?'CONFIGURED · NOT CONNECTED':'NOT CONFIGURED';badge.classList.toggle('connected',connected)}};
  set('#connectGoogleBtn',d.integrations.gmail.connected,d.integrations.gmail.configured);
  if(out)out.textContent=`Gmail: ${d.integrations.gmail.connected?'connectat':d.integrations.gmail.configured?'preparat per autoritzar':'falten credencials'} · Calendar: ${d.integrations.calendar.connected?'connectat':d.integrations.calendar.configured?'preparat per autoritzar':'falten credencials'} · WhatsApp: ${d.integrations.whatsapp.configured?'credencials configurades; webhook pendent de prova':'falten secrets de Meta'}`;
  const counter=$('#view-integrations .safety-chip');
  if(counter)counter.innerHTML=`${Number(d.integrations.gmail.connected)+Number(d.integrations.calendar.connected)+Number(d.integrations.whatsapp.connected)} / 3 <span data-i18n="connected">connectades</span>`;
 }catch(e){if(out)out.textContent='Estat no disponible: '+e.message;}
}
async function connectGoogle(e){
 e.preventDefault();
 const out=$('#integrationStatus');
 if(out)out.textContent='Iniciant connexió amb Google…';
 if(!token()){if(out)out.textContent='No trobo el token privat a la sessió actual. Obre Configuració, enganxa el token de JARVIS i prem «Connectar i sincronitzar». Després torna aquí.';return;}
 try{
  const r=await fetch('/api/google/auth',{method:'POST',headers:{'Authorization':'Bearer '+token(),'Accept':'application/json'}});
  const d=await r.json().catch(()=>({}));
  if(!r.ok||!d.url)throw Error(d.error||`Error del servidor (${r.status}).`);
  if(out)out.textContent='Redirigint a Google…';
  location.assign(d.url);
 }catch(err){if(out)out.textContent='No s’ha pogut iniciar Google OAuth: '+err.message;}
}
window.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('a[href="/api/google/auth"]').forEach(a=>a.addEventListener('click',connectGoogle));
 $('#whatsappStatusBtn')?.addEventListener('click',refresh);
 const p=new URLSearchParams(location.search);
 if(p.has('integration')){
  const result=p.get('integration');
  if(result==='google_connected'){
   const out=$('#integrationStatus');if(out)out.textContent='Compte Google connectat correctament. Actualitzant l’estat…';
   refresh();
  }else if(result==='google_error'){
   const message=errorDescription(p.get('reason'));
   if($('#integrationStatus'))$('#integrationStatus').textContent=message;
  }else if(result==='google_storage_error'){
   const message=errorDescription(p.get('reason')||'encryption_or_database_error');
   if($('#integrationStatus'))$('#integrationStatus').textContent=message;
  }else if($('#integrationStatus'))$('#integrationStatus').textContent='Resultat de la connexió no reconegut.';
  history.replaceState({},'',location.pathname);
 }
 refresh();
});
})();
