import Stripe from 'stripe'

// Server-side Stripe client (lazy init to avoid build-time crashes when env vars are missing)
let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  }
  return _stripe
}

export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID!,
  annual: process.env.STRIPE_ANNUAL_PRICE_ID!,
} as const

// Create a Stripe customer for a new subscriber
export async function createStripeCustomer(email: string, name: string) {
  return getStripe().customers.create({ email, name })
}

// Create a checkout session for new subscriptions
export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  trialDays = 0,
}: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  trialDays?: number
}) {
  return getStripe().checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: trialDays > 0 ? { trial_period_days: trialDays } : undefined,
    allow_promotion_codes: true,
  })
}

// Create a billing portal session for plan/payment management
export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  return getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

// Verify and parse a Stripe webhook event
export function constructWebhookEvent(payload: string | Buffer, sig: string) {
  return getStripe().webhooks.constructEvent(
    payload,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
