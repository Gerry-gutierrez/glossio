// ─── GlossIO Design System ────────────────────────────────────────────────────
// Single source of truth for all design tokens. Never hardcode colors elsewhere.

export const COLORS = {
  // Backgrounds
  bg: '#0A0A0F',
  bgCard: '#111118',
  bgSidebar: '#0D0D15',
  bgInput: '#0D0D15',
  bgHover: '#1a1a2e',

  // Borders
  border: '#1E1E2E',
  borderLight: '#2a2a3e',

  // Brand
  primary: '#00C2FF',       // cyan
  secondary: '#A259FF',     // purple
  highlight: '#FF6B35',     // orange
  gold: '#FFD60A',          // yellow
  success: '#00E5A0',       // green
  danger: '#FF3366',        // red

  // Text
  text: '#F0EDE8',
  textMuted: '#888888',
  textDim: '#666666',
  textFaint: '#555555',

  // Gradients (use as CSS value)
  gradientPrimary: 'linear-gradient(135deg, #00C2FF, #A259FF)',
  gradientHighlight: 'linear-gradient(135deg, #FF6B35, #FFD60A)',
} as const

export const FONTS = {
  serif: 'Georgia, "Times New Roman", serif',
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
} as const

export const RADIUS = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
} as const

export const SHADOWS = {
  card: '0 4px 24px rgba(0,0,0,0.4)',
  glow: '0 0 20px rgba(0,194,255,0.15)',
  glowPurple: '0 0 20px rgba(162,89,255,0.15)',
} as const

// Subscription plans
export const PLANS = {
  monthly: { label: 'Monthly', price: 25, period: 'month' },
  annual: { label: 'Annual', price: 250, period: 'year', savings: '$50' },
} as const

// App URL — for generating public profile links
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// Trial length in days
export const TRIAL_DAYS = 14
