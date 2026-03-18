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
  } catch (err) {
    console.error('send-code error:', err)
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 })
  }
}
