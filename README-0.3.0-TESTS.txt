JARVIS 0.3.0 — proves recomanades

1. Memòria/context: crea una tasca per divendres i després digues “posa aquesta tasca per demà” o “canvia la tasca [títol] per dilluns”. Verifica data i títol.
2. Planificació: escriu “resum del dia”, “què tinc avui?”, “tasques pendents” i “què he fet?”.
3. Gestió conversacional: “completa [part del títol]” i “elimina [part del títol]”. La tasca es modifica directament; confirma el resultat a la llista.
4. Veu: prem el micròfon, dicta una ordre i comprova la resposta parlada. El reconeixement i la paraula d'activació poden estar limitats per iOS/Safari i no són fiables amb la pàgina tancada.
5. Integracions: /api/integrations/status només mostra si hi ha configuració al backend. Sense credencials oficials i consentiment OAuth, Gmail, Calendar i WhatsApp han de continuar mostrant-se com a no connectats.
6. Sincronització: comprova que les tasques noves, modificades i completades es mantenen després de recarregar la pàgina.

Seguretat: no enganxis tokens ni secrets a l'aplicació client ni els pugis a GitHub. Desa credencials exclusivament com a secrets de Cloudflare.
