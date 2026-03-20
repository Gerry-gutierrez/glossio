import { describe, it, expect, beforeEach } from 'vitest'
import { setupEdgeTest, getHandler, makeRequest, optionsRequest } from './helpers'
import { checkoutSessionsMock } from '../mocks/stripe'

beforeEach(() => {
  setupEdgeTest()
  checkoutSessionsMock.create.mockReset()
  checkoutSessionsMock.create.mockResolvedValue({ id: 'cs_test_123', url: 'https://checkout.stripe.com/test' })
})

await import('../../supabase/functions/stripe-checkout/index.ts')

describe('stripe-checkout', () => {
  it('returns ok for OPTIONS', async () => {
    const handler = getHandler()
    const res = await handler(optionsRequest())
    expect(res.status).toBe(200)
  })

  it('returns 400 when priceId or profileId is missing', async () => {
    const handler = getHandler()

    const res1 = await handler(makeRequest({ priceId: 'price_123' }))
    expect(res1.status).toBe(400)

    const res2 = await handler(makeRequest({ profileId: 'user-1' }))
    expect(res2.status).toBe(400)
  })

  it('creates checkout session successfully', async () => {
    const handler = getHandler()
    const res = await handler(makeRequest({
      priceId: 'price_123',
      profileId: 'user-1',
      email: 'user@test.com',
    }))
    const data = await res.json()

    expect(data.sessionId).toBe('cs_test_123')
    expect(data.url).toBe('https://checkout.stripe.com/test')
    expect(checkoutSessionsMock.create).toHaveBeenCalledOnce()
  })
})
