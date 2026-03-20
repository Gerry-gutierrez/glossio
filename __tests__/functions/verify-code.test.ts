import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeEvent, parseBody } from '../helpers'
import { resetMocks, mockTable } from '../mocks/supabase'

vi.mock('@supabase/supabase-js')

const { handler } = await import('../../netlify/functions/verify-code.mjs') as any

describe('verify-code', () => {
  beforeEach(() => resetMocks())

  it('returns 405 for non-POST', async () => {
    const res = await handler({ httpMethod: 'GET', body: null, headers: {} })
    expect(res.statusCode).toBe(405)
  })

  it('returns 400 when phone or code is missing', async () => {
    const res1 = await handler(makeEvent({ phone: '+1234' }))
    expect(res1.statusCode).toBe(400)

    const res2 = await handler(makeEvent({ code: '123456' }))
    expect(res2.statusCode).toBe(400)
  })

  it('returns 400 for invalid/expired code', async () => {
    const codes = mockTable('verification_codes')
    codes.setResult({ data: null, error: { message: 'not found' } })

    const res = await handler(makeEvent({ phone: '+12395550100', code: '999999' }))
    expect(res.statusCode).toBe(400)
    expect(parseBody(res).error).toBe('Invalid or expired code')
  })

  it('verifies valid code and marks as used', async () => {
    const codes = mockTable('verification_codes')
    codes.setResult({ data: { id: 'code-1' }, error: null })

    const res = await handler(makeEvent({ phone: '+12395550100', code: '123456' }))
    const data = parseBody(res)

    expect(data.success).toBe(true)
    expect(data.verified).toBe(true)
  })
})
