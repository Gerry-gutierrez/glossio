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
All colors, fonts, and shadows are defined as CSS custom properties in `src/css/globals.css`.
Core palette is LOCKED — do not change bg, primary, secondary, highlight, or text colors.

## Key Files
- `src/css/globals.css` — CSS custom properties (design tokens), global styles
- `src/index.njk` — Landing page
- `src/_includes/layouts/base.njk` — Base HTML layout
- `src/_includes/layouts/dashboard.njk` — Dashboard layout
- `netlify/functions/` — API endpoints (Netlify Functions format)
- `__tests__/` — Vitest test suite
- `DESIGN.md` — Full design system specification
- `TODOS.md` — Project TODO tracker

## Commands
- `npx @11ty/eleventy --serve` — Dev server (localhost:8080)
- `npm test` — Run vitest test suite
