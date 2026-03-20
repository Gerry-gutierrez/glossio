import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setupEdgeTest, getHandler, makeRequest, optionsRequest } from './helpers'
import { mockTable } from '../mocks/supabase'

const fetchSpy = vi.fn()
vi.stubGlobal('fetch', fetchSpy)

beforeEach(() => {
  setupEdgeTest()
  fetchSpy.mockReset()
})

await import('../../supabase/functions/send-booking-notification/index.ts')

describe('send-booking-notification', () => {
  it('returns ok for OPTIONS', async () => {
    const handler = getHandler()
    const res = await handler(optionsRequest())
    expect(res.status).toBe(200)
  })

  it('returns 400 when profileId is missing', async () => {
    const handler = getHandler()
    const res = await handler(makeRequest({}))
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toBe('profileId required')
  })

  it('skips when profile has no phone', async () => {
    const profiles = mockTable('profiles')
    profiles.setResult({ data: { phone: null, company_name: 'Test' }, error: null })

    const notifSettings = mockTable('notification_settings')
    notifSettings.setResult({ data: { booking_alerts_enabled: true }, error: null })

    const handler = getHandler()
    const res = await handler(makeRequest({ profileId: 'user-1' }))
    const data = await res.json()

    expect(data.skipped).toBe(true)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('skips when booking alerts are disabled', async () => {
    const profiles = mockTable('profiles')
    profiles.setResult({ data: { phone: '+12395550100', company_name: 'Test' }, error: null })

    const notifSettings = mockTable('notification_settings')
    notifSettings.setResult({ data: { booking_alerts_enabled: false }, error: null })

    const handler = getHandler()
    const res = await handler(makeRequest({ profileId: 'user-1' }))
    const data = await res.json()

    expect(data.skipped).toBe(true)
  })

  it('sends SMS when alerts are enabled', async () => {
    const profiles = mockTable('profiles')
    profiles.setResult({ data: { phone: '+12395550100', company_name: 'Test Co' }, error: null })

    const notifSettings = mockTable('notification_settings')
    notifSettings.setResult({ data: { booking_alerts_enabled: true, booking_alerts_channel: 'sms' }, error: null })

    fetchSpy.mockResolvedValueOnce({ ok: true })

    const handler = getHandler()
    const res = await handler(makeRequest({
      profileId: 'user-1',
      clientName: 'John',
      serviceName: 'Full Detail',
      date: '2026-03-25',
      time: '10:00 AM',
    }))
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.sent).toBe(true)
    expect(fetchSpy).toHaveBeenCalledOnce()
  })
})
