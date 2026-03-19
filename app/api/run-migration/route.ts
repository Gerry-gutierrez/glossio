import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// One-time migration route — runs the schema setup via individual statements
// Protected by a secret query param
// DELETE THIS FILE after migration is confirmed
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== 'glossio-migrate-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmsxedfjyyfjykudyuim.supabase.co'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceKey) {
    return NextResponse.json({ error: 'Missing service role key' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const results: { step: string; status: string; error?: string }[] = []

  // Helper to run SQL via Supabase's postgres REST endpoint
  async function runSQL(label: string, sql: string) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey!,
          'Authorization': `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ name: sql }),
      })
      // This won't work for DDL — fall through to alternative
      results.push({ step: label, status: 'attempted via rpc' })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      results.push({ step: label, status: 'error', error: msg })
    }
  }

  // Try using the Supabase SQL API endpoint (available on newer versions)
  async function execSQL(label: string, sql: string) {
    try {
      // Method 1: Try the /pg endpoint (Supabase edge function SQL execution)
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey!,
          'Authorization': `Bearer ${serviceKey}`,
          'Prefer': 'return=representation',
        },
      })
      results.push({ step: label, status: res.status.toString() })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      results.push({ step: label, status: 'error', error: msg })
    }
  }

  // Step 1: Check if profiles table exists by trying to query it
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1)
    if (error && error.message.includes('does not exist')) {
      results.push({ step: 'check_profiles', status: 'TABLE DOES NOT EXIST — migration needed' })
    } else if (error) {
      results.push({ step: 'check_profiles', status: 'error', error: error.message })
    } else {
      results.push({ step: 'check_profiles', status: `TABLE EXISTS — ${data?.length ?? 0} rows found` })
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    results.push({ step: 'check_profiles', status: 'error', error: msg })
  }

  // Step 2: Check what tables DO exist
  const tables = ['profiles', 'detailers', 'services', 'work_photos', 'clients',
                  'appointments', 'business_hours', 'notification_settings',
                  'availability_settings', 'availability_blocks', 'verification_codes']

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(0)
      if (error) {
        results.push({ step: `check_${table}`, status: 'MISSING', error: error.message })
      } else {
        results.push({ step: `check_${table}`, status: 'EXISTS' })
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      results.push({ step: `check_${table}`, status: 'error', error: msg })
    }
  }

  return NextResponse.json({
    message: 'Migration check complete. See which tables exist and which are missing.',
    instruction: 'Run the SQL from supabase/migrations/001_initial.sql in your Supabase SQL editor to create missing tables.',
    results,
  }, { status: 200 })
}
