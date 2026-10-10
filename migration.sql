ALTER TABLE tasks ADD COLUMN client_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_client_id
ON tasks(client_id);
