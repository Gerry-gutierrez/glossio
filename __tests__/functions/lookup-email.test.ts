import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeEvent, parseBody } from '../helpers'
import { resetMocks, mockTable } from '../mocks/supabase'

vi.mock('@supabase/supabase-js')

const { handler } = await import('../../netlify/functions/lookup-email.mjs') as any

describe('lookup-email', () => {
  beforeEach(() => resetMocks())

  it('returns 405 for non-POST', async () => {
    const res = await handler({ httpMethod: 'GET', body: null, headers: {} })
    expect(res.statusCode).toBe(405)
  })

  it('returns 400 when phone is missing', async () => {
    const res = await handler(makeEvent({}))
    expect(res.statusCode).toBe(400)
    expect(parseBody(res).error).toBe('Phone required')
  })

  it('returns email when found', async () => {
    const profiles = mockTable('profiles')
    profiles.setResult({ data: { email: 'found@example.com' }, error: null })

    const res = await handler(makeEvent({ phone: '+12395550100' }))
    expect(parseBody(res).email).toBe('found@example.com')
  })

  it('returns 404 when no account found', async () => {
    const profiles = mockTable('profiles')
    profiles.setResult({ data: null, error: null })

    const res = await handler(makeEvent({ phone: '+10000000000' }))
    expect(res.statusCode).toBe(404)
    expect(parseBody(res).error).toBe('No account found with that phone number')
  })
})
