-- Executa una sola vegada a Cloudflare D1 > jarvis-db > Console.
-- La columna priority ja s'ha afegit segons els passos anteriors.
ALTER TABLE tasks ADD COLUMN client_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
