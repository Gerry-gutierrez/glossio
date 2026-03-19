import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug')
    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmsxedfjyyfjykudyuim.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // List all users and find one whose company_name generates a matching slug
    const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    if (error) {
      console.error('public-profile error:', error)
      return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
    }

    const match = users.find(u => {
      const meta = u.user_metadata || {}
      const name = meta.company_name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim()
      const userSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return userSlug === slug
    })

    if (!match) {
      return NextResponse.json({ profile: null })
    }

    const meta = match.user_metadata || {}
    return NextResponse.json({
      profile: {
        id: match.id,
        company_name: meta.company_name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || 'Detailer',
        tagline: meta.tagline || `Professional detailing in ${meta.city || meta.address || 'your area'}`,
        bio: meta.bio || '',
        is_pro: false,
        avatar_url: meta.avatar_url || null,
        phone: meta.phone || '',
        address: meta.address || '',
        instagram: meta.instagram || '',
      },
    })
  } catch (err) {
    console.error('public-profile error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
