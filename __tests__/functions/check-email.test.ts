import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeEvent, parseBody } from '../helpers'
import { resetMocks, mockTable } from '../mocks/supabase'

vi.mock('@supabase/supabase-js')

const { handler } = await import('../../netlify/functions/check-email.mjs') as any

describe('check-email', () => {
  beforeEach(() => resetMocks())

  it('returns 405 for non-POST', async () => {
    const res = await handler({ httpMethod: 'GET', body: null, headers: {} })
    expect(res.statusCode).toBe(405)
  })

  it('returns 400 when email is missing', async () => {
    const res = await handler(makeEvent({}))
    expect(res.statusCode).toBe(400)
    expect(parseBody(res).error).toBe('Email required')
  })

  it('returns exists: true when email is found', async () => {
    const profiles = mockTable('profiles')
    profiles.setResult({ data: [{ id: 'user-1' }], error: null })

    const res = await handler(makeEvent({ email: 'test@example.com' }))
    expect(parseBody(res).exists).toBe(true)
  })

  it('returns exists: false when email is not found', async () => {
    const profiles = mockTable('profiles')
    profiles.setResult({ data: [], error: null })

    const res = await handler(makeEvent({ email: 'nobody@example.com' }))
    expect(parseBody(res).exists).toBe(false)
  })
})
