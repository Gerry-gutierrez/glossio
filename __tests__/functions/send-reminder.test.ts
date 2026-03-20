import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseBody } from '../helpers'
import { resetMocks, mockTable } from '../mocks/supabase'
import { messagesCreateMock } from '../mocks/twilio'

vi.mock('@supabase/supabase-js')
vi.mock('twilio')

const { handler } = await import('../../netlify/functions/send-reminder.mjs') as any

describe('send-reminder', () => {
  beforeEach(() => {
    resetMocks()
    messagesCreateMock.mockReset()
    messagesCreateMock.mockResolvedValue({ sid: 'SM123' })
  })

  it('returns sent: 0 when no appointments tomorrow', async () => {
    const appts = mockTable('appointments')
    appts.setResult({ data: [], error: null })

    const res = await handler({ httpMethod: 'GET', body: null, headers: {} })
    expect(parseBody(res).sent).toBe(0)
  })

  it('sends reminders for confirmed appointments', async () => {
    const appts = mockTable('appointments')
    appts.setResult({
      data: [{
        id: 'appt-1',
        scheduled_time: '10:00 AM',
        profile_id: 'p-1',
        profile: { phone: '+12395550100', company_name: 'Test' },
        client: { first_name: 'John', last_name: 'Doe' },
        service: { name: 'Full Detail' },
      }],
      error: null,
    })

    const notif = mockTable('notification_settings')
    notif.setResult({ data: { reminder_24hr_enabled: true }, error: null })

    const res = await handler({ httpMethod: 'GET', body: null, headers: {} })
    const data = parseBody(res)

    expect(data.sent).toBe(1)
    expect(messagesCreateMock).toHaveBeenCalledOnce()
  })

  it('skips when reminders are disabled', async () => {
    const appts = mockTable('appointments')
    appts.setResult({
      data: [{
        id: 'appt-1',
        scheduled_time: '10:00 AM',
        profile_id: 'p-1',
        profile: { phone: '+12395550100', company_name: 'Test' },
        client: { first_name: 'John', last_name: 'Doe' },
        service: { name: 'Wash' },
      }],
      error: null,
    })

    const notif = mockTable('notification_settings')
    notif.setResult({ data: { reminder_24hr_enabled: false }, error: null })

    const res = await handler({ httpMethod: 'GET', body: null, headers: {} })

    expect(parseBody(res).sent).toBe(0)
    expect(messagesCreateMock).not.toHaveBeenCalled()
  })
})
