import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json() as { email: string }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Check if a user with this email already exists in auth.users
    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error('check-email error:', error)
      return NextResponse.json({ exists: false })
    }

    const exists = data.users.some(
      (u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase()
    )

    return NextResponse.json({ exists })
  } catch (err) {
    console.error('check-email error:', err)
    return NextResponse.json({ exists: false })
  }
}
