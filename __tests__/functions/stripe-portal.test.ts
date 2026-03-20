import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeEvent, parseBody } from '../helpers'
import { billingPortalSessionsMock } from '../mocks/stripe'

vi.mock('stripe')

const { handler } = await import('../../netlify/functions/stripe-portal.mjs') as any

describe('stripe-portal', () => {
  beforeEach(() => {
    billingPortalSessionsMock.create.mockReset()
    billingPortalSessionsMock.create.mockResolvedValue({ url: 'https://billing.stripe.com/test' })
  })

  it('returns 405 for non-POST', async () => {
    const res = await handler({ httpMethod: 'GET', body: null, headers: {} })
    expect(res.statusCode).toBe(405)
  })

  it('returns 400 when customerId is missing', async () => {
    const res = await handler(makeEvent({}))
    expect(res.statusCode).toBe(400)
    expect(parseBody(res).error).toBe('customerId required')
  })

  it('creates billing portal session', async () => {
    const res = await handler(makeEvent({ customerId: 'cus_test_123' }))
    const data = parseBody(res)

    expect(data.url).toBe('https://billing.stripe.com/test')
    expect(billingPortalSessionsMock.create).toHaveBeenCalledWith({
      customer: 'cus_test_123',
      return_url: 'https://glossio.org/dashboard/settings/',
    })
  })
})
