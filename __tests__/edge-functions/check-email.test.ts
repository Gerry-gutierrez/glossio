import { describe, it, expect, beforeEach } from 'vitest'
import { setupEdgeTest, getHandler, makeRequest, optionsRequest } from './helpers'
import { mockTable } from '../mocks/supabase'

beforeEach(() => setupEdgeTest())

await import('../../supabase/functions/check-email/index.ts')

describe('check-email', () => {
  it('returns ok for OPTIONS', async () => {
    const handler = getHandler()
    const res = await handler(optionsRequest())
    expect(res.status).toBe(200)
  })

  it('returns 400 when email is missing', async () => {
    const handler = getHandler()
    const res = await handler(makeRequest({}))
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toBe('Email required')
  })

  it('returns exists: true when email is found', async () => {
    const profiles = mockTable('profiles')
    profiles.setResult({ data: [{ id: 'user-1' }], error: null })

    const handler = getHandler()
    const res = await handler(makeRequest({ email: 'test@example.com' }))
    const data = await res.json()

    expect(data.exists).toBe(true)
  })

  it('returns exists: false when email is not found', async () => {
    const profiles = mockTable('profiles')
    profiles.setResult({ data: [], error: null })

    const handler = getHandler()
    const res = await handler(makeRequest({ email: 'nobody@example.com' }))
    const data = await res.json()

    expect(data.exists).toBe(false)
  })
})
