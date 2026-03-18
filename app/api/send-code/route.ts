import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationCode } from '@/lib/twilio'

export async function POST(request: NextRequest) {
  try {
    const { identifier, type } = await request.json() as {
      identifier: string
      type: 'phone_signup' | 'phone_change' | '2fa' | 'email_change'
    }

    if (!identifier || !type) {
      return NextResponse.json({ error: 'Missing identifier or type' }, { status: 400 })
    }

    // Email verification is handled by Supabase natively
    if (type === 'email_change') {
      return NextResponse.json({ error: 'Email changes handled by Supabase' }, { status: 400 })
    }

    // Send OTP via Twilio Verify (no A2P registration needed)
    await sendVerificationCode(identifier)

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('send-code error:', err)
    const message = err instanceof Error ? err.message : 'Failed to send code'
    const isTwilioError = message.includes('Invalid parameter') || message.includes('not a valid phone number')
    return NextResponse.json(
      { error: isTwilioError ? 'Invalid phone number format. Use +1XXXXXXXXXX.' : 'Failed to send verification code. Please try again.' },
      { status: isTwilioError ? 400 : 500 }
    )
  }
}
