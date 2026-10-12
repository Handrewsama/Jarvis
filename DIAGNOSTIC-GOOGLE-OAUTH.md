# JARVIS — diagnòstic Google OAuth

Aquesta actualització afegeix motius d'error no sensibles al retorn OAuth i missatges més útils a la pantalla Integracions.

## Fitxers modificats
- `functions/api/google/callback.js`
- `integrations.js`

## Instal·lació
1. Descomprimeix el ZIP.
2. Puja els canvis a la branca `main` del repositori GitHub, mantenint les carpetes.
3. Espera que Cloudflare Pages acabi el desplegament.
4. Obre JARVIS, inicia sessió/configura el token privat i torna a connectar Google des de la pantalla Integracions.
5. Si falla, copia el missatge complet que aparegui a la pantalla Integracions. El missatge no ha de contenir tokens ni secrets.

No cal executar cap migració D1 per aquests canvis. Aquesta actualització no valida en directe les credencials del compte ni substitueix una prova al desplegament.


## Important: actualització de memòria cau (2026-10-12)
Aquesta revisió incrementa la versió de `index.html` i `sw.js` a `20261012-01` perquè el navegador/service worker no reutilitzi `integrations.js` antic. Després del desplegament, tanca completament la pestanya/app web de JARVIS i torna-la a obrir. Si encara es mostra el missatge antic, comprova que el darrer deployment de Cloudflare sigui el commit que conté aquests canvis.
