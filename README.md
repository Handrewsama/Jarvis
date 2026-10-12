# J.A.R.V.I.S. Personal Assistant — 0.5.0 integration foundation

A static, installable personal assistant with a Gemini task interpreter and Cloudflare Pages Functions.

## What this version adds
- Server-side Google OAuth 2.0 flow for Gmail read-only and Google Calendar read-only access.
- Encrypted storage of Google refresh token in D1 using AES-GCM.
- Gmail endpoint: `GET /api/google/gmail?q=is:unread&max=10` (requires a connected Google account).
- Calendar endpoint: `GET /api/google/calendar` (next 7 days by default; accepts ISO `from` and `to`).
- Integration status endpoint: `GET /api/integrations/status`.
- WhatsApp Business webhook verification and incoming text-message storage in D1. No outgoing WhatsApp messages are sent in this release.
- Keeps the existing task UI and experimental Gemini interpreter.

## Required Cloudflare configuration
Keep existing `GEMINI_API_KEY`, `JARVIS_API_TOKEN` and D1 binding `DB` if already configured. Add these secrets/variables:
- `APP_BASE_URL` = exact HTTPS Pages URL, e.g. `https://your-project.pages.dev` (recommended).
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from Google Cloud OAuth credentials.
- `JARVIS_ENCRYPTION_KEY` = base64-encoded 32 random bytes. Generate locally with `openssl rand -base64 32`; never commit it.
- `WHATSAPP_VERIFY_TOKEN` (a long random string). For full incoming webhook setup also add `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`.

### Google setup
1. In Google Cloud Console create an OAuth Client ID of type **Web application**.
2. Add the authorized redirect URI exactly: `https://YOUR-PAGES-DOMAIN/api/google/callback`.
3. Enable Gmail API and Google Calendar API.
4. For this initial release scopes are `gmail.readonly` and `calendar.readonly`. The app cannot send email or create events yet.
5. Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JARVIS_ENCRYPTION_KEY`, and `APP_BASE_URL` to Cloudflare Pages secrets/variables.
6. Run `migration-v050.sql` once in D1 `jarvis-db`; do not rerun if the tables already exist.
7. Deploy, open Integrations, then choose **Connect Gmail and Calendar**.

Google may show an unverified-app warning while an OAuth consent screen remains in testing. Keep access limited to your own test account until consent-screen setup is complete. Never share OAuth secrets.

### WhatsApp setup
1. Configure a Meta WhatsApp Business Cloud API app and subscribe its webhook to `messages`.
2. Use `https://YOUR-PAGES-DOMAIN/api/whatsapp/webhook` as the callback URL and the same value for `WHATSAPP_VERIFY_TOKEN` in Meta and Cloudflare.
3. Add `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` in Cloudflare.
4. Run `migration-v050.sql`.
5. This version validates Meta's GET verification token and stores incoming message IDs, sender numbers, type, text, and timestamp. Before production, add signature validation (`X-Hub-Signature-256`) using the Meta App Secret and a review UI. No send endpoint is provided; that is intentional until approvals and signature validation are implemented.

## Security and limits
- Google refresh token is encrypted at rest with AES-GCM; keep `JARVIS_ENCRYPTION_KEY` safe and backed up. Losing it means reconnecting Google.
- Do not expose credentials in frontend code or GitHub.
- `GET /api/google/gmail` and `/api/google/calendar` are not yet protected by a JARVIS login/session. **Do not deploy as a shared/public production service** until access authentication is added. For personal testing, use a private Cloudflare Access policy or add the auth layer first.
- WhatsApp webhook POST currently does not validate `X-Hub-Signature-256`; restrict deployment and add verification before production.
- Tasks still use browser `localStorage` with optional existing sync helper; this release does not migrate task storage.
- Gmail and Calendar are read-only. No messages are sent and no calendar events are created.
- Gemini still requires `GEMINI_API_KEY`; its presence is not assumed.

## Files
- `functions/api/google/auth.js`, `callback.js`: OAuth flow.
- `functions/api/google/gmail.js`, `calendar.js`: read-only API endpoints.
- `functions/api/whatsapp/webhook.js`: webhook verify/receive.
- `functions/api/integrations/status.js`: UI connection status.
- `functions/api/_lib.js`: encryption and token refresh helpers.
- `migration-v050.sql`: new D1 tables.

## Local run
Use a local HTTP server for UI-only work. Cloudflare Pages Functions, D1, OAuth callback, and webhook require a compatible local/deployed environment and configured secrets.
