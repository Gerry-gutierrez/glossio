import { createBrowserClient } from '@supabase/ssr'

// Hardcoded public values — these are safe to expose (anon key is read-only, RLS enforced)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmsxedfjyyfjykudyuim.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptc3hlZGZqeXlmanlrdWR5dWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTk5OTksImV4cCI6MjA4ODk5NTk5OX0.LvyKyRdKqQQiMkw0P7Su08do3z4ZOLntOJ2SQ069txE'

// Singleton — reuse same client across components
let client: ReturnType<typeof createBrowserClient> | null = null

// Use this in Client Components ('use client')
export function createClient() {
  if (client) return client
  client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
      secure: true,
    },
  })
  return client
}
