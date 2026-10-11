JARVIS 0.2.0 — INSTAL·LACIÓ

1. Desplega la carpeta al projecte Cloudflare Pages existent.
2. Comprova el binding D1 DB -> jarvis-db.
3. Comprova que JARVIS_API_TOKEN existeix com a Secret a Production.
4. Si canvies el secret, torna a desplegar Production.
5. Obre JARVIS > Configuració > Connectar i sincronitzar i introdueix el mateix token.
6. Prova crear, completar i sincronitzar una tasca.

Si ja havies aplicat la migració anterior, executa migration-v020.sql una sola vegada per afegir la columna repeat. No la tornis a executar després que hagi funcionat.
Les integracions Gmail/Calendar/WhatsApp necessiten configuració OAuth/API real i no estan connectades en aquesta versió.
