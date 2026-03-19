import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Confirms a user's email via admin API (bypasses email verification)
// Used after phone-verified signup since we verify identity via SMS, not email
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json() as { userId: string }
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmsxedfjyyfjykudyuim.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
    })

    if (error) {
      console.error('confirm-email error:', error)
      return NextResponse.json({ error: 'Failed to confirm email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('confirm-email error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
