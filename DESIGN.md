# Design System — GlossIO

## Product Context
What this is: SaaS platform for auto detailers to manage bookings, services, and client relationships
Project type: Web app (dashboard + public booking pages + marketing landing page)
Audience: Solo auto detailers who currently manage their business via Instagram DMs and notes apps

## Typography

| Role | Font | Notes |
|------|------|-------|
| Primary (all text) | Georgia, "Times New Roman", serif | Distinctive serif choice. Differentiates from SaaS commodity fonts (Inter, Poppins). |
| System fallback | -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif | Used only where serif would be inappropriate |

## Heading Scale

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| H1 | 58px | 700 | 1.15x | Page heroes, landing headline |
| H2 | 38px | 700 | 1.2x | Section titles |
| H3 | 22px | 700 | 1.3x | Card titles, sub-sections |
| H4 | 18px | 600 | 1.4x | Labels, minor headings |
| Body | 16px | 400 | 1.5x | Default body text |
| Caption | 13px | 400 | 1.4x | Labels, muted text |
| Small | 12px | 400 | 1.4x | Minimum readable size |

## Color Palette

### Core
| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| bg | #0A0A0F | 10, 10, 15 | Page background |
| bgCard | #111118 | 17, 17, 24 | Card surfaces, modals |
| bgSidebar | #0D0D15 | 13, 13, 21 | Sidebar, input backgrounds |
| bgHover | #1a1a2e | 26, 26, 46 | Hover state backgrounds |

### Brand
| Token | Hex | Usage |
|-------|-----|-------|
| primary | #00C2FF | CTAs, links, active states, primary accent |
| secondary | #A259FF | Gradient accent, badges, purple highlights |
| highlight | #FF6B35 | Orange accent, attention-grabbing elements |
| gold | #FFD60A | Awards, premium indicators |
| success | #00E5A0 | Checkmarks, success states, confirmations |
| danger | #FF3366 | Errors, destructive actions, pain points |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| text | #F0EDE8 | Primary body text (warm off-white) |
| textMuted | #888888 | Secondary descriptions |
| textDim | #666666 | Tertiary labels, placeholders |
| textFaint | #555555 | Barely-there hints |

### Borders
| Token | Hex | Usage |
|-------|-----|-------|
| border | #1E1E2E | Card borders, dividers |
| borderLight | #2a2a3e | Lighter borders, subtle separators |

