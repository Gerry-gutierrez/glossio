import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Uses service_role to look up a user's email by phone number from auth.users
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json() as { phone: string }
    if (!phone) {
      return NextResponse.json({ error: 'Missing phone' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmsxedfjyyfjykudyuim.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // List all users and find by phone in user_metadata
    // Note: Supabase admin API doesn't support filtering by metadata directly,
    // so we paginate through users. For small user bases this is fine.
    const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })

    if (error) {
      console.error('lookup-email error:', error)
      return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
    }

    // Normalize input phone to digits only for comparison
    const phoneDigits = phone.replace(/\D/g, '')

    const match = users.find(u => {
      const metaPhone = u.user_metadata?.phone || ''
      const metaDigits = metaPhone.replace(/\D/g, '')
      return metaDigits === phoneDigits
    })

    if (match?.email) {
      return NextResponse.json({ email: match.email })
    }

    return NextResponse.json({ email: null })
  } catch (err) {
    console.error('lookup-email error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
