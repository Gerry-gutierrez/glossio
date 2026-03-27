import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  // Simple admin password check via query param
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, company_name, slug, subscription_status, is_pro, trial_ends_at, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users: profiles })
}
