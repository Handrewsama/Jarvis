(()=>{'use strict';
const $=s=>document.querySelector(s);
const token=()=>sessionStorage.getItem('jarvis.api.token')||'';
function showGoogle(message,good=false){
  const el=$('#googleIntegrationStatus');
  if(el){el.textContent=message;el.style.color=good?'#159c77':'';}
  const out=$('#integrationStatus');
  if(out) out.textContent=message;
}
async function refresh(){
  const out=$('#integrationStatus');
  try{
    const r=await fetch('/api/integrations/status',{headers:{Accept:'application/json','Authorization':'Bearer '+token()}});
    const d=await r.json();
    if(!r.ok||!d.ok)throw Error(d.error||'No es pot consultar l’estat del backend.');
    const set=(selector,connected,configured)=>{
      const card=$(selector)?.closest('.integration-card');if(!card)return;
      const badge=card.querySelector('.status-badge');
      if(badge){badge.textContent=connected?'CONNECTED':configured?'CONFIGURED · NOT CONNECTED':'NOT CONFIGURED';badge.classList.toggle('connected',connected);}
    };
    set('#connectGoogleBtn',d.integrations.gmail.connected,d.integrations.gmail.configured);
    if(out)out.textContent=`Gmail: ${d.integrations.gmail.connected?'connectat':d.integrations.gmail.configured?'preparat per autoritzar':'falten credencials'} · Calendar: ${d.integrations.calendar.connected?'connectat':d.integrations.calendar.configured?'preparat per autoritzar':'falten credencials'} · WhatsApp: ${d.integrations.whatsapp.configured?'credencials configurades; webhook pendent de prova':'falten secrets de Meta'}`;
    const counter=$('#view-integrations .safety-chip');
    if(counter)counter.innerHTML=`${Number(d.integrations.gmail.connected)+Number(d.integrations.calendar.connected)+Number(d.integrations.whatsapp.connected)} / 3 <span data-i18n="connected">connectades</span>`;
  }catch(e){if(out)out.textContent='Estat no disponible: '+e.message;}
}
async function connectGoogle(e){
  e.preventDefault();
  showGoogle('Iniciant connexió amb Google…');
  if(!token()){
    showGoogle('No trobo el token a la sessió actual. Obre Configuració, enganxa el token privat de JARVIS i prem «Connectar i sincronitzar». Després torna aquí.');
    return;
  }
  try{
    const r=await fetch('/api/google/auth',{method:'POST',headers:{'Authorization':'Bearer '+token(),'Accept':'application/json'}});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!d.url)throw Error(d.error||`Error del servidor (${r.status}).`);
    showGoogle('Redirigint a Google…',true);
    location.assign(d.url);
  }catch(err){showGoogle('No s’ha pogut iniciar Google OAuth: '+err.message);}
}
window.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('a[href="/api/google/auth"]').forEach(a=>a.addEventListener('click',connectGoogle));
  $('#whatsappStatusBtn')?.addEventListener('click',refresh);
  const p=new URLSearchParams(location.search);
  if(p.has('integration')){
    const m={google_connected:'Compte Google connectat correctament.',google_error:'No s’ha pogut connectar Google. Revisa OAuth i l’URI de retorn.',google_storage_error:'No s’han pogut desar les credencials xifrades. Revisa JARVIS_ENCRYPTION_KEY i la migració D1.'};
    showGoogle(m[p.get('integration')]||'Resultat de la connexió no reconegut.');
    history.replaceState({},'',location.pathname);
  }
  refresh();
});
})();