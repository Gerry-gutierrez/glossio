'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

const PAIN_POINTS = [
  'Appointments buried in Instagram DMs',
  'Clients ghosting after you quote them',
  'No-shows with zero heads up',
  'Managing everything from your notes app',
]

const GOLDEN_CIRCLE = [
  {
    ring: 'WHY',
    color: '#00C2FF',
    title: 'Every detailer deserves a real business',
    body: 'Your craft is professional. Your tools should be too. Too many talented detailers lose work because they\'re running their business out of a text thread. That ends here.',
  },
  {
    ring: 'HOW',
    color: '#A259FF',
    title: 'By replacing the DM with a system built for you',
    body: 'GlossIO gives you a professional booking page, an appointment dashboard, automated reminders, and real-time client communication — all in one place.',
  },
  {
    ring: 'WHAT',
    color: '#FF6B35',
    title: 'A platform your clients love and you actually use',
    body: 'Your own branded profile link. A service menu you control. An appointment board that keeps you organized. Clients book, you confirm, reminders go out automatically.',
  },
]

const STEPS = [
  { step: '01', title: 'Sign Up', desc: 'Create your account in minutes. Start your 14-day free trial — no card needed.', iconBg: 'rgba(0,194,255,0.12)', iconColor: '#00C2FF' },
  { step: '02', title: 'Build Your Profile', desc: 'Add your services, prices, photos, and a profile pic. Make it yours.', iconBg: 'rgba(162,89,255,0.12)', iconColor: '#A259FF' },
  { step: '03', title: 'Share Your Link', desc: 'Drop your unique GlossIO link in your bio, stories, or wherever you promote.', iconBg: 'rgba(255,107,53,0.12)', iconColor: '#FF6B35' },
  { step: '04', title: 'Manage Everything', desc: 'Clients book, you confirm, reminders go out automatically. You stay focused.', iconBg: 'rgba(0,229,160,0.12)', iconColor: '#00E5A0' },
]

const FEATURES = [
  'Your own branded booking page',
  'Unlimited appointments',
  'Automated text & email reminders',
  'Real-time dashboard',
  'Service menu editor',
  'Photo gallery for your work',
  'Shareable social media link',
  'No hidden fees — ever',
]

