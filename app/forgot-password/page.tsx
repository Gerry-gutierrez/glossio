'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (resetError) {
      setError(resetError.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'Georgia, serif',
    }}>
      <Link href="/" className="gradient-text" style={{ fontSize: 26, fontWeight: 700, marginBottom: 40, textDecoration: 'none' }}>
        GlossIO
      </Link>

      <div style={{
        width: '100%',
        maxWidth: 440,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 36,
      }}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#00E5A015', border: '1px solid #00E5A033',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: 24, color: '#00E5A0',
            }}>
              ✓
            </div>
            <h2 style={{ fontSize: 22, margin: '0 0 12px', color: 'var(--text)' }}>Check your email</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
              We sent a password reset link to <strong style={{ color: 'var(--text)' }}>{email}</strong>. Click the link in the email to set a new password.
            </p>
            <Link href="/login" style={{
              display: 'inline-block',
              color: '#00C2FF',
              fontSize: 13,
              textDecoration: 'none',
            }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 11, letterSpacing: '0.15em', color: '#00C2FF', textTransform: 'uppercase', margin: '0 0 8px' }}>
              Forgot Password
            </p>
            <h2 style={{ fontSize: 22, margin: '0 0 8px', color: 'var(--text)' }}>Reset your password</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 24px' }}>
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            {error && (
              <div style={{
                background: '#FF336615', border: '1px solid #FF336633',
                borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                fontSize: 13, color: '#FF3366',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#666', textTransform: 'uppercase', marginBottom: 8 }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="carlos@gmail.com"
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
                  marginBottom: 20,
                  boxSizing: 'border-box' as const,
                }}
              />

              <button
                type="submit"
                disabled={loading || !email.trim()}
                style={{
                  width: '100%',
                  background: loading || !email.trim() ? '#1A1A2E' : '#00C2FF',
                  border: 'none',
                  borderRadius: 10,
                  color: loading || !email.trim() ? '#444' : '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  padding: '14px',
                  cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: 'Georgia, serif',
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Link href="/login" style={{ color: '#00C2FF', fontSize: 13, textDecoration: 'none' }}>
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
