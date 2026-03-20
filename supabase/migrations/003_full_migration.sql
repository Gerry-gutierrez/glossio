-- ─────────────────────────────────────────────────────────────────────────────
-- GlossIO — Full Migration (handles existing appointments table)
-- Safe to run — uses IF NOT EXISTS everywhere
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                      uuid primary key references auth.users(id) on delete cascade,
  first_name              text not null default '',
  last_name               text not null default '',
  email                   text not null default '',
  phone                   text,
  company_name            text,
  slug                    text unique,
  tagline                 text,
  bio                     text,
  instagram_handle        text,
  location                text,
  avatar_url              text,
  is_pro                  boolean not null default false,
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  subscription_status     text not null default 'trialing'
                            check (subscription_status in ('trialing','active','past_due','canceled','incomplete')),
  trial_ends_at           timestamptz,
  two_factor_enabled      boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ─── Services ─────────────────────────────────────────────────────────────────
create table if not exists public.services (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  description text,
  price       numeric(10,2) not null default 0,
  icon        text not null default '🚗',
  color       text not null default '#00C2FF',
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists services_profile_id_idx on public.services(profile_id);

-- ─── Work Photos ──────────────────────────────────────────────────────────────
create table if not exists public.work_photos (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  url         text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists work_photos_profile_id_idx on public.work_photos(profile_id);

-- ─── Clients ──────────────────────────────────────────────────────────────────
create table if not exists public.clients (
  id             uuid primary key default uuid_generate_v4(),
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  first_name     text not null default '',
  last_name      text not null default '',
  email          text,
  phone          text,
  vehicle_year   text,
  vehicle_make   text,
  vehicle_model  text,
  vehicle_color  text,
  source         text,
  notes          text,
  created_at     timestamptz not null default now()
);

create index if not exists clients_profile_id_idx on public.clients(profile_id);
create index if not exists clients_email_idx on public.clients(email);
create index if not exists clients_phone_idx on public.clients(phone);

-- ─── Fix existing appointments table ─────────────────────────────────────────
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS client_id uuid;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS service_id uuid;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS profile_id uuid;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS scheduled_date date;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS scheduled_time time;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS price numeric(10,2) default 0;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();

-- ─── Availability Blocks ──────────────────────────────────────────────────────
create table if not exists public.availability_blocks (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  start_date  date not null,
  end_date    date not null,
  reason      text,
  created_at  timestamptz not null default now(),
  constraint valid_date_range check (end_date >= start_date)
);

create index if not exists availability_blocks_profile_id_idx on public.availability_blocks(profile_id);

-- ─── Business Hours ───────────────────────────────────────────────────────────
create table if not exists public.business_hours (
  id           uuid primary key default uuid_generate_v4(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  day_of_week  integer not null check (day_of_week between 0 and 6),
  is_open      boolean not null default true,
  open_time    time not null default '08:00',
  close_time   time not null default '17:00',
  unique (profile_id, day_of_week)
);

create index if not exists business_hours_profile_id_idx on public.business_hours(profile_id);

-- ─── Notification Settings ────────────────────────────────────────────────────
create table if not exists public.notification_settings (
  profile_id                    uuid primary key references public.profiles(id) on delete cascade,
  booking_alerts_enabled        boolean not null default true,
  booking_alerts_channel        text not null default 'both'
                                  check (booking_alerts_channel in ('sms','email','both')),
  cancellation_alerts_enabled   boolean not null default true,
  cancellation_alerts_channel   text not null default 'both'
                                  check (cancellation_alerts_channel in ('sms','email','both')),
  reminder_24hr_enabled         boolean not null default true,
  weekly_summary_enabled        boolean not null default true,
  weekly_summary_day            integer not null default 1 check (weekly_summary_day between 0 and 6),
  weekly_include_upcoming       boolean not null default true,
  weekly_include_revenue        boolean not null default true,
  weekly_include_new_clients    boolean not null default true,
  weekly_include_cancellations  boolean not null default true
);

-- ─── Availability Settings ────────────────────────────────────────────────────
create table if not exists public.availability_settings (
  profile_id               uuid primary key references public.profiles(id) on delete cascade,
  max_appointments_per_day integer,
  advance_booking_days     integer not null default 30,
  minimum_notice_hours     integer not null default 24
);

-- ─── Verification Codes ───────────────────────────────────────────────────────
create table if not exists public.verification_codes (
  id          uuid primary key default uuid_generate_v4(),
  identifier  text not null,
  code        text not null,
  type        text not null
                check (type in ('phone_signup','phone_change','2fa','email_change')),
  expires_at  timestamptz not null default (now() + interval '10 minutes'),
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists verification_codes_identifier_idx on public.verification_codes(identifier, type);

-- ─── Functions ───────────────────────────────────────────────────────────────

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, trial_ends_at)
  values (new.id, new.email, now() + interval '14 days')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.cleanup_expired_codes()
returns void language sql as $$
  delete from public.verification_codes where expires_at < now();
$$;

create or replace function public.seed_profile_defaults(profile_uuid uuid)
returns void language plpgsql security definer as $$
begin
  insert into public.business_hours (profile_id, day_of_week, is_open, open_time, close_time)
  values
    (profile_uuid, 0, false, '08:00', '17:00'),
    (profile_uuid, 1, true,  '08:00', '17:00'),
    (profile_uuid, 2, true,  '08:00', '17:00'),
    (profile_uuid, 3, true,  '08:00', '17:00'),
    (profile_uuid, 4, true,  '08:00', '17:00'),
    (profile_uuid, 5, true,  '08:00', '17:00'),
    (profile_uuid, 6, true,  '09:00', '15:00')
  on conflict (profile_id, day_of_week) do nothing;

  insert into public.notification_settings (profile_id)
  values (profile_uuid)
  on conflict (profile_id) do nothing;

  insert into public.availability_settings (profile_id)
  values (profile_uuid)
  on conflict (profile_id) do nothing;
end;
$$;

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.profiles               enable row level security;
alter table public.services               enable row level security;
alter table public.work_photos            enable row level security;
alter table public.clients                enable row level security;
alter table public.appointments           enable row level security;
alter table public.availability_blocks    enable row level security;
alter table public.business_hours         enable row level security;
alter table public.notification_settings  enable row level security;
alter table public.availability_settings  enable row level security;
alter table public.verification_codes     enable row level security;

-- Profiles
drop policy if exists "profiles_select_public" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_select_public" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- Services
drop policy if exists "services_select_public" on public.services;
drop policy if exists "services_all_own" on public.services;
create policy "services_select_public" on public.services for select using (is_active = true);
create policy "services_all_own" on public.services for all using (auth.uid() = profile_id);

-- Work photos
drop policy if exists "work_photos_select_public" on public.work_photos;
drop policy if exists "work_photos_all_own" on public.work_photos;
create policy "work_photos_select_public" on public.work_photos for select using (true);
create policy "work_photos_all_own" on public.work_photos for all using (auth.uid() = profile_id);

-- Clients
drop policy if exists "clients_all_own" on public.clients;
create policy "clients_all_own" on public.clients for all using (auth.uid() = profile_id);

-- Appointments
drop policy if exists "appointments_all_own" on public.appointments;
create policy "appointments_all_own" on public.appointments for all using (auth.uid() = profile_id);

-- Availability blocks
drop policy if exists "availability_blocks_all_own" on public.availability_blocks;
create policy "availability_blocks_all_own" on public.availability_blocks for all using (auth.uid() = profile_id);

-- Business hours
drop policy if exists "business_hours_select_public" on public.business_hours;
drop policy if exists "business_hours_all_own" on public.business_hours;
create policy "business_hours_select_public" on public.business_hours for select using (true);
create policy "business_hours_all_own" on public.business_hours for all using (auth.uid() = profile_id);

-- Notification settings
drop policy if exists "notification_settings_all_own" on public.notification_settings;
create policy "notification_settings_all_own" on public.notification_settings for all using (auth.uid() = profile_id);

-- Availability settings
drop policy if exists "availability_settings_all_own" on public.availability_settings;
create policy "availability_settings_all_own" on public.availability_settings for all using (auth.uid() = profile_id);

-- Verification codes
drop policy if exists "verification_codes_service_only" on public.verification_codes;
create policy "verification_codes_service_only" on public.verification_codes for all using (false);

-- ─── Client Stats View ──────────────────────────────────────────────────────
create or replace view public.client_stats as
select
  c.id, c.profile_id, c.first_name, c.last_name, c.email, c.phone,
  c.vehicle_year, c.vehicle_make, c.vehicle_model, c.vehicle_color,
  c.source, c.notes, c.created_at,
  count(a.id) filter (where a.status = 'complete') as total_visits,
  coalesce(sum(a.price) filter (where a.status = 'complete'), 0) as total_spent,
  max(a.scheduled_date) filter (where a.status = 'complete') as last_visit
from public.clients c
left join public.appointments a on a.client_id = c.id
group by c.id;

-- ─── Seed Virgilio's profile ─────────────────────────────────────────────────
insert into public.profiles (id, email, first_name, last_name, phone, company_name, slug, tagline, trial_ends_at)
select
  u.id, u.email,
  coalesce(u.raw_user_meta_data->>'first_name', ''),
  coalesce(u.raw_user_meta_data->>'last_name', ''),
  coalesce(u.raw_user_meta_data->>'phone', ''),
  coalesce(u.raw_user_meta_data->>'company_name', ''),
  lower(regexp_replace(coalesce(u.raw_user_meta_data->>'company_name', u.email), '[^a-zA-Z0-9]+', '-', 'g')),
  'Professional detailing in your area',
  now() + interval '14 days'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- Seed defaults for all users
do $$
declare r record;
begin
  for r in select id from public.profiles loop
    perform public.seed_profile_defaults(r.id);
  end loop;
end;
$$;
