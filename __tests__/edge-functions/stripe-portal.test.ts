import { describe, it, expect, beforeEach } from 'vitest'
import { setupEdgeTest, getHandler, makeRequest, optionsRequest } from './helpers'
import { billingPortalSessionsMock } from '../mocks/stripe'

beforeEach(() => {
  setupEdgeTest()
  billingPortalSessionsMock.create.mockReset()
  billingPortalSessionsMock.create.mockResolvedValue({ url: 'https://billing.stripe.com/test' })
})

await import('../../supabase/functions/stripe-portal/index.ts')

describe('stripe-portal', () => {
  it('returns ok for OPTIONS', async () => {
    const handler = getHandler()
    const res = await handler(optionsRequest())
    expect(res.status).toBe(200)
  })

  it('returns 400 when customerId is missing', async () => {
    const handler = getHandler()
    const res = await handler(makeRequest({}))
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toBe('customerId required')
  })

  it('creates billing portal session', async () => {
    const handler = getHandler()
    const res = await handler(makeRequest({ customerId: 'cus_test_123' }))
    const data = await res.json()

    expect(data.url).toBe('https://billing.stripe.com/test')
    expect(billingPortalSessionsMock.create).toHaveBeenCalledWith({
      customer: 'cus_test_123',
      return_url: 'https://glossio.org/dashboard/settings/',
    })
  })
})
