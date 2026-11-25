# Chicanito | TikTok Sandbox
Private integration for one demo draft, never Direct Post. Do not enable in production TikTok.
 
## Deploy
- Preview first. Public storefront, orders and payments should have no changes.
- Dedicated Sandbox Neon branch/database: apply `sandbox-schema.sql` there, not in the live ordering database.
- Server-only Vercel environment variables: `TIKTOK_SANDBOX_CLIENT_KEY` (Sandbox, starts with sbaw), `TIKTOK_SANDBOX_CLIENT_SECRET`, `TIKTOK_SANDBOX_DATABASE_URL`, `TIKTOK_SANDBOX_ADMIN_PASSWORD` (generated random 24+ characters), `TIKTOK_SANDBOX_SESSION_KEY` (32 random bytes, encoded as base64). Use server-only sensitive storage; never put real values in Git, URLs, screenshots or chat.
- OAuth is intentionally bound to the verified canonical site and exact registered URI: `https://www.chicanito.app/tiktok-callback.html`. On the canonical site the protected panel is `/api/tiktok-sandbox`. Do not change or import any TikTok Production settings for this test.
- Only `user.info.basic` and `video.upload` are requested. Verify the expected Sandbox target user. No credential or code is displayed, and the refresh token is not retained. Sign out after the demo to remove the session server-side. Expired rows on the dedicated store are unreadable in the app and should be cleaned up after the pilot.
 
## Verify
Run `node --test` for the HTTP flow against simulated TikTok and storage, then check the protected route on Vercel. With credentials supplied securely, connect the Sandbox test user, choose an MP4 (4 MB or smaller), and send once. Report success only when the panel returns `SEND_TO_USER_INBOX` and the expected TikTok account actually receives the notification. Do not click Publish or submit the app-review form. If a response is unclear, inspect status first instead of retrying an upload.
