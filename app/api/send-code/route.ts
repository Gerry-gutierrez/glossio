import { NextRequest, NextResponse } from 'next/server'
import { generateCode, sendVerificationCode } from '@/lib/twilio'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { identifier, type } = await request.json() as {
      identifier: string
      type: 'phone_signup' | 'phone_change' | '2fa' | 'email_change'
    }

    if (!identifier || !type) {
      return NextResponse.json({ error: 'Missing identifier or type' }, { status: 400 })
    }

    const code = generateCode()
    const supabase = createServiceClient()

    // Invalidate any prior unused codes for this identifier+type
    await supabase
      .from('verification_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('identifier', identifier)
      .eq('type', type)
      .is('used_at', null)

    // Store new code
    const { error } = await supabase.from('verification_codes').insert({
      identifier,
      code,
      type,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    })

    if (error) throw error

    // Send via Twilio SMS (phone types) — email types are handled by Supabase natively
    if (type !== 'email_change') {
      await sendVerificationCode(identifier, code)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('send-code error:', err)
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 })
  }
}
