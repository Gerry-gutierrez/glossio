import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeEvent, parseBody } from '../helpers'
import { checkoutSessionsMock } from '../mocks/stripe'

vi.mock('stripe')

const { handler } = await import('../../netlify/functions/stripe-checkout.mjs') as any

describe('stripe-checkout', () => {
  beforeEach(() => {
    checkoutSessionsMock.create.mockReset()
    checkoutSessionsMock.create.mockResolvedValue({ id: 'cs_test_123', url: 'https://checkout.stripe.com/test' })
  })

  it('returns 405 for non-POST', async () => {
    const res = await handler({ httpMethod: 'GET', body: null, headers: {} })
    expect(res.statusCode).toBe(405)
  })

  it('returns 400 when priceId or profileId is missing', async () => {
    const res1 = await handler(makeEvent({ priceId: 'price_123' }))
    expect(res1.statusCode).toBe(400)

    const res2 = await handler(makeEvent({ profileId: 'user-1' }))
    expect(res2.statusCode).toBe(400)
  })

  it('creates checkout session successfully', async () => {
    const res = await handler(makeEvent({
      priceId: 'price_123',
      profileId: 'user-1',
      email: 'user@test.com',
    }))
    const data = parseBody(res)

    expect(data.sessionId).toBe('cs_test_123')
    expect(data.url).toBe('https://checkout.stripe.com/test')
    expect(checkoutSessionsMock.create).toHaveBeenCalledOnce()
  })
})
