'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  companyName: string
  companyPhone: string
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  emailCode: string
  phoneCode: string
  password: string
  confirmPassword: string
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const inputBase: React.CSSProperties = {
  background: '#0A0A0F',
  border: '1px solid #2A2A3E',
  borderRadius: 8,
  color: '#F0EDE8',
  fontSize: 14,
  padding: '14px',
  outline: 'none',
  fontFamily: 'Georgia, serif',
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  marginBottom: 16,
}

function InputField(props: React.InputHTMLAttributes<HTMLInputElement> & { style?: React.CSSProperties }) {
  const { style, ...rest } = props
  return <input style={{ ...inputBase, ...style }} {...rest} />
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      display: 'block', fontSize: 11, letterSpacing: '0.2em',
      color: '#666', textTransform: 'uppercase', marginBottom: 8,
    }}>
      {children}
    </label>
  )
}

function StepTag({ children }: { children: string }) {
  return (
    <p style={{ fontSize: 10, letterSpacing: '0.3em', color: '#555', textTransform: 'uppercase', margin: '0 0 10px' }}>
      {children}
    </p>
  )
}

function PrimaryBtn({ children, onClick, disabled }: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      style={{
        flex: 1, width: '100%',
        background: disabled ? '#1A1A2E' : 'linear-gradient(135deg, #00C2FF, #A259FF)',
        border: 'none', borderRadius: 10,
        color: disabled ? '#444' : '#fff',
        fontSize: 14, fontWeight: 700, padding: '13px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: '0.05em', transition: 'all 0.2s',
      }}
    >{children}</button>
  )
}

function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        background: 'transparent', border: '1px solid #2A2A3E',
        borderRadius: 10, color: '#888', fontSize: 14,
        fontWeight: 600, padding: '13px 20px', cursor: 'pointer',
      }}
    >{children}</button>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Business Info' },
  { id: 2, label: 'Personal Info' },
  { id: 3, label: 'Verify' },
  { id: 4, label: 'Create Login' },
]

