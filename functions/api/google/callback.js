import {appUrl,clearCookie,encryptSecret} from '../_lib.js';

function redirectResult(base, headers, integration, reason='') {
  const target = new URL(base + '/');
  target.searchParams.set('integration', integration);
  if (reason) target.searchParams.set('reason', reason);
  headers.set('Location', target.toString());
  return new Response(null, {status:302, headers});
}

export async function onRequestGet({request,env}) {
  const u = new URL(request.url);
  const state = u.searchParams.get('state') || '';
  const code = u.searchParams.get('code');
  const googleError = u.searchParams.get('error');
  const cookieHeader = request.headers.get('Cookie') || '';
  const saved = cookieHeader.split(';').map(x=>x.trim())
    .find(x=>x.startsWith('jarvis_google_state='))?.split('=').slice(1).join('=');
  const headers = new Headers({
    'Set-Cookie': clearCookie('jarvis_google_state'),
    'Cache-Control': 'no-store'
  });
  const base = appUrl(request,env);

  // Keep diagnostics generic: never put OAuth codes, state values, tokens or secrets in the URL.
  if (googleError) return redirectResult(base,headers,'google_error',
    googleError === 'access_denied' ? 'google_access_denied' : 'google_oauth_error');
  if (!code) return redirectResult(base,headers,'google_error','code_missing');
  if (!saved) return redirectResult(base,headers,'google_error','state_cookie_missing');
  if (!state || state !== saved) return redirectResult(base,headers,'google_error','state_mismatch');
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return redirectResult(base,headers,'google_error','oauth_secrets_missing');
  if (!env.DB) return redirectResult(base,headers,'google_storage_error','database_binding_missing');

  const redirect_uri = base + '/api/google/callback';
  const form = new URLSearchParams({
    code, client_id:env.GOOGLE_CLIENT_ID, client_secret:env.GOOGLE_CLIENT_SECRET,
    redirect_uri, grant_type:'authorization_code'
  });
  let response, data;
  try {
    response = await fetch('https://oauth2.googleapis.com/token', {
      method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:form
    });
    data = await response.json();
  } catch {
    return redirectResult(base,headers,'google_error','token_endpoint_unreachable');
  }
  if (!response.ok) {
    const safeGoogleErrors = new Set(['invalid_grant','invalid_client','redirect_uri_mismatch','unauthorized_client','invalid_request']);
    const googleCode = typeof data?.error === 'string' && safeGoogleErrors.has(data.error) ? data.error : 'unknown';
    return redirectResult(base,headers,'google_error',`token_exchange_${response.status}_${googleCode}`);
  }
  if (!data?.refresh_token) return redirectResult(base,headers,'google_error','refresh_token_missing');

  try {
    const encrypted = await encryptSecret(data.refresh_token,env);
    await env.DB.prepare("INSERT INTO integration_tokens(provider,encrypted_refresh_token,scopes,updated_at) VALUES('google',?,?,?) ON CONFLICT(provider) DO UPDATE SET encrypted_refresh_token=excluded.encrypted_refresh_token,scopes=excluded.scopes,updated_at=excluded.updated_at")
      .bind(encrypted,(data.scope||'').slice(0,2000),new Date().toISOString()).run();
  } catch {
    return redirectResult(base,headers,'google_storage_error','encryption_or_database_error');
  }
  return redirectResult(base,headers,'google_connected');
}
