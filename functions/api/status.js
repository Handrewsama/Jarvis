// JARVIS integrations readiness. This reports configuration only; it does not mean an account is connected.
const json = body => Response.json(body, { headers: { "Cache-Control": "no-store" } });
export async function onRequestGet({ env }) {
  const googleConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
  const whatsappConfigured = Boolean(env.META_APP_ID && env.META_APP_SECRET && env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID);
  return json({ ok: true, integrations: {
    gmail: { configured: googleConfigured, connected: false, note: googleConfigured ? "OAuth configurat; falta autoritzar el compte i completar el callback" : "Cal configurar OAuth de Google" },
    googleCalendar: { configured: googleConfigured, connected: false, note: googleConfigured ? "OAuth configurat; falta autoritzar el compte i completar el callback" : "Cal configurar OAuth de Google" },
    whatsappBusiness: { configured: whatsappConfigured, connected: false, note: whatsappConfigured ? "Credencials presents; cal verificar el webhook i els permisos de Meta" : "Cal configurar l'aplicació Meta i WhatsApp Business" }
  }});
}
