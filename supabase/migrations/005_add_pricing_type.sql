-- Add pricing_type column to services table
-- 'fixed' = has a set price, 'quote' = client must request a quote
alter table public.services
  add column if not exists pricing_type text not null default 'fixed'
  check (pricing_type in ('fixed', 'quote'));
