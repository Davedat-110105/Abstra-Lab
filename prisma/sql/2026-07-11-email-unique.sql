-- Enforce unique emails on auth_user (matches `email String @unique` in schema.prisma).
--
-- IMPORTANT: adding this constraint FAILS if duplicate emails already exist.
-- Run step 1 first; only run step 2 if it returns zero rows.
--
-- The constraint is case-SENSITIVE (mirrors Prisma's @unique). If you want
-- case-insensitive uniqueness instead, replace step 2 with the commented
-- functional index at the bottom and normalize emails to lowercase on signup.

-- Step 1 — check for duplicates before applying:
--   SELECT email, count(*) FROM auth_user GROUP BY email HAVING count(*) > 1;

-- Step 2 — apply the constraint:
ALTER TABLE auth_user ADD CONSTRAINT auth_user_email_key UNIQUE (email);

-- Alternative (case-insensitive) — use INSTEAD of step 2 if desired:
--   CREATE UNIQUE INDEX auth_user_email_lower_key ON auth_user (lower(email));
