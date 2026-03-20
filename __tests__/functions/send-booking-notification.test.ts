import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeEvent, parseBody } from '../helpers'
import { resetMocks, mockTable } from '../mocks/supabase'
import { messagesCreateMock } from '../mocks/twilio'

vi.mock('@supabase/supabase-js')
vi.mock('twilio')

const { handler } = await import('../../netlify/functions/send-booking-notification.mjs') as any

describe('send-booking-notification', () => {
  beforeEach(() => {
    resetMocks()
    messagesCreateMock.mockReset()
    messagesCreateMock.mockResolvedValue({ sid: 'SM123' })
    // rate_limits: no existing entry (allows request)
    mockTable('rate_limits')
  })

  it('returns 405 for non-POST', async () => {
    const res = await handler({ httpMethod: 'GET', body: null, headers: {} })
    expect(res.statusCode).toBe(405)
  })

  it('returns 400 when profileId is missing', async () => {
    const res = await handler(makeEvent({}))
    expect(res.statusCode).toBe(400)
    expect(parseBody(res).error).toBe('profileId required')
  })

  it('skips when profile has no phone', async () => {
    const profiles = mockTable('profiles')
    profiles.setResult({ data: { phone: null, company_name: 'Test' }, error: null })

    const notif = mockTable('notification_settings')
    notif.setResult({ data: { booking_alerts_enabled: true }, error: null })

    const event = makeEvent({ profileId: 'user-1' })
    event.headers['x-forwarded-for'] = '127.0.0.1'
    const res = await handler(event)

    expect(parseBody(res).skipped).toBe(true)
    expect(messagesCreateMock).not.toHaveBeenCalled()
  })

  it('skips when booking alerts are disabled', async () => {
    const profiles = mockTable('profiles')
    profiles.setResult({ data: { phone: '+12395550100', company_name: 'Test' }, error: null })

    const notif = mockTable('notification_settings')
    notif.setResult({ data: { booking_alerts_enabled: false }, error: null })

    const event = makeEvent({ profileId: 'user-1' })
    event.headers['x-forwarded-for'] = '127.0.0.1'
    const res = await handler(event)

    expect(parseBody(res).skipped).toBe(true)
  })

  it('sends SMS when alerts are enabled', async () => {
    const profiles = mockTable('profiles')
    profiles.setResult({ data: { phone: '+12395550100', company_name: 'Test Co' }, error: null })

    const notif = mockTable('notification_settings')
    notif.setResult({ data: { booking_alerts_enabled: true, booking_alerts_channel: 'sms' }, error: null })

    const event = makeEvent({
      profileId: 'user-1',
      clientName: 'John',
      serviceName: 'Full Detail',
      date: '2026-03-25',
      time: '10:00 AM',
    })
    event.headers['x-forwarded-for'] = '127.0.0.1'
    const res = await handler(event)
    const data = parseBody(res)

    expect(data.success).toBe(true)
    expect(data.sent).toBe(true)
    expect(messagesCreateMock).toHaveBeenCalledOnce()
  })
})
