JARVIS 0.4.0 — GEMINI EXPERIMENT
- New Cloudflare Pages Function: functions/api/interpret.js
- Configure GEMINI_API_KEY as a Cloudflare Pages secret.
- Natural-language intent is returned as structured JSON.
- Update/complete/delete actions require a matching existing task ID.
- If Gemini is unavailable, modification commands do not fall back to task creation.
- Chat history is stored locally in the browser.
- No database migration is needed for this uploaded localStorage-based project.
