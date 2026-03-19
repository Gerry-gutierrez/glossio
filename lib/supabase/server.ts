import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Hardcoded public values — these are safe to expose (anon key is read-only, RLS enforced)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmsxedfjyyfjykudyuim.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptc3hlZGZqeXlmanlrdWR5dWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTk5OTksImV4cCI6MjA4ODk5NTk5OX0.LvyKyRdKqQQiMkw0P7Su08do3z4ZOLntOJ2SQ069txE'

// Use this in Server Components, Route Handlers, and Server Actions
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Cookies can't be set from Server Components — OK in read-only contexts
          }
        },
      },
    }
  )
}

// Service role client — bypasses RLS, for server-only operations (Twilio, webhooks)
export function createServiceClient() {
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
