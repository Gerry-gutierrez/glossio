import { NextRequest, NextResponse } from 'next/server'
import { checkVerificationCode } from '@/lib/twilio'

export async function POST(request: NextRequest) {
  try {
    const { identifier, code, type } = await request.json() as {
      identifier: string
      code: string
      type: string
    }

    if (!identifier || !code || !type) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Normalize phone to E.164 format to match what was sent
    const digits = identifier.replace(/\D/g, '')
    const e164 = digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits.startsWith('1') ? `+${digits}` : identifier.startsWith('+') ? identifier : `+${digits}`

    // Check OTP via Twilio Verify
    const approved = await checkVerificationCode(e164, code)

    if (!approved) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('verify-code error:', err)
    const message = err instanceof Error ? err.message : ''
    const isExpired = message.includes('expired') || message.includes('not found')
    return NextResponse.json(
      { error: isExpired ? 'Code expired. Request a new one.' : 'Verification failed. Please try again.' },
      { status: isExpired ? 400 : 500 }
    )
  }
}
