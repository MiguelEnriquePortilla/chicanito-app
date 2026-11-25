-- Apply only to the dedicated Sandbox database/branch.
CREATE TABLE IF NOT EXISTS chicanito_tiktok_sandbox_sessions (
  id text PRIMARY KEY,
  enc text NOT NULL,
  expires bigint NOT NULL,
  upload_started boolean NOT NULL DEFAULT false
);
