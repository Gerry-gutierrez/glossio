-- ─────────────────────────────────────────────────────────────────────────────
-- GlossIO — Initial Schema
-- Run this in your Supabase SQL editor (or via supabase db push)
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────────────────────
-- One row per detailer, extends auth.users
create table public.profiles (
  id                      uuid primary key references auth.users(id) on delete cascade,
  first_name              text not null default '',
  last_name               text not null default '',
  email                   text not null default '',
  phone                   text,
  company_name            text,
  slug                    text unique,  -- e.g. "carlos-detail-co"
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

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create profile row when user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, trial_ends_at)
  values (
    new.id,
    new.email,
    now() + interval '14 days'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Services ─────────────────────────────────────────────────────────────────
create table public.services (
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

create index services_profile_id_idx on public.services(profile_id);

-- ─── Work Photos ──────────────────────────────────────────────────────────────
create table public.work_photos (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  url         text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index work_photos_profile_id_idx on public.work_photos(profile_id);

-- ─── Clients ──────────────────────────────────────────────────────────────────
create table public.clients (
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
  source         text,  -- how they found the detailer
  notes          text,
  created_at     timestamptz not null default now()
);

create index clients_profile_id_idx on public.clients(profile_id);
create index clients_email_idx on public.clients(email);
create index clients_phone_idx on public.clients(phone);

-- ─── Appointments ─────────────────────────────────────────────────────────────
create table public.appointments (
  id               uuid primary key default uuid_generate_v4(),
  profile_id       uuid not null references public.profiles(id) on delete cascade,
  client_id        uuid not null references public.clients(id) on delete cascade,
  service_id       uuid not null references public.services(id) on delete restrict,
  status           text not null default 'pending'
                     check (status in ('pending','confirmed','complete','cancelled')),
  scheduled_date   date not null,
  scheduled_time   time not null,
  notes            text,
  price            numeric(10,2) not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger appointments_updated_at
  before update on public.appointments
  for each row execute function public.handle_updated_at();

create index appointments_profile_id_idx on public.appointments(profile_id);
create index appointments_client_id_idx on public.appointments(client_id);
create index appointments_scheduled_date_idx on public.appointments(scheduled_date);
create index appointments_status_idx on public.appointments(status);

-- ─── Availability Blocks ──────────────────────────────────────────────────────
create table public.availability_blocks (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  start_date  date not null,
  end_date    date not null,
  reason      text,
  created_at  timestamptz not null default now(),
  constraint valid_date_range check (end_date >= start_date)
);

create index availability_blocks_profile_id_idx on public.availability_blocks(profile_id);

-- ─── Business Hours ───────────────────────────────────────────────────────────
create table public.business_hours (
  id           uuid primary key default uuid_generate_v4(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  day_of_week  integer not null check (day_of_week between 0 and 6),
  is_open      boolean not null default true,
  open_time    time not null default '08:00',
  close_time   time not null default '17:00',
  unique (profile_id, day_of_week)
);

create index business_hours_profile_id_idx on public.business_hours(profile_id);

-- ─── Notification Settings ────────────────────────────────────────────────────
create table public.notification_settings (
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
create table public.availability_settings (
  profile_id               uuid primary key references public.profiles(id) on delete cascade,
  max_appointments_per_day integer,  -- null = unlimited
  advance_booking_days     integer not null default 30,
  minimum_notice_hours     integer not null default 24
);

-- ─── Verification Codes ───────────────────────────────────────────────────────
-- Short-lived OTP codes sent via Twilio SMS
create table public.verification_codes (
  id          uuid primary key default uuid_generate_v4(),
  identifier  text not null,  -- phone number or email
  code        text not null,
  type        text not null
                check (type in ('phone_signup','phone_change','2fa','email_change')),
  expires_at  timestamptz not null default (now() + interval '10 minutes'),
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index verification_codes_identifier_idx on public.verification_codes(identifier, type);

-- Auto-delete expired codes (run periodically via pg_cron or just clean on use)
create or replace function public.cleanup_expired_codes()
returns void language sql as $$
  delete from public.verification_codes where expires_at < now();
$$;

-- ─── Seed business hours for new profiles ─────────────────────────────────────
create or replace function public.seed_profile_defaults(profile_uuid uuid)
returns void language plpgsql security definer as $$
declare
  default_hours record;
begin
  -- Insert default business hours (Mon-Fri 8-5, Sat 9-3, Sun closed)
  insert into public.business_hours (profile_id, day_of_week, is_open, open_time, close_time)
  values
    (profile_uuid, 0, false, '08:00', '17:00'), -- Sunday
    (profile_uuid, 1, true,  '08:00', '17:00'), -- Monday
    (profile_uuid, 2, true,  '08:00', '17:00'), -- Tuesday
    (profile_uuid, 3, true,  '08:00', '17:00'), -- Wednesday
    (profile_uuid, 4, true,  '08:00', '17:00'), -- Thursday
    (profile_uuid, 5, true,  '08:00', '17:00'), -- Friday
    (profile_uuid, 6, true,  '09:00', '15:00')  -- Saturday
  on conflict (profile_id, day_of_week) do nothing;

  -- Insert default notification settings
  insert into public.notification_settings (profile_id)
  values (profile_uuid)
  on conflict (profile_id) do nothing;

  -- Insert default availability settings
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

-- Profiles: users can only read/write their own row
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Public profile read (for booking page — any anon can view)
create policy "profiles_select_public" on public.profiles
  for select using (true);  -- filtered by slug in query

-- Services: owner only, but public can read active ones
create policy "services_select_public" on public.services
  for select using (is_active = true);

create policy "services_all_own" on public.services
  for all using (auth.uid() = profile_id);

-- Work photos: public read, owner write
create policy "work_photos_select_public" on public.work_photos
  for select using (true);

create policy "work_photos_all_own" on public.work_photos
  for all using (auth.uid() = profile_id);

-- Clients: owner only
create policy "clients_all_own" on public.clients
  for all using (auth.uid() = profile_id);

-- Appointments: owner only (detailer)
create policy "appointments_all_own" on public.appointments
  for all using (auth.uid() = profile_id);

-- Availability blocks: owner only
create policy "availability_blocks_all_own" on public.availability_blocks
  for all using (auth.uid() = profile_id);

-- Business hours: public read, owner write
create policy "business_hours_select_public" on public.business_hours
  for select using (true);

create policy "business_hours_all_own" on public.business_hours
  for all using (auth.uid() = profile_id);

-- Notification settings: owner only
create policy "notification_settings_all_own" on public.notification_settings
  for all using (auth.uid() = profile_id);

-- Availability settings: owner only
create policy "availability_settings_all_own" on public.availability_settings
  for all using (auth.uid() = profile_id);

-- Verification codes: service role only (no direct client access)
create policy "verification_codes_service_only" on public.verification_codes
  for all using (false);  -- only accessible via service role key

-- ─── Useful Views ─────────────────────────────────────────────────────────────

-- Client stats for CRM
create or replace view public.client_stats as
select
  c.id,
  c.profile_id,
  c.first_name,
  c.last_name,
  c.email,
  c.phone,
  c.vehicle_year,
  c.vehicle_make,
  c.vehicle_model,
  c.vehicle_color,
  c.source,
  c.notes,
  c.created_at,
  count(a.id) filter (where a.status = 'complete') as total_visits,
  coalesce(sum(a.price) filter (where a.status = 'complete'), 0) as total_spent,
  max(a.scheduled_date) filter (where a.status = 'complete') as last_visit
from public.clients c
left join public.appointments a on a.client_id = c.id
group by c.id;
