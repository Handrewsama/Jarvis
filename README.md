# J.A.R.V.I.S. Personal Assistant — 0.2.1

Responsive installable PWA with a dark/cyan interface, Catalan/Spanish/English UI, task management, local activity, speech-command prototype, Cloudflare Pages Functions API and D1 sync.

## Included in this build
- Task creation, editing, completion, deletion, search and priority filters.
- Daily, weekly and monthly recurrence (a new task is generated when a recurring task is completed; it needs a due date).
- Browser notifications for due/overdue tasks while the app is open and visible, if permission is granted.
- JSON backup export/import and calendar export as `.ics`.
- Token-based API connection; token remains in sessionStorage, not in repository files.
- Cloud sync to D1 through `functions/api/tasks.js`.
- PWA manifest/service worker and responsive iPhone layout.

## Cloudflare deployment
1. Deploy this folder as a Cloudflare Pages project.
2. Create D1 database `jarvis-db` and bind it to the Pages project with binding name `DB`.
3. Add `JARVIS_API_TOKEN` as a **Secret** in Production. Use the same long random value in JARVIS Settings. Never commit it to GitHub.
4. If you already applied the previous migration, run `migration-v020.sql` once to add the `repeat` column. Do not rerun it after it succeeds. If the original schema is not installed, apply the original migration first, then this one.
5. Redeploy after changing production secrets.

## Important limitations
- Gmail, Google Calendar and WhatsApp Business are not connected. Real integrations require OAuth/Meta setup, server-side secrets, consent and endpoint code; this build does not claim they work.
- Notification checks are browser-side and work only while JARVIS is open/active. iOS may limit background notifications. For dependable scheduled push reminders, a server scheduler and push subscription infrastructure are still required.
- Voice recognition is browser-dependent and does not provide reliable always-on listening or background execution on iOS.
- The current sync endpoint replaces the task list in D1 with the submitted list. Use one trusted JARVIS workspace/token; multi-user separation is not implemented.

## Local testing
Serve over HTTPS or localhost. PWA service workers do not work from `file://`.


## 0.2.1
La conversa de JARVIS mostra les instruccions i respostes en format de xat. El camp de text es neteja després de processar cada ordre. El reconeixement de tasques accepta expressions de recurrència diària, setmanal i mensual, així com dates relatives i numèriques.
