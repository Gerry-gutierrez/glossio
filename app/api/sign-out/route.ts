import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Build redirect to login
  const url = new URL('/login', request.url)
  const response = NextResponse.redirect(url, { status: 302 })

  // Nuke all Supabase auth cookies
  const allCookies = request.cookies.getAll()
  for (const cookie of allCookies) {
    if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
      response.cookies.set(cookie.name, '', {
        maxAge: 0,
        path: '/',
        expires: new Date(0),
      })
    }
  }

  return response
}
