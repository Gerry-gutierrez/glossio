import { describe, it, expect, beforeEach } from 'vitest'
import { setupEdgeTest, getHandler, makeRequest, optionsRequest } from './helpers'
import { mockTable } from '../mocks/supabase'

beforeEach(() => setupEdgeTest())

await import('../../supabase/functions/lookup-email/index.ts')

describe('lookup-email', () => {
  it('returns ok for OPTIONS', async () => {
    const handler = getHandler()
    const res = await handler(optionsRequest())
    expect(res.status).toBe(200)
  })

  it('returns 400 when phone is missing', async () => {
    const handler = getHandler()
    const res = await handler(makeRequest({}))
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toBe('Phone required')
  })

  it('returns email when found', async () => {
    const profiles = mockTable('profiles')
    profiles.setResult({ data: { email: 'found@example.com' }, error: null })

    const handler = getHandler()
    const res = await handler(makeRequest({ phone: '+12395550100' }))
    const data = await res.json()

    expect(data.email).toBe('found@example.com')
  })

  it('returns 404 when no account found', async () => {
    const profiles = mockTable('profiles')
    profiles.setResult({ data: null, error: null })

    const handler = getHandler()
    const res = await handler(makeRequest({ phone: '+10000000000' }))
    const data = await res.json()

    expect(res.status).toBe(404)
    expect(data.error).toBe('No account found')
  })
})
