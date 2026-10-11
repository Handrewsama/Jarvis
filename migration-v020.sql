-- Executa una sola vegada a Cloudflare D1 > jarvis-db > Console.
-- Afegim recurrència sense tocar les tasques existents.
ALTER TABLE tasks ADD COLUMN repeat TEXT NOT NULL DEFAULT 'none';
