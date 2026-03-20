import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseBody } from '../helpers'
import { resetMocks, mockTable } from '../mocks/supabase'
import { webhooksMock } from '../mocks/stripe'

vi.mock('@supabase/supabase-js')
vi.mock('stripe')

const { handler } = await import('../../netlify/functions/stripe-webhook.mjs') as any

function makeWebhookEvent(body = '{}') {
  return {
    httpMethod: 'POST',
    body,
    headers: { 'stripe-signature': 'sig_test' },
  }
}

describe('stripe-webhook', () => {
  beforeEach(() => {
    resetMocks()
    webhooksMock.constructEvent.mockReset()
    // Default: profiles table for update chains
    mockTable('profiles')
  })

  it('returns 400 for invalid signature', async () => {
    webhooksMock.constructEvent.mockImplementation(() => { throw new Error('Invalid signature') })

    const res = await handler(makeWebhookEvent())
    expect(res.statusCode).toBe(400)
  })

  it('handles subscription created/updated event', async () => {
    webhooksMock.constructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: { object: { id: 'sub_123', status: 'active', customer: 'cus_123' } },
    })

    const res = await handler(makeWebhookEvent())
    expect(res.statusCode).toBe(200)
    expect(parseBody(res).received).toBe(true)
  })

  it('handles subscription deleted event', async () => {
    webhooksMock.constructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: { object: { id: 'sub_123', customer: 'cus_123' } },
    })

    const res = await handler(makeWebhookEvent())
    expect(res.statusCode).toBe(200)
    expect(parseBody(res).received).toBe(true)
  })

  it('handles checkout.session.completed event', async () => {
    webhooksMock.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { customer: 'cus_123', metadata: { profile_id: 'user-1' } } },
    })

    const res = await handler(makeWebhookEvent())
    expect(res.statusCode).toBe(200)
    expect(parseBody(res).received).toBe(true)
  })

  it('handles invoice.payment_failed event', async () => {
    webhooksMock.constructEvent.mockReturnValue({
      type: 'invoice.payment_failed',
      data: { object: { customer: 'cus_123' } },
    })

    const res = await handler(makeWebhookEvent())
    expect(res.statusCode).toBe(200)
  })
})
