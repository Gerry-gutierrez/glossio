import twilio from 'twilio'

// Lazy initialization to prevent build-time crashes
let _client: ReturnType<typeof twilio> | null = null

function getClient() {
  if (!_client) {
    const sid = process.env.TWILIO_ACCOUNT_SID
    const token = process.env.TWILIO_AUTH_TOKEN
    if (!sid || !token) {
      throw new Error('Twilio credentials not configured')
    }
    _client = twilio(sid, token)
  }
  return _client
}

const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID || ''

// ── Twilio Verify (OTP) ─────────────────────────────────────────────────────

// Send a verification code via Twilio Verify (no A2P registration needed)
export async function sendVerificationCode(to: string) {
  const client = getClient()
  return client.verify.v2
    .services(VERIFY_SERVICE_SID)
    .verifications.create({ to, channel: 'sms' })
}

// Check a verification code via Twilio Verify
export async function checkVerificationCode(to: string, code: string) {
  const client = getClient()
  const check = await client.verify.v2
    .services(VERIFY_SERVICE_SID)
    .verificationChecks.create({ to, code })
  return check.status === 'approved'
}

// ── Direct SMS (for booking notifications — requires A2P when ready) ─────────

const FROM = process.env.TWILIO_PHONE_NUMBER || ''

// Send a booking confirmation to a client
export async function sendBookingConfirmation({
  to,
  clientName,
  serviceName,
  date,
  time,
  detailerName,
}: {
  to: string
  clientName: string
  serviceName: string
  date: string
  time: string
  detailerName: string
}) {
  const client = getClient()
  return client.messages.create({
    to,
    from: FROM,
    body: `Hi ${clientName}! Your ${serviceName} appointment with ${detailerName} is confirmed for ${date} at ${time}. Reply STOP to unsubscribe.`,
  })
}

// Send a booking notification to the detailer
export async function sendBookingNotification({
  to,
  clientName,
  serviceName,
  date,
  time,
}: {
  to: string
  clientName: string
  serviceName: string
  date: string
  time: string
}) {
  const client = getClient()
  return client.messages.create({
    to,
    from: FROM,
    body: `GlossIO: New booking! ${clientName} booked ${serviceName} on ${date} at ${time}.`,
  })
}

// Send a 24-hour appointment reminder to the client
export async function sendAppointmentReminder({
  to,
  clientName,
  serviceName,
  date,
  time,
}: {
  to: string
  clientName: string
  serviceName: string
  date: string
  time: string
}) {
  const client = getClient()
  return client.messages.create({
    to,
    from: FROM,
    body: `Hi ${clientName}! Just a reminder: your ${serviceName} appointment is tomorrow, ${date} at ${time}. See you then!`,
  })
}

// Send a cancellation alert to the detailer
export async function sendCancellationAlert({
  to,
  clientName,
  serviceName,
  date,
}: {
  to: string
  clientName: string
  serviceName: string
  date: string
}) {
  const client = getClient()
  return client.messages.create({
    to,
    from: FROM,
    body: `GlossIO: ${clientName} cancelled their ${serviceName} appointment on ${date}.`,
  })
}
