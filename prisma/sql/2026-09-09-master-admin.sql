-- Promote the club's master account to an active staff superuser.
--
-- The app does this automatically (lib/accounts.ts) when the account signs up
-- or logs in with an email listed in ADMIN_EMAILS (default: saipdhodi@gmail.com).
-- Run this only if you need to promote the account manually, e.g. before the
-- first login on a freshly restored database.

UPDATE auth_user
SET is_active = TRUE, is_staff = TRUE, is_superuser = TRUE
WHERE lower(email) = lower('saipdhodi@gmail.com');
