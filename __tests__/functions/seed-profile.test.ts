import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeEvent, parseBody } from '../helpers'
import { resetMocks, mockTable } from '../mocks/supabase'

vi.mock('@supabase/supabase-js')

const { handler } = await import('../../netlify/functions/seed-profile.mjs') as any

describe('seed-profile', () => {
  beforeEach(() => {
    resetMocks()
    mockTable('profiles')
  })

  it('returns 405 for non-POST', async () => {
    const res = await handler({ httpMethod: 'GET', body: null, headers: {} })
    expect(res.statusCode).toBe(405)
  })

  it('returns 400 when userId is missing', async () => {
    const res = await handler(makeEvent({}))
    expect(res.statusCode).toBe(400)
    expect(parseBody(res).error).toBe('userId required')
  })

  it('seeds profile with slug generated from company name', async () => {
    const res = await handler(makeEvent({
      userId: 'user-1',
      companyName: 'Carlos Detail Co',
      phone: '+12395550100',
    }))
    const data = parseBody(res)

    expect(data.success).toBe(true)
    expect(data.slug).toBe('carlos-detail-co')
  })

  it('uses "business" as default slug when no company name', async () => {
    const res = await handler(makeEvent({ userId: 'user-1' }))
    const data = parseBody(res)

    expect(data.success).toBe(true)
    expect(data.slug).toBe('business')
  })
})
