import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

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

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('identifier', identifier)
      .eq('code', code)
      .eq('type', type)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
    }

    // Mark code as used
    await supabase
      .from('verification_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', data.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('verify-code error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
