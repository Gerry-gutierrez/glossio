'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './layout.module.css'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'grid' },
  { href: '/dashboard/appointments', label: 'Appointments', icon: 'calendar' },
  { href: '/dashboard/clients', label: 'Clients', icon: 'users' },
  { href: '/dashboard/services', label: 'Services', icon: 'wrench' },
  { href: '/dashboard/profile', label: 'My Profile', icon: 'user' },
  { href: '/dashboard/link', label: 'My Link', icon: 'link' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'settings' },
] as const

function NavIcon({ name, className }: { name: string; className?: string }) {
  const props = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className }

  switch (name) {
    case 'grid':
      return <svg {...props}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
    case 'calendar':
      return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    case 'users':
      return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    case 'wrench':
      return <svg {...props}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
    case 'user':
      return <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    case 'settings':
      return <svg {...props}><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>
    case 'menu':
      return <svg {...props} width={22} height={22}><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
    case 'link':
      return <svg {...props} width={14} height={14}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
    default:
      return null
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [copied, setCopied] = useState(false)
  const [businessName, setBusinessName] = useState('Your Business')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [slug, setSlug] = useState('')
  const [planLabel, setPlanLabel] = useState('Loading...')

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Try profiles table first
      const { data } = await supabase
        .from('profiles')
        .select('company_name, slug, subscription_status, avatar_url')
        .eq('id', user.id)
        .single()

      if (data) {
        setBusinessName(data.company_name || 'Your Business')
        setAvatarUrl(data.avatar_url || null)
        setSlug(data.slug || '')
        const status = data.subscription_status
        setPlanLabel(
          status === 'active' ? 'Pro' :
          status === 'trialing' ? 'Pro · Trial' :
          status === 'past_due' ? 'Past Due' :
          status === 'canceled' ? 'Canceled' : 'Free'
        )
      } else {
        // Fallback to auth user_metadata (set during signup)
        const meta = user.user_metadata || {}
        const name = meta.company_name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || 'Your Business'
        setBusinessName(name)
        setSlug(
          name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        )
        setPlanLabel('Free Trial')
      }
    }
    loadProfile()
  }, [supabase])

  const handleSignOut = async () => {
    setSigningOut(true)
    // Use server-side sign out to properly clear cookies before redirect
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/api/sign-out'
    document.body.appendChild(form)
    form.submit()
  }

  const copyLink = () => {
    const link = slug ? `${window.location.origin}/${slug}` : ''
    if (link) navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.shell}>
      {/* Hamburger button (mobile) */}
      <button
        className={styles.hamburger}
        onClick={() => setSidebarOpen(v => !v)}
        aria-label="Toggle menu"
      >
        <NavIcon name="menu" />
      </button>

      {/* Mobile overlay */}
      <div
        className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <p className={styles.sidebarLabel}>Platform</p>
          <Link href="/" className="gradient-text" style={{ fontSize: 22, fontWeight: 700, display: 'block' }}>
            GlossIO
          </Link>
        </div>

        {/* User card */}
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={businessName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              businessName.charAt(0).toUpperCase()
            )}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p className={styles.userName}>{businessName}</p>
            <p className={styles.userPlan}>{planLabel}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map(item => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navBtn} ${isActive ? styles.navBtnActive : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <NavIcon name={item.icon} className={styles.navIcon} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Copy Link */}
        <div className={styles.sidebarFooter}>
          <button
            onClick={copyLink}
            className={`${styles.copyLinkBtn} ${copied ? styles.copyLinkBtnCopied : ''}`}
          >
            {copied ? '✓ Link Copied!' : 'Copy Booking Link'}
          </button>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className={styles.signOutBtn}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {signingOut ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
