BEGIN;
CREATE TABLE IF NOT EXISTS public.chicanito_tiktok_sandbox_sessions (
  id text PRIMARY KEY, enc text NOT NULL, expires bigint NOT NULL,
  upload_started boolean NOT NULL DEFAULT false
);
ALTER TABLE public.chicanito_tiktok_sandbox_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.chicanito_tiktok_sandbox_sessions FROM PUBLIC, anon, authenticated;
COMMIT;
-- Configure a dedicated tiktok_panel login with only SELECT, INSERT, UPDATE and
-- DELETE on this table and an RLS policy only for that role. Keep its password
-- outside SQL snippets, source control, and conversations.