function ProgressBar({ step }: { step: number }) {
  if (step >= 5) return null
  return (
    <div style={{ width: '100%', maxWidth: 520, marginBottom: 36 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        {STEPS.map(s => (
          <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: step > s.id ? 'linear-gradient(135deg, #00C2FF, #A259FF)' : '#111118',
              border: step >= s.id ? '2px solid #00C2FF' : '2px solid #2A2A3E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
              color: step > s.id ? '#fff' : step === s.id ? '#00C2FF' : '#444',
              transition: 'all 0.3s',
            }}>
              {step > s.id ? '✓' : s.id}
            </div>
            <span style={{ fontSize: 10, color: step >= s.id ? '#888' : '#444', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
      <div style={{ height: 2, background: '#1E1E2E', borderRadius: 2, marginTop: 4 }}>
        <div style={{
          height: '100%',
          width: `${((step - 1) / 3) * 100}%`,
          background: 'linear-gradient(90deg, #00C2FF, #A259FF)',
          borderRadius: 2, transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  )
}

// ─── Password Strength ────────────────────────────────────────────────────────

function passwordStrength(pw: string): { label: string; width: string; color: string } {
  if (pw.length >= 12) return { label: 'Strong password ✓', width: '100%', color: '#00E5A0' }
  if (pw.length >= 8) return { label: 'Good — could be stronger', width: '60%', color: '#FFD60A' }
  return { label: 'Too short', width: '30%', color: '#FF3366' }
}

// ─── Main Onboarding Page ─────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>({
    companyName: '', companyPhone: '',
    firstName: '', lastName: '', phone: '', email: '', address: '',
    emailCode: '', phoneCode: '',
    password: '', confirmPassword: '',
  })

  // Pre-fill email from landing page CTA
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setForm(f => ({ ...f, email: emailParam }))
    }
  }, [searchParams])
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifyingEmail, setVerifyingEmail] = useState(false)
  const [verifyingPhone, setVerifyingPhone] = useState(false)
  const [error, setError] = useState('')

  const update = (field: keyof FormState, val: string) =>
    setForm(f => ({ ...f, [field]: val }))

  const canProceed = () => {
    if (step === 1) return true // all optional
    if (step === 2) return !!(form.firstName && form.lastName && form.phone && form.email && form.address)
    if (step === 3) return emailVerified && phoneVerified
    if (step === 4) return !!(form.password && form.password === form.confirmPassword && form.password.length >= 8)
    return true
  }

  // Send verification codes when moving to step 3
  const sendCodes = async () => {
    try {
      // Send email OTP via Supabase
      await supabase.auth.signInWithOtp({ email: form.email, options: { shouldCreateUser: false } })

      // Send phone code via Twilio
      await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: form.phone, type: 'phone_signup' }),
      })
    } catch (err) {
      console.error('Failed to send codes:', err)
    }
  }

  const next = async () => {
    if (!canProceed()) return
    setError('')

    if (step === 2) {
      // Trigger code sending before showing step 3
      await sendCodes()
    }

    if (step === 4) {
      // Create the account
      await createAccount()
      return
    }

    setStep(s => Math.min(s + 1, 5))
  }

  const back = () => {
    setError('')
    setStep(s => Math.max(s - 1, 1))
  }

  const verifyEmail = async () => {
    if (!form.emailCode || form.emailCode.length !== 6) return
    setVerifyingEmail(true)
    setError('')
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: form.email,
        token: form.emailCode,
        type: 'email',
      })
      if (error) throw error
      setEmailVerified(true)
    } catch {
      setError('Invalid email code. Please try again.')
    } finally {
      setVerifyingEmail(false)
    }
  }

  const verifyPhone = async () => {
    if (!form.phoneCode || form.phoneCode.length !== 6) return
    setVerifyingPhone(true)
    setError('')
    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: form.phone,
          code: form.phoneCode,
          type: 'phone_signup',
        }),
      })
      if (!res.ok) throw new Error('Invalid code')
      setPhoneVerified(true)
    } catch {
      setError('Invalid phone code. Please try again.')
    } finally {
      setVerifyingPhone(false)
    }
  }

  const createAccount = async () => {
    setLoading(true)
    setError('')
    try {
      // Sign up with Supabase auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
            phone: form.phone,
            company_name: form.companyName || null,
            address: form.address,
          },
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // Update profile with all collected info
        await supabase.from('profiles').upsert({
          id: data.user.id,
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone: form.phone,
          company_name: form.companyName || null,
          location: form.address,
          // Generate a URL-friendly slug from company name or full name
          slug: (form.companyName || `${form.firstName} ${form.lastName}`)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, ''),
        })

        // Seed default business hours, notification settings, availability settings
        await fetch('/api/seed-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id }),
        })
      }

      setStep(5)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const headingStyle: React.CSSProperties = { fontSize: 24, fontWeight: 700, margin: '0 0 10px' }
  const subStyle: React.CSSProperties = { fontSize: 14, color: '#777', lineHeight: 1.7, margin: '0 0 28px' }

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
        margin: '0 0 40px', fontSize: 26, fontWeight: 700,
        background: 'linear-gradient(90deg, #00C2FF, #A259FF)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>GlossIO</h1>

      <ProgressBar step={step} />

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 520,
        background: '#111118',
        border: '1px solid #1E1E2E',
        borderRadius: 20,
        padding: '40px 44px',
      }}>
        {/* Error banner */}
        {error && (
          <div style={{
            background: '#FF336615', border: '1px solid #FF336633',
            borderRadius: 10, padding: '12px 16px', marginBottom: 20,
            fontSize: 13, color: '#FF3366',
          }}>{error}</div>
        )}

        {/* ── STEP 1: Business Info ── */}
        {step === 1 && (
          <div>
            <StepTag>Step 1 of 4</StepTag>
            <h2 style={headingStyle}>Tell us about your business</h2>
            <p style={subStyle}>Company name and number are optional — add them if you have one, skip if you&apos;re just getting started.</p>

            <FieldLabel>Company Name <span style={{ fontSize: 10, color: '#444', marginLeft: 6 }}>(optional)</span></FieldLabel>
            <InputField placeholder="e.g. Carlos Detail Co." value={form.companyName} onChange={e => update('companyName', e.target.value)} />

            <FieldLabel>Company Phone Number <span style={{ fontSize: 10, color: '#444', marginLeft: 6 }}>(optional)</span></FieldLabel>
            <InputField placeholder="e.g. (239) 555-0199" value={form.companyPhone} onChange={e => update('companyPhone', e.target.value)} />

            <div style={{
              background: '#00C2FF0D', border: '1px solid #00C2FF22',
              borderRadius: 10, padding: '14px 16px', margin: '24px 0 28px',
            }}>
              <p style={{ margin: 0, fontSize: 13, color: '#00C2FF', lineHeight: 1.6 }}>
                🎉 <strong>No credit card needed.</strong> Try GlossIO free for 14 days — if you love it, pick a plan that works for you.
              </p>
            </div>

            <PrimaryBtn onClick={next}>Continue →</PrimaryBtn>
          </div>
        )}

        {/* ── STEP 2: Personal Info ── */}
        {step === 2 && (
          <div>
            <StepTag>Step 2 of 4</StepTag>
            <h2 style={headingStyle}>Your personal info</h2>
            <p style={subStyle}>This is how we&apos;ll identify your account and keep you in the loop.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <FieldLabel>First Name</FieldLabel>
                <InputField placeholder="Carlos" value={form.firstName} onChange={e => update('firstName', e.target.value)} />
              </div>
              <div>
                <FieldLabel>Last Name</FieldLabel>
                <InputField placeholder="Martinez" value={form.lastName} onChange={e => update('lastName', e.target.value)} />
              </div>
            </div>

            <FieldLabel>Phone Number</FieldLabel>
            <InputField type="tel" placeholder="(239) 555-0100" value={form.phone} onChange={e => update('phone', e.target.value)} />

            <FieldLabel>Email Address</FieldLabel>
            <InputField type="email" placeholder="carlos@gmail.com" value={form.email} onChange={e => update('email', e.target.value)} />

            <FieldLabel>Address</FieldLabel>
            <InputField placeholder="123 Main St, Naples, FL 34102" value={form.address} onChange={e => update('address', e.target.value)} />

            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <GhostBtn onClick={back}>← Back</GhostBtn>
              <PrimaryBtn onClick={next} disabled={!canProceed()}>Continue →</PrimaryBtn>
            </div>
          </div>
        )}

        {/* ── STEP 3: Verify ── */}
        {step === 3 && (
          <div>
            <StepTag>Step 3 of 4</StepTag>
            <h2 style={headingStyle}>Verify your info</h2>
            <p style={subStyle}>We sent a 6-digit code to your email and phone. Enter both below to confirm it&apos;s really you.</p>

            {/* Email verify */}
            <div style={{
              background: '#0A0A0F',
              border: `1px solid ${emailVerified ? '#00E5A044' : '#1E1E2E'}`,
              borderRadius: 12, padding: '20px 22px', marginBottom: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <FieldLabel>Email Code</FieldLabel>
                {emailVerified && <span style={{ fontSize: 11, color: '#00E5A0', fontWeight: 700 }}>✓ Verified</span>}
              </div>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: '#555' }}>
                Sent to {form.email}
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  placeholder="Enter 6-digit code"
                  value={form.emailCode}
                  onChange={e => update('emailCode', e.target.value)}
                  maxLength={6}
                  disabled={emailVerified}
                  style={{ ...inputBase, marginBottom: 0, flex: 1 }}
                />
                <button
                  onClick={verifyEmail}
                  disabled={emailVerified || verifyingEmail || form.emailCode.length !== 6}
                  style={{
                    background: emailVerified ? '#00E5A022' : 'linear-gradient(135deg, #00C2FF, #A259FF)',
                    border: emailVerified ? '1px solid #00E5A044' : 'none',
                    borderRadius: 8, color: emailVerified ? '#00E5A0' : '#fff',
                    fontSize: 12, fontWeight: 700, padding: '0 16px',
                    cursor: emailVerified ? 'default' : 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  {verifyingEmail ? '...' : emailVerified ? '✓ Done' : 'Verify'}
                </button>
              </div>
            </div>

            {/* Phone verify */}
            <div style={{
              background: '#0A0A0F',
              border: `1px solid ${phoneVerified ? '#00E5A044' : '#1E1E2E'}`,
              borderRadius: 12, padding: '20px 22px', marginBottom: 28,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <FieldLabel>Phone Code</FieldLabel>
                {phoneVerified && <span style={{ fontSize: 11, color: '#00E5A0', fontWeight: 700 }}>✓ Verified</span>}
              </div>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: '#555' }}>
                Sent to {form.phone}
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  placeholder="Enter 6-digit code"
                  value={form.phoneCode}
                  onChange={e => update('phoneCode', e.target.value)}
                  maxLength={6}
                  disabled={phoneVerified}
                  style={{ ...inputBase, marginBottom: 0, flex: 1 }}
                />
                <button
                  onClick={verifyPhone}
                  disabled={phoneVerified || verifyingPhone || form.phoneCode.length !== 6}
                  style={{
                    background: phoneVerified ? '#00E5A022' : 'linear-gradient(135deg, #00C2FF, #A259FF)',
                    border: phoneVerified ? '1px solid #00E5A044' : 'none',
                    borderRadius: 8, color: phoneVerified ? '#00E5A0' : '#fff',
                    fontSize: 12, fontWeight: 700, padding: '0 16px',
                    cursor: phoneVerified ? 'default' : 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  {verifyingPhone ? '...' : phoneVerified ? '✓ Done' : 'Verify'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <GhostBtn onClick={back}>← Back</GhostBtn>
              <PrimaryBtn onClick={next} disabled={!canProceed()}>Continue →</PrimaryBtn>
            </div>
          </div>
        )}

        {/* ── STEP 4: Create Login ── */}
        {step === 4 && (
          <div>
            <StepTag>Step 4 of 4</StepTag>
            <h2 style={headingStyle}>Create your login</h2>
            <p style={subStyle}>You can sign in with your email or phone number plus this password.</p>

            <FieldLabel>Password</FieldLabel>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                style={{ ...inputBase, marginBottom: 0, paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16 }}
              >{showPass ? '🙈' : '👁'}</button>
            </div>

            <FieldLabel>Confirm Password</FieldLabel>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <input
                type={showConfirmPass ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={e => update('confirmPassword', e.target.value)}
                style={{ ...inputBase, marginBottom: 0, paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16 }}
              >{showConfirmPass ? '🙈' : '👁'}</button>
            </div>

            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p style={{ margin: '0 0 12px', fontSize: 12, color: '#FF3366' }}>Passwords don&apos;t match</p>
            )}

            {form.password && (() => {
              const { label, width, color } = passwordStrength(form.password)
              return (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ height: 4, background: '#1E1E2E', borderRadius: 2 }}>
                    <div style={{ height: '100%', borderRadius: 2, width, background: color, transition: 'all 0.3s' }} />
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: '#555' }}>{label}</p>
                </div>
              )
            })()}

            <div style={{
              background: '#A259FF0D', border: '1px solid #A259FF22',
              borderRadius: 10, padding: '12px 16px', marginBottom: 28,
            }}>
              <p style={{ margin: 0, fontSize: 12, color: '#A259FF', lineHeight: 1.6 }}>
                🔐 You can sign in using your <strong>email</strong> or <strong>phone number</strong> + your password.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <GhostBtn onClick={back}>← Back</GhostBtn>
              <PrimaryBtn onClick={next} disabled={!canProceed() || loading}>
                {loading ? 'Creating account...' : 'Create My Account →'}
              </PrimaryBtn>
            </div>
          </div>
        )}

        {/* ── STEP 5: Welcome ── */}
        {step === 5 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #00C2FF, #A259FF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, margin: '0 auto 24px',
            }}>✓</div>

            <h2 style={{ ...headingStyle, textAlign: 'center' }}>
              You&apos;re in{form.companyName ? `, ${form.companyName}` : form.firstName ? `, ${form.firstName}` : ''}! 🎉
            </h2>
            <p style={{ ...subStyle, textAlign: 'center' }}>
              Your 14-day free trial has started. Head to your dashboard to set up your profile, add your services, and grab your booking link.
            </p>

            <div style={{
              background: '#0A0A0F', border: '1px solid #1E1E2E',
              borderRadius: 12, padding: '18px 22px', margin: '24px 0 32px', textAlign: 'left',
            }}>
              {[
                { icon: '🎨', text: 'Customize your public profile' },
                { icon: '🛠', text: 'Add your services & prices' },
                { icon: '🔗', text: 'Copy & share your booking link' },
                { icon: '📅', text: 'Watch appointments roll in' },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: '#C8C4BC' }}>{item.text}</span>
                </div>
              ))}
            </div>

            <PrimaryBtn onClick={() => router.push('/dashboard')}>
              Go to My Dashboard →
            </PrimaryBtn>
          </div>
        )}
      </div>

      {step < 5 && (
        <p style={{ marginTop: 20, fontSize: 13, color: '#555' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#00C2FF', textDecoration: 'none', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      )}
    </div>
  )
}
