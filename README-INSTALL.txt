JARVIS Cloud Sync — instruccions

Contingut:
- index.html: afegeix els controls de connexió a Configuració i carrega sync.js.
- api.js: client de l'API amb token només a sessionStorage.
- sync.js: connecta i sincronitza l'emmagatzematge local de tasques.
- functions/api/tasks.js: endpoint protegit que sincronitza tasques a D1.
- migration.sql: afegeix client_id i un índex únic.

IMPORTANT:
1. Abans de pujar aquests fitxers, comprova que Cloudflare Pages té DB -> jarvis-db i el secret JARVIS_API_TOKEN.
2. Executa migration.sql una sola vegada a D1. La columna priority ja s'ha afegit; si client_id ja existeix, no tornis a executar l'ALTER TABLE.
3. Substitueix els fitxers index.html, api.js i functions/api/tasks.js del repositori i afegeix sync.js a l'arrel.
4. No publiquis ni comparteixis el token. Introdueix-lo només a Configuració de JARVIS.
5. El endpoint actual fa una sincronització completa de la taula tasks, adequada per a aquest prototip personal d'un sol usuari. No l'utilitzis per a diversos usuaris sense afegir aïllament per usuari.
