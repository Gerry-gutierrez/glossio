import { describe, it, expect, beforeEach } from 'vitest'
import { setupEdgeTest, getHandler, makeRequest, optionsRequest } from './helpers'
import { mockTable, createClient } from '../mocks/supabase'

beforeEach(() => setupEdgeTest())

await import('../../supabase/functions/seed-profile/index.ts')

describe('seed-profile', () => {
  it('returns ok for OPTIONS', async () => {
    const handler = getHandler()
    const res = await handler(optionsRequest())
    expect(res.status).toBe(200)
  })

  it('returns 400 when userId is missing', async () => {
    const handler = getHandler()
    const res = await handler(makeRequest({}))
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toBe('userId required')
  })

  it('seeds profile with slug generated from company name', async () => {
    const profiles = mockTable('profiles')
    profiles.chain.update.mockReturnThis()
    profiles.chain.eq.mockReturnValue(Promise.resolve({ data: null, error: null }))

    const handler = getHandler()
    const res = await handler(makeRequest({
      userId: 'user-1',
      companyName: 'Carlos Detail Co',
      phone: '+12395550100',
    }))
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.slug).toBe('carlos-detail-co')
  })

  it('uses "business" as default slug when no company name', async () => {
    const profiles = mockTable('profiles')
    profiles.chain.update.mockReturnThis()
    profiles.chain.eq.mockReturnValue(Promise.resolve({ data: null, error: null }))

    const handler = getHandler()
    const res = await handler(makeRequest({ userId: 'user-1' }))
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.slug).toBe('business')
  })
})
