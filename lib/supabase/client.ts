import { createBrowserClient } from '@supabase/ssr'

// Hardcoded public values — these are safe to expose (anon key is read-only, RLS enforced)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmsxedfjyyfjykudyuim.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnc3hlZGZqeXlmanlrdWR5dWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5OTMxOTksImV4cCI6MjA1NzU2OTE5OX0.qDK7-0Mv6atMBaJJSvXD58iBNHUqFkBtV5oPqBnETm0'

// Use this in Client Components ('use client')
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
