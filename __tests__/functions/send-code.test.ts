import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeEvent, parseBody } from '../helpers'
import { resetMocks, mockTable } from '../mocks/supabase'
import { messagesCreateMock } from '../mocks/twilio'

vi.mock('@supabase/supabase-js')
vi.mock('twilio')

const { handler } = await import('../../netlify/functions/send-code.mjs') as any

describe('send-code', () => {
  beforeEach(() => {
    resetMocks()
    messagesCreateMock.mockReset()
    messagesCreateMock.mockResolvedValue({ sid: 'SM123' })
    // rate_limits: no existing entry (allows request)
    mockTable('rate_limits')
    // verification_codes for insert
    mockTable('verification_codes')
  })

  it('returns 405 for non-POST', async () => {
    const res = await handler({ httpMethod: 'GET', body: null, headers: {} })
    expect(res.statusCode).toBe(405)
  })

  it('returns 400 when phone is missing', async () => {
    const res = await handler(makeEvent({}))
    expect(res.statusCode).toBe(400)
    expect(parseBody(res).error).toBe('Phone number required')
  })

  it('sends SMS and stores code on success', async () => {
    const res = await handler(makeEvent({ phone: '+12395550100' }))
    const data = parseBody(res)

    expect(data.success).toBe(true)
    expect(messagesCreateMock).toHaveBeenCalledOnce()
    expect(messagesCreateMock.mock.calls[0][0].to).toBe('+12395550100')
  })

  it('returns 500 when Twilio fails', async () => {
    messagesCreateMock.mockRejectedValueOnce(new Error('Twilio error'))

    const res = await handler(makeEvent({ phone: '+12395550100' }))
    const data = parseBody(res)

    expect(res.statusCode).toBe(500)
    expect(data.error).toBe('Failed to send verification code. Please try again.')
  })
})
