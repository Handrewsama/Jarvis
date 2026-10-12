-- JARVIS 0.5.0: executar una sola vegada a la base de dades D1 jarvis-db.
CREATE TABLE IF NOT EXISTS integration_tokens (provider TEXT PRIMARY KEY, encrypted_refresh_token TEXT NOT NULL, scopes TEXT, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS whatsapp_inbox (message_id TEXT PRIMARY KEY, from_number TEXT NOT NULL, message_type TEXT NOT NULL, message_text TEXT, received_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'received');
CREATE INDEX IF NOT EXISTS idx_whatsapp_inbox_received_at ON whatsapp_inbox(received_at DESC);
