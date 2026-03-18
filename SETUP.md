# GlossIO — Setup Guide

## 1. Install Node.js

Download and install Node.js (v20 LTS) from: https://nodejs.org/

After installing, open a new terminal and verify:
```
node --version   # should say v20.x.x
npm --version    # should say 10.x.x
```

## 2. Install Dependencies

In the project folder (`C:\Users\Gerar\Desktop\gloss-io`), run:
```
npm install
```

## 3. Configure Environment Variables

Copy the example file and fill in your credentials:
```
copy .env.local.example .env.local
```

Then edit `.env.local` with your actual keys:

### Supabase
1. Go to https://supabase.com → New Project
2. After it creates, go to Project Settings → API
3. Copy the `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy the `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### Run the Database Migration
In your Supabase dashboard → SQL Editor → paste the contents of:
`supabase/migrations/001_initial.sql`
Then click Run.

### Stripe
1. Go to https://stripe.com → Create account
2. Dashboard → Developers → API keys
3. Copy Secret key → `STRIPE_SECRET_KEY`
4. Copy Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. Create two Products in Stripe (Monthly $25/mo and Annual $250/yr)
6. Copy each Price ID → `STRIPE_MONTHLY_PRICE_ID` and `STRIPE_ANNUAL_PRICE_ID`
7. For the webhook: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
8. Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`

### Twilio
1. Go to https://twilio.com → Create account
2. Console → Account SID → `TWILIO_ACCOUNT_SID`
3. Console → Auth Token → `TWILIO_AUTH_TOKEN`
4. Create a Verify Service → `TWILIO_VERIFY_SERVICE_SID`

## 4. Start the Dev Server

```
npm run dev
```

Open http://localhost:3000

## 5. Current Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Sign in |
| `/signup` | 4-step onboarding with OTP verification |
| `/dashboard` | Main detailer dashboard |
| `/dashboard/appointments` | Appointment management |
| `/dashboard/clients` | Client CRM |
| `/dashboard/services` | Service menu editor |
| `/dashboard/profile` | Profile editor |
| `/dashboard/link` | Booking link management |
| `/dashboard/settings` | Account settings |
| `/[slug]` | Public detailer profile |
| `/[slug]/book` | Client booking flow |
| `/api/stripe/checkout` | Create Stripe checkout session |
| `/api/stripe/portal` | Stripe billing portal |
| `/api/webhooks/stripe` | Stripe webhook endpoint |
| `/api/send-code` | Send Twilio OTP verification code |
| `/api/verify-code` | Verify OTP code |
| `/api/seed-profile` | Seed defaults after signup |
| `/api/upload-photo` | Upload work photos to Supabase Storage |

## 6. Live Site

Production: https://www.glossio.org (deployed on Railway)

## 7. Design System

See `DESIGN.md` for the full design system specification (colors, fonts, spacing, interaction states, motion, responsive breakpoints).
