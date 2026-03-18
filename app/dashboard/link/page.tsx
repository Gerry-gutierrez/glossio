'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

function LinkSvg({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function GlobeSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function EyeSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

const SHARE_OPTIONS = [
  {
    label: 'Text It',
    sub: 'Send via SMS',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    sub: 'Add to bio',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'Business Card',
    sub: 'Print it',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--highlight)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <line x1="6" y1="8" x2="6.01" y2="8" />
        <line x1="10" y1="8" x2="18" y2="8" />
        <line x1="6" y1="12" x2="18" y2="12" />
        <line x1="6" y1="16" x2="14" y2="16" />
      </svg>
    ),
  },
]

const INFO_CARDS = [
  {
    title: 'Clients can\'t edit anything',
    body: 'When a client opens your link, they can only view your profile, browse your photos, and book. No editing. No removing pics.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: 'Always up to date',
    body: 'Any change you make to your services, photos, or profile instantly reflects on your link. No republishing needed.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
  },
  {
    title: 'Every booking gets tracked',
    body: 'When a client books through your link, they automatically get added to your Clients tab with their info and job history.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    title: 'Works everywhere',
    body: 'Text it, DM it, add it to your Instagram bio, print it on a business card. It works anywhere a link works.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--highlight)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
]

export default function MyLinkPage() {
  const supabase = createClient()
  const [copied, setCopied] = useState(false)
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase.from('profiles').select('slug').eq('id', user.id).single()
      if (data?.slug) setSlug(data.slug)
      setLoading(false)
    }
    load()
  }, [supabase])

  const profileUrl = slug ? `glossio.org/${slug}` : 'glossio.org/your-slug'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${profileUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textarea = document.createElement('textarea')
      textarea.value = `https://${profileUrl}`
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handlePreview = () => {
    if (slug) window.open(`/${slug}`, '_blank')
  }

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <p className={styles.headerLabel}>Detailer Dashboard</p>
        <h1 className={styles.headerTitle}>My Link</h1>
      </div>

      {/* Link Card */}
      <div className={styles.linkCard}>
        <div className={styles.linkCardHeader}>
          <div className={styles.linkIconBox}>
            <LinkSvg />
          </div>
          <div>
            <h2 className={styles.linkCardTitle}>Your Public Profile Link</h2>
            <p className={styles.linkCardSub}>Share this with any client — it&apos;s your digital storefront</p>
          </div>
        </div>

        {/* Link display */}
        <div className={styles.linkDisplay}>
          <div className={styles.linkUrl}>
            <GlobeSvg />
            <span className={styles.linkUrlText}>{profileUrl}</span>
          </div>
          <button
            onClick={handleCopy}
            className={`${styles.copyBtn} ${copied ? styles.copyBtnCopied : ''}`}
          >
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* Share options */}
        <div className={styles.shareGrid}>
          {SHARE_OPTIONS.map(s => (
            <div key={s.label} className={styles.shareCard}>
              <div className={styles.shareIcon}>{s.icon}</div>
              <p className={styles.shareLabel}>{s.label}</p>
              <p className={styles.shareSub}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Preview button */}
        <button onClick={handlePreview} className={styles.previewBtn}>
          <EyeSvg />
          See What Your Clients See
        </button>
      </div>

      {/* Info Cards */}
      <div className={styles.infoGrid}>
        {INFO_CARDS.map(card => (
          <div key={card.title} className={styles.infoCard}>
            <div className={styles.infoCardIcon}>{card.icon}</div>
            <p className={styles.infoCardTitle}>{card.title}</p>
            <p className={styles.infoCardBody}>{card.body}</p>
          </div>
        ))}
      </div>
    </>
  )
}
