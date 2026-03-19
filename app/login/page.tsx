'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Determine if identifier is email or phone
    const isEmail = identifier.includes('@')
    const credentials = isEmail
      ? { email: identifier, password }
      : { phone: identifier.replace(/\D/g, ''), password }

    const { error } = await supabase.auth.signInWithPassword(credentials as any)

    if (error) {
      setError('Invalid email/phone or password. Please try again.')
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0F',
      fontFamily: 'Georgia, serif',
      color: '#F0EDE8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      {/* Logo */}
      <h1 style={{
        margin: '0 0 40px',
        fontSize: 26,
        fontWeight: 700,
        background: 'linear-gradient(90deg, #00C2FF, #A259FF)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>GlossIO</h1>

      <div style={{
        width: '100%',
        maxWidth: 480,
        background: '#111118',
        border: '1px solid #1E1E2E',
        borderRadius: 20,
        padding: '40px 44px',
      }}>
        <p style={{ fontSize: 10, letterSpacing: '0.3em', color: '#555', textTransform: 'uppercase', margin: '0 0 10px' }}>
          Welcome Back
        </p>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 10px' }}>Sign in to GlossIO</h2>
        <p style={{ fontSize: 14, color: '#777', lineHeight: 1.7, margin: '0 0 28px' }}>
          Use your email address or phone number to sign in.
        </p>

        {error && (
          <div style={{
            background: '#FF336615',
            border: '1px solid #FF336633',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 20,
            fontSize: 13,
            color: '#FF3366',
          }}>{error}</div>
        )}

        <form onSubmit={handleLogin}>
          <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#666', textTransform: 'uppercase', marginBottom: 8 }}>
            Email or Phone Number
          </label>
          <input
            type="text"
            placeholder="carlos@gmail.com or (239) 555-0100"
            value={identifier}
            onChange={e => {
              const v = e.target.value
              // Auto-format as phone if it starts with a digit or ( and has no @
              if (!v.includes('@') && /^[\d(]/.test(v)) {
                setIdentifier(formatPhone(v))
              } else {
                setIdentifier(v)
              }
            }}
            required
            style={{
              width: '100%',
              background: '#0A0A0F',
              border: '1px solid #2A2A3E',
              borderRadius: 8,
              color: '#F0EDE8',
              fontSize: 14,
              padding: '14px',
              outline: 'none',
              fontFamily: 'Georgia, serif',
              marginBottom: 16,
              boxSizing: 'border-box' as const,
            }}
          />

          <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#666', textTransform: 'uppercase', marginBottom: 8 }}>
            Password
          </label>
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                background: '#0A0A0F',
                border: '1px solid #2A2A3E',
                borderRadius: 8,
                color: '#F0EDE8',
                fontSize: 14,
                padding: '14px 44px 14px 14px',
                outline: 'none',
                fontFamily: 'Georgia, serif',
                boxSizing: 'border-box' as const,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              aria-label={showPass ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 14,
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {showPass ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
            </button>
          </div>

          <div style={{ textAlign: 'right', marginBottom: 28 }}>
            <Link href="/forgot-password" style={{ fontSize: 12, color: '#00C2FF', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || !identifier || !password}
            style={{
              width: '100%',
              background: loading || !identifier || !password
                ? '#1A1A2E'
                : '#00C2FF',
              border: 'none',
              borderRadius: 10,
              color: loading || !identifier || !password ? '#444' : '#fff',
              fontSize: 14,
              fontWeight: 700,
              padding: '13px',
              cursor: loading || !identifier || !password ? 'not-allowed' : 'pointer',
              letterSpacing: '0.05em',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: 20, fontSize: 13, color: '#555' }}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" style={{ color: '#00C2FF', textDecoration: 'none', fontWeight: 600 }}>
          Start Free Trial
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#555', fontFamily: 'Georgia, serif' }}>Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
