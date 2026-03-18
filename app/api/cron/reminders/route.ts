import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { sendAppointmentReminder } from '@/lib/twilio'
import { logInfo, logError } from '@/lib/logger'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Called by a cron job (Railway cron, Vercel cron, or external scheduler)
// Sends 24-hour reminders for tomorrow's confirmed appointments
export async function GET(request: NextRequest) {
  // Simple auth: check for a secret header to prevent public access
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get tomorrow's date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    // Find confirmed appointments for tomorrow
    const { data: appointments, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        id, scheduled_date, scheduled_time, price,
        clients ( first_name, phone ),
        services ( name ),
        profiles ( company_name, phone )
      `)
      .eq('scheduled_date', tomorrowStr)
      .eq('status', 'confirmed')

    if (error) {
      logError('/api/cron/reminders', 'fetch_failed', error)
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
    }

    if (!appointments || appointments.length === 0) {
      logInfo('/api/cron/reminders', 'no_reminders', { date: tomorrowStr })
      return NextResponse.json({ sent: 0, date: tomorrowStr })
    }

    let sent = 0
    let failed = 0

    for (const appt of appointments) {
      const client = appt.clients as Record<string, string> | null
      const service = appt.services as Record<string, string> | null

      if (!client?.phone || !client?.first_name || !service?.name) continue

      try {
        await sendAppointmentReminder({
          to: client.phone,
          clientName: client.first_name,
          serviceName: service.name,
          date: tomorrowStr,
          time: appt.scheduled_time,
        })
        sent++
      } catch (err) {
        logError('/api/cron/reminders', 'send_failed', err, {
          appointmentId: appt.id,
          phone: client.phone.slice(0, 6) + '****',
        })
        failed++
      }
    }

    logInfo('/api/cron/reminders', 'reminders_sent', { date: tomorrowStr, sent, failed, total: appointments.length })

    return NextResponse.json({ sent, failed, total: appointments.length, date: tomorrowStr })
  } catch (error) {
    logError('/api/cron/reminders', 'cron_failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
