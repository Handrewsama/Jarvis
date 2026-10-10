# J.A.R.V.I.S. Personal Assistant — Prototype 0.1

A static, installable web prototype for a personal task manager with a JARVIS-inspired dark/cyan interface.

## Included
- Responsive dashboard for iPhone and desktop.
- Create, edit, complete and delete tasks; priorities, due dates, search and filters.
- Local activity log and JSON export.
- Browser-language detection plus Catalan, Spanish and English interface options.
- Experimental browser speech recognition and a “Jarvis” wake-word mode.
- PWA manifest and service worker for basic offline caching.
- Gmail, Google Calendar and WhatsApp Business cards marked as not connected.

## Important limitations
- Tasks are stored in this browser's localStorage. There is no cross-device sync, account system, backend, AI API, email access or WhatsApp connection yet.
- Speech recognition depends on browser support and microphone permission. It generally requires the page to stay open; reliable always-on/background wake-word detection is not provided. iOS Safari may not support continuous recognition.
- The command parser is a simple local demo, not an LLM. Review parsed tasks.
- PWA service workers require HTTPS or localhost. Google Fonts are optional and need internet access.
- No API keys, OAuth credentials, Meta tokens or secrets are included.

## Run locally
Use a local HTTP server (service workers do not work from `file://`). From this folder, run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in a browser.

## Deploy on a free static host
Upload this folder to a static host such as Cloudflare Pages or GitHub Pages and use HTTPS. On iPhone, open the deployed URL in Safari, tap Share, then “Add to Home Screen”.

## Next steps
1. Add secure backend and authentication.
2. Add a database for cross-device sync.
3. Implement Google OAuth and Gmail/Calendar APIs server-side.
4. Add a human approval queue for external actions.
5. Integrate WhatsApp Business Cloud API after checking account/number eligibility.
6. Add a real AI model endpoint and secure scheduled jobs.
