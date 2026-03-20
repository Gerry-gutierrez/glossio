# GlossIO — Features To Build

---

## Front-End — All Complete ✓

All front-end items built:
- Settings Sub-Pages (Business Info, Availability, Notifications, Billing, Support, Account)
- Profile Management UI (edit modal, photo grid, preview mode)
- Dashboard home (dynamic stats, recent appointments)
- Link Page (dynamic slug, share guidance, share actions)
- Public Booking Profile (services bottom sheet, photo modal, dynamic data)
- Services, Appointments, Clients pages

---

## Back-End — All Complete ✓

### Supabase Client + Data Layer
- `src/js/supabase-client.js` — Supabase SDK init, auth helpers (signUp, signIn, signOut, resetPassword, onAuthStateChange)
- `src/js/supabase-data.js` — Full data layer with localStorage fallback (profile, services, photos, clients, appointments, settings, storage)
- `src/_data/env.js` — Environment variables exposed to 11ty templates
- `src/_includes/layouts/base.njk` — CDN scripts (Supabase, Sentry), config injection

### Netlify Functions (API Routes)
- `netlify/functions/send-code.js` — /api/send-code (Twilio SMS OTP)
- `netlify/functions/verify-code.js` — /api/verify-code (verify OTP)
- `netlify/functions/check-email.js` — /api/check-email
- `netlify/functions/confirm-email.js` — /api/confirm-email (admin confirm)
- `netlify/functions/seed-profile.js` — /api/seed-profile (post-signup defaults)
- `netlify/functions/lookup-email.js` — /api/lookup-email (find email by phone)
- `netlify/functions/sign-out.js` — /api/sign-out (clear session)
- `netlify/functions/public-profile.js` — /api/public-profile?slug=x (public profile API)
- `netlify/functions/stripe-webhook.js` — /api/webhooks/stripe
- `netlify/functions/stripe-checkout.js` — /api/stripe-checkout (create checkout session)
- `netlify/functions/stripe-portal.js` — /api/stripe-portal (billing portal redirect)
- `netlify/functions/send-booking-notification.js` — /api/send-booking-notification (SMS)
- `netlify/functions/send-reminder.js` — /api/send-reminder (24hr reminder cron)

### Dynamic Routing
- Netlify redirects in `netlify.toml` for `/profile/:slug` → public-profile page
- `src/js/public-profile.js` — Extracts slug from URL, fetches from API, falls back to localStorage

### Stripe Integration
- `src/js/stripe-client.js` — Client-side checkout redirect + billing portal
- Stripe webhook handler for subscription lifecycle events

### Error Monitoring
- `src/js/sentry-init.js` — Sentry client-side init (conditional on DSN)

---

## Auth — All Wired Up ✓

Code is written and ready — just needs API keys to go live:
- `src/js/login.js` — Email/phone auto-detect login, Supabase signIn
- `src/js/signup.js` — 3-step signup with Twilio phone verification, Supabase signUp, profile seeding
- `src/js/forgot-password.js` — Password reset via Supabase
- `src/js/auth-guard.js` — Redirects unauthenticated users, hydrates sidebar with real data

---

## Needs User Input (API keys + deployment only)

### Environment & Deployment
- [ ] Supabase project URL + anon key
- [ ] Stripe publishable key + secret key + webhook secret
- [ ] Twilio account SID + auth token + phone number
- [ ] Sentry DSN (optional)
- [ ] Netlify deployment + `npm install` in functions directory
- [ ] Custom domain + SSL setup

---

## Database Schema Reference
See: `supabase/migrations/001_initial.sql` for full schema + RLS + views.

## Design System Reference
See: `DESIGN.md` and `src/css/globals.css` for all design tokens.
