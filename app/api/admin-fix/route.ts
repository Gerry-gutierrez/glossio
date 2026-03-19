import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// One-time admin fix: confirm all unconfirmed user emails
// DELETE THIS FILE after the fix is applied
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== 'glossio-fix-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmsxedfjyyfjykudyuim.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const unconfirmed = users.filter(u => !u.email_confirmed_at)
    const results = []

    for (const user of unconfirmed) {
      const { error: updateErr } = await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      })
      results.push({
        email: user.email,
        id: user.id,
        confirmed: !updateErr,
        error: updateErr?.message || null,
      })
    }

    return NextResponse.json({
      total_users: users.length,
      unconfirmed_found: unconfirmed.length,
      results,
    })
  } catch (err) {
    console.error('admin-fix error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
