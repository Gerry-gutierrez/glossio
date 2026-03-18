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

    // Check OTP via Twilio Verify
    const approved = await checkVerificationCode(identifier, code)

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
