import { describe, it, expect, beforeEach } from 'vitest'
import { setupEdgeTest, getHandler } from './helpers'
import { webhooksMock } from '../mocks/stripe'
import { mockTable } from '../mocks/supabase'

beforeEach(() => {
  setupEdgeTest()
  webhooksMock.constructEvent.mockReset()
})

await import('../../supabase/functions/stripe-webhook/index.ts')

function makeWebhookRequest(body: string) {
  return new Request('http://localhost/test', {
    method: 'POST',
    headers: { 'stripe-signature': 'sig_test' },
    body,
  })
}

describe('stripe-webhook', () => {
  it('returns 400 for invalid signature', async () => {
    webhooksMock.constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const handler = getHandler()
    const res = await handler(makeWebhookRequest('{}'))
    expect(res.status).toBe(400)
  })

  it('handles subscription created/updated event', async () => {
    const profiles = mockTable('profiles')
    profiles.chain.update.mockReturnThis()
    profiles.chain.eq.mockReturnValue(Promise.resolve({ data: null, error: null }))

    webhooksMock.constructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: { id: 'sub_123', status: 'active', customer: 'cus_123' },
      },
    })

    const handler = getHandler()
    const res = await handler(makeWebhookRequest('{}'))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.received).toBe(true)
  })

  it('handles subscription deleted event', async () => {
    const profiles = mockTable('profiles')
    profiles.chain.update.mockReturnThis()
    profiles.chain.eq.mockReturnValue(Promise.resolve({ data: null, error: null }))

    webhooksMock.constructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: {
        object: { id: 'sub_123', customer: 'cus_123' },
      },
    })

    const handler = getHandler()
    const res = await handler(makeWebhookRequest('{}'))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.received).toBe(true)
  })

  it('handles checkout.session.completed event', async () => {
    const profiles = mockTable('profiles')
    profiles.chain.update.mockReturnThis()
    profiles.chain.eq.mockReturnValue(Promise.resolve({ data: null, error: null }))

    webhooksMock.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: { customer: 'cus_123', metadata: { profile_id: 'user-1' } },
      },
    })

    const handler = getHandler()
    const res = await handler(makeWebhookRequest('{}'))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.received).toBe(true)
  })

  it('handles invoice.payment_failed event', async () => {
    const profiles = mockTable('profiles')
    profiles.chain.update.mockReturnThis()
    profiles.chain.eq.mockReturnValue(Promise.resolve({ data: null, error: null }))

    webhooksMock.constructEvent.mockReturnValue({
      type: 'invoice.payment_failed',
      data: {
        object: { customer: 'cus_123' },
      },
    })

    const handler = getHandler()
    const res = await handler(makeWebhookRequest('{}'))
    expect(res.status).toBe(200)
  })
})
