# GlossIO — TODO Tracker

## Priority Legend
- **P1** — Must complete before launch
- **P2** — Should complete before launch
- **P3** — Post-launch improvement

---

## P1 — Must Complete

### Deploy & Go Live ✓
- [x] Supabase project URL + anon key
- [x] Stripe publishable key + secret key + webhook secret
- [x] Twilio account SID + auth token + phone number
- [ ] Sentry DSN (optional — skipped for now)
- [x] Railway deployment (Docker + server.js)
- [x] Custom domain `glossio.org` + SSL via Railway

---

## P2 — Should Complete Before Launch

### Persistent Rate Limiting (Supabase)
- **Status:** In-memory rate limiting in `netlify/functions/send-code.js` resets on every cold start — effectively no rate limiting in serverless
- **Action:** Create a `rate_limits` table in Supabase. Check/increment counters there instead of `global._otpLimits`. Also applies to `send-booking-notification.js`.
- **Effort:** S
- **Why:** Without this, someone can spam OTP requests by triggering new function instances

---

## P3 — Post-Launch

### Open Graph Meta Tags for Public Profile
- **Status:** Public profile page has no og:title, og:description, og:image tags
- **Action:** Add OG meta tags to `src/public-profile.njk` template (dynamically populated via JS or with sensible defaults)
- **Effort:** XS
- **Why:** Shared links on social media show as plain URLs with no preview — hurts virality

### Add SMS appointment reminders (cron)
- **Status:** Edge function ready (`supabase/functions/send-reminder/index.ts`), needs Supabase pg_cron scheduling
- **Action:** Run SQL in Supabase dashboard to enable daily cron (see below)
- **Effort:** S

---

## Completed (Reference)

### Front-End ✓
All pages built in 11ty/Nunjucks with full responsive mobile support:
- Landing page with mobile hamburger nav
- Login, Signup, Forgot Password
- Dashboard home (stats, recent appointments)
- Services (tabbed view, add/edit/delete modals)
- Appointments (list + calendar views, status filters)
- Clients CRM (search, sort, detail view)
- Profile (edit modal, photo grid, preview)
- Link page (share actions, slug display)
- Settings (Business Info, Availability, Notifications, Billing, Support, Account)
- Public booking profile (services sheet, photo modal)

### Back-End ✓
- Supabase client + full data layer with localStorage fallback
- 12 Supabase Edge Functions (auth, billing, notifications, profiles)
- Stripe checkout + billing portal + webhooks
- Twilio SMS OTP + booking notifications
- Sentry error monitoring (client-side)
- Auth guard + sidebar hydration

### Structured Logging ✓
- `lib/logger.ts` with JSON output (logInfo, logWarn, logError)
- Used in API routes for Railway log aggregation

### Calendar View ✓
- Dual-month calendar in `src/dashboard/appointments.njk` + `src/js/appointments.js`
- Color-coded dots by status, appointment counts per day

### Test Suite ✓
- vitest configured with Deno Edge Function mocks
- 12 test files covering all Supabase Edge Functions:
  - `send-code`, `verify-code`, `check-email`, `confirm-email`
  - `lookup-email`, `seed-profile`, `public-profile`
  - `stripe-checkout`, `stripe-portal`, `stripe-webhook`
  - `send-booking-notification`, `send-reminder`
- Run: `npm test`

### Hardening ✓
- Error handling on all Edge Functions (safe JSON parse, user-friendly messages)
- File upload validation (10 MB max, JPEG/PNG/WebP/HEIC only)
- Rate limiting on booking notifications (5/hr per IP) and OTP sends (3/10min per phone)
- Double-submit prevention on booking buttons

### Mobile Responsiveness ✓
- Viewport meta with `viewport-fit=cover`
- 768px + 480px breakpoints across all CSS
- Landing page hamburger menu + slide-in drawer
- Dashboard sidebar drawer (existing)
- 44px minimum touch targets on mobile
- Safe-area / notch padding for iOS

---

## References
- **Database schema:** `supabase/migrations/001_initial.sql`
- **Design system:** `DESIGN.md` + `src/css/globals.css`
- **Build status log:** `src/SUMMARY_LOG.md`
