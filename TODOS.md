# GlossIO — TODO Tracker

## Priority Legend
- **P1** — Must complete before launch
- **P2** — Should complete before launch
- **P3** — Post-launch improvement

## P1 — Must Complete

### Wire dashboard/services to Supabase
- **Why:** Services page shows mock data. Detailers can't add/edit/delete services.
- **Files:** `app/dashboard/services/page.tsx`
- **Effort:** M
- **Blocked by:** Nothing

### Wire dashboard/settings to Supabase
- **Why:** Settings page shows mock data. Can't update business hours, notifications, availability.
- **Files:** `app/dashboard/settings/page.tsx`
- **Effort:** M
- **Blocked by:** Nothing

### Wire dashboard/layout to real user data
- **Why:** Sidebar shows hardcoded user name/company.
- **Files:** `app/dashboard/layout.tsx`
- **Effort:** S
- **Blocked by:** Nothing

### Wire dashboard/link to real profile data
- **Why:** "My Link" page shows mock data.
- **Files:** `app/dashboard/link/page.tsx`
- **Effort:** S
- **Blocked by:** Nothing

### Build booking appointment save
- **Why:** Booking flow collects all data but doesn't write to Supabase. Core value loop broken.
- **Files:** `app/[slug]/book/page.tsx`, new API route needed
- **Effort:** M
- **Blocked by:** Nothing

### Wire booking flow to fetch real services by slug
- **Why:** Booking page uses MOCK_SERVICES instead of detailer's actual services.
- **Files:** `app/[slug]/book/page.tsx`
- **Effort:** S
- **Blocked by:** Nothing

### Wire dashboard/clients to Supabase
- **Why:** CRM page needs real client data.
- **Files:** `app/dashboard/clients/page.tsx`
- **Effort:** M
- **Blocked by:** Nothing

### Wire dashboard/appointments to Supabase
- **Why:** Appointment management needs real data + status transitions.
- **Files:** `app/dashboard/appointments/page.tsx`
- **Effort:** M
- **Blocked by:** Booking save must work first

### Wire dashboard/profile to Supabase
- **Why:** Profile edit page needs to read/write real profile data.
- **Files:** `app/dashboard/profile/page.tsx`
- **Effort:** M
- **Blocked by:** Nothing

## P2 — Should Complete Before Launch

### Add error handling to API routes
- **Why:** Twilio/Stripe errors bubble as raw 500s. Users see generic error pages.
- **Files:** All `app/api/*/route.ts`
- **Effort:** S
- **Blocked by:** Nothing

### Add file validation to upload-photo
- **Why:** No file size or type validation. Potential abuse vector.
- **Files:** `app/api/upload-photo/route.ts`
- **Effort:** S
- **Blocked by:** Nothing

### Create shared loading/error pattern for dashboard pages
- **Why:** 7 dashboard pages all need loading spinners and error messages. A shared useSupabaseQuery hook or wrapper component prevents 7 different implementations.
- **Files:** New shared hook/component + all dashboard pages
- **Effort:** M
- **Blocked by:** Pages must be wired first (can be retrofitted)
- **Context:** Identified during eng review. Without this, each page will implement loading/error differently, creating inconsistency.

### Add booking spam prevention
- **Why:** Public booking flow has no rate limiting or CAPTCHA.
- **Files:** Booking save API route (when built)
- **Effort:** S
- **Blocked by:** Booking save implementation

### Add double-submit prevention on booking form
- **Why:** Double-click on submit could create duplicate appointments.
- **Files:** `app/[slug]/book/page.tsx`
- **Effort:** S
- **Blocked by:** Nothing

## P3 — Post-Launch

### Add test suite
- **Why:** Zero tests exist. At minimum need API route tests and RLS verification.
- **Effort:** L

### Add error tracking (Sentry or similar)
- **Why:** No visibility into production errors.
- **Effort:** S

### Add structured logging to API routes
- **Why:** No logs for debugging production issues.
- **Effort:** S

### Add Error Boundary component
- **Why:** Unhandled React errors show blank pages.
- **Effort:** S

### Add forgot password flow
- **Why:** Users who forget passwords have no recovery path.
- **Effort:** M

### Add SMS appointment reminders
- **Why:** Twilio is integrated but automated reminders aren't built.
- **Effort:** L

### Add calendar view to dashboard
- **Why:** Dashboard has placeholder for calendar. Visual scheduling is a key feature.
- **Effort:** L
