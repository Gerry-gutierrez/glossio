// Mock for stripe (used via vitest alias)
// Netlify functions do: const stripe = require("stripe"); const client = stripe(key);
import { vi } from 'vitest'

export const checkoutSessionsMock = {
  create: vi.fn().mockResolvedValue({ id: 'cs_test_123', url: 'https://checkout.stripe.com/test' }),
}

export const billingPortalSessionsMock = {
  create: vi.fn().mockResolvedValue({ url: 'https://billing.stripe.com/test' }),
}

export const webhooksMock = {
  constructEvent: vi.fn(),
}

// Default export: a function that returns a stripe-like client
function stripeMock(_key?: string) {
  return {
    checkout: { sessions: checkoutSessionsMock },
    billingPortal: { sessions: billingPortalSessionsMock },
    webhooks: webhooksMock,
  }
}

export default stripeMock
