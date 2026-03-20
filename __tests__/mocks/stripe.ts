// Mock for https://esm.sh/stripe@14?target=deno
import { vi } from 'vitest'

const checkoutSessionsMock = {
  create: vi.fn().mockResolvedValue({ id: 'cs_test_123', url: 'https://checkout.stripe.com/test' }),
}

const billingPortalSessionsMock = {
  create: vi.fn().mockResolvedValue({ url: 'https://billing.stripe.com/test' }),
}

const webhooksMock = {
  constructEvent: vi.fn(),
}

class StripeMock {
  checkout = { sessions: checkoutSessionsMock }
  billingPortal = { sessions: billingPortalSessionsMock }
  webhooks = webhooksMock

  constructor(_key: string, _opts?: any) {}
}

export default StripeMock
export { checkoutSessionsMock, billingPortalSessionsMock, webhooksMock }