function StepIcon({ step, color }: { step: string; color: string }) {
  if (step === '01') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  )
  if (step === '02') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
  if (step === '03') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [email, setEmail] = useState('')

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>

      {/* NAV */}
      <nav className={styles.nav}>
        <Link href="/" className="gradient-text" style={{ fontSize: 22, fontWeight: 700 }}>
          GlossIO
        </Link>
        <div className={styles.navLinks}>
          <a href="#how-it-works" className={styles.navLink}>How it Works</a>
          <a href="#pricing" className={styles.navLink}>Pricing</a>
          <a href="#why" className={styles.navLink}>For Detailers</a>
        </div>
        <div className={styles.navActions}>
          <Link href="/login" className={styles.navLogin}>Log In</Link>
          <Link href="/signup" className={styles.navCta}>Start Free Trial</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroBadge}>Built for Auto Detailers</div>

        <h1 className={styles.heroTitle}>
          Stop Losing Clients<br />
          <span className="gradient-text">in the DMs.</span>
        </h1>

        <p className={styles.heroSub}>
          GlossIO gives your detail business a professional home — so clients can browse your services, book appointments, and you never miss a job again.
        </p>

        <div className={styles.heroForm}>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            type="email"
            className={styles.heroInput}
          />
          <Link href={email ? `/signup?email=${encodeURIComponent(email)}` : '/signup'} className={styles.heroBtn}>
            Start My Free Trial →
          </Link>
        </div>
        <p className={styles.heroDisclaimer}>14 days free · No credit card required · Cancel anytime</p>
      </section>

      {/* PAIN POINTS */}
      <section className={styles.painStrip}>
        {PAIN_POINTS.map(text => (
          <div key={text} className={styles.painItem}>
            <span className={styles.painDot} />
            <span className={styles.painText}>{text}</span>
          </div>
        ))}
      </section>

      {/* GOLDEN CIRCLE — WHY / HOW / WHAT */}
      <section id="why" className={styles.goldenCircle}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p className={styles.sectionLabel}>Our Purpose</p>
          <h2 className={styles.sectionTitle}>Why GlossIO Exists</h2>
        </div>
        <div className={styles.circleGrid}>
          {GOLDEN_CIRCLE.map(card => (
            <div key={card.ring} className={styles.circleCard}>
              <div
                className={styles.circleBadge}
                style={{
                  background: `${card.color}15`,
                  border: `1px solid ${card.color}33`,
                  color: card.color,
                }}
              >
                {card.ring}
              </div>
              <h3 className={styles.circleCardTitle}>{card.title}</h3>
              <p className={styles.circleCardBody}>{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className={styles.howSection}>
        <div className={styles.howInner}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p className={styles.sectionLabel}>Simple by Design</p>
            <h2 className={styles.sectionTitle}>How It Works</h2>
          </div>
          <div className={styles.howGrid}>
            {STEPS.map(s => (
              <div key={s.step} className={styles.howCard}>
                <p className={styles.howStep}>{s.step}</p>
                <div className={styles.howIcon} style={{ background: s.iconBg }}>
                  <StepIcon step={s.step} color={s.iconColor} />
                </div>
                <h4 className={styles.howCardTitle}>{s.title}</h4>
                <p className={styles.howCardDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className={styles.pricing}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p className={styles.sectionLabel}>Simple Pricing</p>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 16 }}>One price. Everything included.</h2>
          <p style={{ fontSize: 15, color: '#777', margin: 0 }}>No hidden fees. No contracts. Cancel anytime.</p>
        </div>

        <div className={styles.pricingToggle}>
          <div className={styles.toggleWrap}>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`${styles.toggleBtn} ${billingCycle === 'monthly' ? styles.toggleBtnActive : styles.toggleBtnInactive}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`${styles.toggleBtn} ${billingCycle === 'annual' ? styles.toggleBtnActive : styles.toggleBtnInactive}`}
            >
              Annual — Save $50
            </button>
          </div>
        </div>

        <div className={styles.priceCard}>
          <div className={styles.priceGlow1} />
          <div className={styles.priceGlow2} />

          {billingCycle === 'annual' && (
            <div className={styles.saveBadge}>Best Value — Save $50/year</div>
          )}

          <p className={styles.priceLabel}>
            {billingCycle === 'monthly' ? 'Monthly Plan' : 'Annual Plan'}
          </p>
          <div style={{ marginBottom: billingCycle === 'annual' ? 8 : 28, position: 'relative' }}>
            <span className={styles.priceAmount}>${billingCycle === 'monthly' ? '25' : '250'}</span>
            <span className={styles.pricePeriod}>{billingCycle === 'monthly' ? '/mo' : '/year'}</span>
          </div>
          {billingCycle === 'annual' && (
            <p className={styles.priceBreakdown}>That&apos;s just $20.83/mo</p>
          )}

          <div className={styles.featureList}>
            {FEATURES.map(feat => (
              <div key={feat} className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span className={styles.featureText}>{feat}</span>
              </div>
            ))}
          </div>

          <Link href="/signup" className={styles.priceBtn} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            Start My 14-Day Free Trial →
          </Link>
          <p className={styles.priceDisclaimer}>No credit card required to start</p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={styles.finalCta}>
        <h2 className={styles.finalTitle}>
          Your next client is already looking for you.
        </h2>
        <p className={styles.finalSub}>
          Give them a professional place to land. Set up your GlossIO profile today — free for 14 days.
        </p>
        <Link href="/signup" className={styles.finalBtn}>Get Started Free →</Link>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <span className="gradient-text" style={{ fontSize: 16, fontWeight: 700 }}>GlossIO</span>
        <p className={styles.footerCopy}>© {new Date().getFullYear()} GlossIO. All rights reserved.</p>
        <div className={styles.footerLinks}>
          <a href="#" className={styles.footerLink}>Privacy</a>
          <a href="#" className={styles.footerLink}>Terms</a>
          <a href="#" className={styles.footerLink}>Contact</a>
        </div>
      </footer>

    </div>
  )
}
