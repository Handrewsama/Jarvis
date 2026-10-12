export const json = (body, status = 200) => Response.json(body, {status, headers:{"Cache-Control":"no-store"}});
export function appUrl(request, env){ return (env.APP_BASE_URL || new URL(request.url).origin).replace(/\/$/,""); }
export function randomState(){ const b=new Uint8Array(32); crypto.getRandomValues(b); return [...b].map(x=>x.toString(16).padStart(2,"0")).join(""); }
export function cookie(name,value,maxAge=600){ return `${name}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`; }
export function clearCookie(name){ return `${name}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`; }
function decodeKey(value){ try { const s=value.replace(/-/g,'+').replace(/_/g,'/'); const raw=atob(s); return Uint8Array.from(raw,c=>c.charCodeAt(0)); } catch { return new Uint8Array(); } }
async function cryptoKey(env){ const raw=decodeKey(env.JARVIS_ENCRYPTION_KEY||''); if(raw.length!==32) throw new Error('JARVIS_ENCRYPTION_KEY ha de ser una clau base64 de 32 bytes.'); return crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['encrypt','decrypt']); }
export async function encryptSecret(value,env){ const key=await cryptoKey(env), iv=crypto.getRandomValues(new Uint8Array(12)); const data=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(value)); const all=new Uint8Array(iv.length+data.byteLength); all.set(iv); all.set(new Uint8Array(data),iv.length); return btoa(String.fromCharCode(...all)); }
export async function decryptSecret(value,env){ const all=Uint8Array.from(atob(value),c=>c.charCodeAt(0)); const key=await cryptoKey(env); const data=await crypto.subtle.decrypt({name:'AES-GCM',iv:all.slice(0,12)},key,all.slice(12)); return new TextDecoder().decode(data); }
export async function googleToken(env){
 const row=await env.DB.prepare("SELECT encrypted_refresh_token FROM integration_tokens WHERE provider='google' LIMIT 1").first();
 if(!row?.encrypted_refresh_token) throw new Error('Google no està connectat. Ves a Integracions i connecta el compte.');
 const refresh=await decryptSecret(row.encrypted_refresh_token,env);
 const form=new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,refresh_token:refresh,grant_type:'refresh_token'});
 const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:form}); const d=await r.json(); if(!r.ok||!d.access_token) throw new Error('No s’ha pogut renovar el token de Google. Pot ser necessari tornar a connectar el compte.'); return d.access_token;
}

export function isAuthorized(request,env){ const token=env.JARVIS_API_TOKEN; return Boolean(token) && (request.headers.get('Authorization')||'')===`Bearer ${token}`; }
