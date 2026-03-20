import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setupEdgeTest, getHandler, makeRequest, optionsRequest } from './helpers'
import { mockTable } from '../mocks/supabase'

// Mock global fetch for Twilio API calls
const fetchSpy = vi.fn()
vi.stubGlobal('fetch', fetchSpy)

beforeEach(() => {
  setupEdgeTest()
  fetchSpy.mockReset()
})

// Import the edge function (triggers serve() which captures the handler)
await import('../../supabase/functions/send-code/index.ts')

describe('send-code', () => {
  it('returns ok for OPTIONS (CORS preflight)', async () => {
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

  it('sends SMS and stores code on success', async () => {
    const verCodes = mockTable('verification_codes')
    verCodes.chain.insert.mockReturnValue(Promise.resolve({ data: null, error: null }))

    fetchSpy.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ sid: 'SM123' }) })

    const handler = getHandler()
    const res = await handler(makeRequest({ phone: '+12395550100' }))
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(fetchSpy).toHaveBeenCalledOnce()
    expect(fetchSpy.mock.calls[0][0]).toContain('api.twilio.com')
  })

  it('returns 500 when Twilio fails', async () => {
    fetchSpy.mockResolvedValueOnce({ ok: false, text: () => Promise.resolve('Twilio error') })

    const handler = getHandler()
    const res = await handler(makeRequest({ phone: '+12395550100' }))
    const data = await res.json()

    expect(res.status).toBe(500)
    expect(data.error).toBe('Failed to send SMS')
  })
})
