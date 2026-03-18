import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

const FROM = process.env.TWILIO_PHONE_NUMBER!

// Generate a 6-digit OTP code
export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send a verification code via SMS
export async function sendVerificationCode(to: string, code: string) {
  return client.messages.create({
    to,
    from: FROM,
    body: `Your GlossIO verification code is: ${code}. Expires in 10 minutes.`,
  })
}

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
  return client.messages.create({
    to,
    from: FROM,
    body: `GlossIO: ${clientName} cancelled their ${serviceName} appointment on ${date}.`,
  })
}
