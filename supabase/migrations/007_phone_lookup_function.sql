-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 007 — Bulletproof phone-based email lookup
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Adds a SECURITY DEFINER function that the lookup-email API calls during
-- phone-based login. It compares the LAST 10 DIGITS of both sides
-- (stripped of all non-digit characters) so it doesn't matter how the
-- phone was stored:
--   stored: "+12397842377", input: "(239) 784-2377"  → match ✅
--   stored: "(239) 784-2377", input: "+12397842377"  → match ✅
--   stored: "239-784-2377",   input: "239 784 2377"  → match ✅
--
-- This replaces the prior approach of generating 7 format variants and
-- doing IN (...) — that approach missed any format we hadn't anticipated.
--
-- SAFETY:
--   • Read-only function. Cannot modify data.
--   • SECURITY DEFINER so the netlify function (using the anon key) can call
--     it without RLS blocking the SELECT — but we only return the EMAIL,
--     never anything sensitive.
--   • Returns NULL if no match (function caller decides 404 vs 200).
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.find_email_by_phone(input_phone text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  with normalized as (
    select right(regexp_replace(coalesce(input_phone, ''), '[^0-9]', '', 'g'), 10) as needle
  )
  select p.email
  from public.profiles p, normalized n
  where length(n.needle) = 10
    and right(regexp_replace(coalesce(p.phone, ''), '[^0-9]', '', 'g'), 10) = n.needle
    and p.email is not null
    and p.email <> ''
  limit 1;
$$;

comment on function public.find_email_by_phone(text) is
  'Look up a user email by phone number, comparing only the last 10 digits of both sides (format-agnostic). Used by /api/lookup-email during phone-based sign-in.';

-- Allow anon + service_role to call this function (it only returns one email field)
grant execute on function public.find_email_by_phone(text) to anon, authenticated, service_role;
