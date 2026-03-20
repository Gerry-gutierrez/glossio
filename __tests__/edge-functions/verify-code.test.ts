import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setupEdgeTest, getHandler, makeRequest, optionsRequest } from './helpers'
import { mockTable } from '../mocks/supabase'

beforeEach(() => setupEdgeTest())

await import('../../supabase/functions/verify-code/index.ts')

describe('verify-code', () => {
  it('returns ok for OPTIONS', async () => {
    const handler = getHandler()
    const res = await handler(optionsRequest())
    expect(res.status).toBe(200)
  })

  it('returns 400 when phone or code is missing', async () => {
    const handler = getHandler()

    const res1 = await handler(makeRequest({ phone: '+1234' }))
    expect(res1.status).toBe(400)

    const res2 = await handler(makeRequest({ code: '123456' }))
    expect(res2.status).toBe(400)
  })

  it('returns 400 for invalid/expired code', async () => {
    const codes = mockTable('verification_codes')
    codes.setResult({ data: null, error: { message: 'not found' } })

    const handler = getHandler()
    const res = await handler(makeRequest({ phone: '+12395550100', code: '999999' }))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBe('Invalid or expired code')
  })

  it('verifies valid code and marks as used', async () => {
    const codes = mockTable('verification_codes')
    // First call: select query returns valid code
    codes.chain.single.mockResolvedValueOnce({ data: { id: 'code-1' }, error: null })
    // Second call: update marks as used
    codes.chain.eq.mockReturnThis()

    const handler = getHandler()
    const res = await handler(makeRequest({ phone: '+12395550100', code: '123456' }))
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.verified).toBe(true)
  })
})