### Gradients
| Token | Value | Usage |
|-------|-------|-------|
| gradientPrimary | linear-gradient(135deg, #00C2FF, #A259FF) | Logo text, premium CTAs |
| gradientHighlight | linear-gradient(135deg, #FF6B35, #FFD60A) | Signup CTA button |

## Spacing Scale (8px base)

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight gaps, icon margins |
| sm | 8px | Small padding, inline spacing |
| md | 16px | Default padding, form gaps |
| lg | 24px | Card padding, section gaps |
| xl | 32px | Large card padding |
| 2xl | 48px | Section separation |
| 3xl | 80px | Major section vertical padding |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 8px | Small elements, chips |
| md | 12px | Cards, inputs |
| lg | 16px | Modals, large cards |
| xl | 20px | Hero elements |
| full | 9999px | Pills, badges, avatars |

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| card | 0 4px 24px rgba(0,0,0,0.4) | Card elevation |
| glow | 0 0 20px rgba(0,194,255,0.15) | Primary accent glow |
| glowPurple | 0 0 20px rgba(162,89,255,0.15) | Secondary accent glow |

## Component Patterns

### Buttons
- **Primary CTA:** Cyan (#00C2FF) background, dark text, full-width on forms, pill radius
- **Signup CTA:** Orange-to-gold gradient, white text
- **Ghost:** Transparent bg, border, text color matches context
- **Destructive:** Danger red background

### Cards
- Background: bgCard (#111118)
- Border: 1px solid border (#1E1E2E)
- Radius: md (12px)
- Padding: lg-xl (24-32px)

### Form Inputs
- Background: bgSidebar (#0D0D15)
- Border: 1px solid border (#1E1E2E)
- Radius: md (12px)
- Height: 48px (minimum for touch targets)
- Placeholder: textDim (#666666)

## Interaction States

### Hover
- **Nav links:** `opacity: 0.6 → 1` with `transition: opacity 0.2s ease`
- **Buttons:** Slight brightness increase + subtle glow. `filter: brightness(1.1)` + box-shadow glow
- **Cards:** Border color shifts to section accent color. Background tints toward accent at 4% opacity.
- **Links:** Color shifts to primary (#00C2FF) if not already cyan

### Focus
- **All interactive elements:** `outline: 2px solid #00C2FF; outline-offset: 2px` on `:focus-visible`
- Never use `outline: none` without a replacement focus indicator

### Active/Pressed
- `transform: scale(0.98)` on buttons for tactile feedback
- `transition: transform 0.1s ease`

### Disabled
- `opacity: 0.4` + `cursor: not-allowed`
- Never remove from DOM — always show disabled state

### Loading
- Skeleton shapes that match real content layout
- Use `background: linear-gradient(90deg, #111118 25%, #1a1a2e 50%, #111118 75%)` shimmer animation
- Duration: 1.5s infinite

## Motion

- **Approach:** Intentional — subtle transitions that aid comprehension
- **Easing:** enter(ease-out), exit(ease-in), move(ease-in-out)
- **Durations:** micro(100ms), short(200ms), medium(300ms), long(500ms)
- **Page sections:** Fade-in on scroll with `opacity: 0 → 1` + `translateY(20px → 0)`, duration 500ms, ease-out
- **Modals:** Scale from 0.95 → 1 + fade, duration 200ms
- **`prefers-reduced-motion`:** Respect it. Disable all non-essential animations.
- **Never animate:** width, height, top, left (layout properties). Only animate transform and opacity.
- **Never use:** `transition: all` — list properties explicitly

## Responsive Breakpoints

| Name | Width | Notes |
|------|-------|-------|
| mobile | < 640px | Single column, hamburger nav, stacked forms |
| tablet | 640-1024px | Two columns where appropriate |
| desktop | 1024-1440px | Full layout, sidebar visible |
| wide | > 1440px | Max content width caps at 1200px |

### Mobile Requirements
- Nav collapses to hamburger menu below 640px
- Pain point bullets stack vertically
- Form inputs stretch to full width
- Touch targets minimum 44px height
- No horizontal scroll

## Accessibility Minimums

- **Touch targets:** All interactive elements minimum 44x44px
- **Color contrast:** Body text 4.5:1 against background, large text (18px+) 3:1
- **Focus indicators:** Visible on all interactive elements via `:focus-visible`
- **No color-only encoding:** Always pair color with labels or icons
- **Semantic HTML:** Use `<button>` for actions, `<a>` for navigation, proper heading hierarchy

## Design Principles

1. **Dark-first:** The entire UI is dark mode. No light mode variant exists.
2. **Warm neutrals:** Text uses warm off-white (#F0EDE8), not pure white. This reduces eye strain on dark backgrounds.
3. **Serif personality:** Georgia serif gives the product a distinctive, premium feel that separates it from generic SaaS.
4. **Color as hierarchy:** Cyan for primary actions, purple for secondary, orange for attention. Colors encode meaning, not decoration.
5. **Niche confidence:** Copy and design speak directly to auto detailers. No generic SaaS language.

## Known Issues (from design audit 2026-03-18)

These are specified correctly in DESIGN.md but NOT yet fixed in code:
- [ ] H3 in landing page cards is 17px — code needs updating to 22px
- [ ] Nav links lack hover states — add per Interaction States section above
- [ ] Nav doesn't collapse to hamburger on mobile — add per Responsive section above
- [ ] Some input heights at 39px — code needs updating to 48px
- [ ] "How It Works" section uses AI-recognizable icon-in-circle grid pattern
- [ ] No motion/transitions on any page — add per Motion section above
- [ ] Login button appears disabled/faded — should match cyan CTA style
- [ ] "Sign In" link on signup page has 15px touch target — needs 44px minimum

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-18 | Baseline captured from live site | Inferred by /plan-design-review |
| 2026-03-18 | Design tokens source of truth: lib/constants.ts | All colors, fonts, shadows defined there |
| 2026-03-18 | Georgia serif as primary font | Distinctive, premium feel for target audience |
| 2026-03-18 | Dark-only theme | Matches automotive/detailing aesthetic |
| 2026-03-18 | Added interaction states, motion, responsive, accessibility specs | Design consultation update — fills gaps found in audit |
| 2026-03-18 | Core palette LOCKED: do not change | bg, primary, secondary, highlight, text colors are final |
