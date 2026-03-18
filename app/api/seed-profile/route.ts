import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Called after signup to seed default business hours, notification settings, etc.
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const supabase = createServiceClient()

    // Call the seed function we defined in our migration
    await supabase.rpc('seed_profile_defaults', { profile_uuid: userId })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('seed-profile error:', err)
    return NextResponse.json({ error: 'Seeding failed' }, { status: 500 })
  }
}
