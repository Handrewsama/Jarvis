JARVIS VERSION / CACHE UPDATE — 0.1.1 (BUILD 20261011-01)

Upload/replace these files in the GitHub repository root:
index.html, styles.css, app.js, api.js, sync.js, sw.js, manifest.webmanifest, functions/api/tasks.js
Keep migration.sql if you already added/executed it. Do not execute the migration again.

This build shows VERSION 0.1.1 · BUILD 20261011-01 in the footer, adds version query strings to CSS/JS/manifest, updates the service worker cache identifier, deletes older jarvis-* caches, and uses network-first for the HTML shell.

After committing, wait for Cloudflare Pages deployment to show Success. Then open https://jarvis-3gp.pages.dev/?v=20261011-01. In iPhone Safari, if an old app is still installed on the Home Screen, close it fully and reopen it.
