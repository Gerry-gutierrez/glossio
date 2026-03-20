# GlossIO — Claude Code Instructions

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Stack
- 11ty static site generator
- Supabase (auth + database)
- Netlify Functions (API, deployed on Railway)
- Stripe (billing)
- Twilio (SMS OTP)

## Design Tokens
All colors, fonts, and shadows are defined in `lib/constants.ts`. CSS variables in `src/css/globals.css`.
Core palette is LOCKED — do not change bg, primary, secondary, highlight, or text colors.
