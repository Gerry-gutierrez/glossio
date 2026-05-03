-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 006 — Add phone_verified_at column to profiles
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Adds a nullable timestamp tracking when the user's cell phone was verified
-- via Twilio SMS OTP at signup.
--
-- SAFETY:
--   • This is purely additive — no existing data is touched.
--   • Existing users (Virgilio, Jesus, anyone who signed up before this
--     migration) will have phone_verified_at = NULL forever.
--   • The signup flow is the ONLY place that reads/writes this column.
--     Login, dashboard, and all other flows ignore it entirely.
--   • Therefore, NULL values do NOT lock anyone out, gate them, or change
--     any user-facing behavior. Grandfather logic happens via "we just
--     don't check this column anywhere except new signups."
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists phone_verified_at timestamptz;

comment on column public.profiles.phone_verified_at is
  'Timestamp when phone was verified via Twilio SMS OTP at signup. NULL for accounts created before SMS verification was re-enabled.';
