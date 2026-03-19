import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Build redirect to login — use public URL, not internal Railway container URL
  const origin = request.headers.get('origin')
    || request.headers.get('x-forwarded-host') && `https://${request.headers.get('x-forwarded-host')}`
    || 'https://www.glossio.org'
  const url = new URL('/login', origin)
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
