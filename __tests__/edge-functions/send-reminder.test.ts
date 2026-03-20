import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setupEdgeTest, getHandler } from './helpers'
import { mockTable } from '../mocks/supabase'

const fetchSpy = vi.fn()
vi.stubGlobal('fetch', fetchSpy)

beforeEach(() => {
  setupEdgeTest()
  fetchSpy.mockReset()
})

await import('../../supabase/functions/send-reminder/index.ts')

describe('send-reminder', () => {
  it('returns sent: 0 when no appointments tomorrow', async () => {
    const appointments = mockTable('appointments')
    appointments.setResult({ data: [], error: null })

    const handler = getHandler()
    const res = await handler(new Request('http://localhost/test'))
    const data = await res.json()

    expect(data.sent).toBe(0)
  })

  it('sends reminders for confirmed appointments', async () => {
    const appointments = mockTable('appointments')
    appointments.setResult({
      data: [{
        id: 'appt-1',
        scheduled_time: '10:00 AM',
        profile_id: 'p-1',
        client: { first_name: 'John', last_name: 'Doe' },
        service: { name: 'Full Detail' },
      }],
      error: null,
    })

    const notifSettings = mockTable('notification_settings')
    notifSettings.setResult({ data: { reminder_24hr_enabled: true }, error: null })

    const profiles = mockTable('profiles')
    profiles.setResult({ data: { phone: '+12395550100' }, error: null })

    fetchSpy.mockResolvedValue({ ok: true })

    const handler = getHandler()
    const res = await handler(new Request('http://localhost/test'))
    const data = await res.json()

    expect(data.sent).toBe(1)
    expect(fetchSpy).toHaveBeenCalledOnce()
  })

  it('skips when reminders are disabled', async () => {
    const appointments = mockTable('appointments')
    appointments.setResult({
      data: [{
        id: 'appt-1',
        scheduled_time: '10:00 AM',
        profile_id: 'p-1',
        client: { first_name: 'John', last_name: 'Doe' },
        service: { name: 'Wash' },
      }],
      error: null,
    })

    const notifSettings = mockTable('notification_settings')
    notifSettings.setResult({ data: { reminder_24hr_enabled: false }, error: null })

    const handler = getHandler()
    const res = await handler(new Request('http://localhost/test'))
    const data = await res.json()

    expect(data.sent).toBe(0)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
