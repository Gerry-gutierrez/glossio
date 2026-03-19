import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 30-day persistent session
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days in seconds

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/clients', '/services', '/appointments', '/profile', '/settings', '/link']

// Routes only for unauthenticated users (redirect to dashboard if logged in)
const AUTH_ROUTES = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  // DEV BYPASS: skip auth when Supabase isn't configured
  if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co') {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmsxedfjyyfjykudyuim.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptc3hlZGZqeXlmanlrdWR5dWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTk5OTksImV4cCI6MjA4ODk5NTk5OX0.LvyKyRdKqQQiMkw0P7Su08do3z4ZOLntOJ2SQ069txE',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            // If Supabase is clearing the cookie (sign out), respect that
            const isClearing = !value || value === ''
            supabaseResponse.cookies.set(name, value, {
              ...options,
              maxAge: isClearing ? 0 : COOKIE_MAX_AGE,
              path: '/',
              sameSite: 'lax',
              secure: true,
              httpOnly: true,
            })
          })
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Redirect unauthenticated users away from protected routes
  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from auth pages
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
