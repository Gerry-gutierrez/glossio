'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import styles from './page.module.css'
import { createClient } from '@/lib/supabase/client'

type ProfileData = {
  company_name: string; tagline: string; bio: string; is_pro: boolean; avatar_url: string | null
}
type ServiceData = {
  id: string | number; name: string; price: string; description: string; icon: string; color: string
}
type PhotoData = {
  id: string | number; color: string; label: string; url: string | null
}
type StatData = { value: string; label: string }

function WrenchSvg() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

function CalendarSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function ClipboardSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  )
}

function ArrowDownSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
    </svg>
  )
}

type Photo = PhotoData

export default function PublicProfilePage() {
  const params = useParams()
  const slug = params.slug as string

  const [expandedPhoto, setExpandedPhoto] = useState<PhotoData | null>(null)
  const [showServices, setShowServices] = useState(false)
  const [profile, setProfile] = useState<ProfileData>({ company_name: '', tagline: '', bio: '', is_pro: false, avatar_url: null })
  const [services, setServices] = useState<ServiceData[]>([])
  const [photos, setPhotos] = useState<PhotoData[]>([])
  const [stats, setStats] = useState<StatData[]>([])
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    try {
      // Look up profile by slug via server API (queries auth.users metadata)
      const res = await fetch(`/api/public-profile?slug=${encodeURIComponent(slug)}`)
      const { profile: prof } = await res.json()

      if (!prof) { setLoading(false); return }

      setProfile({
        company_name: prof.company_name,
        tagline: prof.tagline,
        bio: prof.bio,
        is_pro: prof.is_pro,
        avatar_url: prof.avatar_url,
      })

      // Try loading services from DB (may not exist yet)
      const supabase = createClient()
      const { data: svcs } = await supabase
        .from('services')
        .select('id, name, description, price, icon, color')
        .eq('profile_id', prof.id)
        .eq('is_active', true)
        .order('sort_order')

      if (svcs && svcs.length > 0) {
        setServices(svcs.map(s => ({ ...s, price: String(s.price) })))
      }

      // Try loading work photos
      const { data: workPhotos } = await supabase
        .from('work_photos')
        .select('id, url, sort_order')
        .eq('profile_id', prof.id)
        .order('sort_order')

      if (workPhotos && workPhotos.length > 0) {
        setPhotos(workPhotos.map(p => ({ id: p.id, color: '#111118', label: '', url: p.url })))
      }

      setStats([
        { value: '0', label: 'Details' },
        { value: '5.0', label: 'Rating' },
        { value: 'New', label: 'Experience' },
      ])
    } catch (err) {
      console.error('Failed to load profile:', err)
    }

    setLoading(false)
  }, [slug])

  useEffect(() => { loadProfile() }, [loadProfile])

  if (loading) {
    return <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading...</div>
  }

  if (!profile.company_name) {
    return <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: 12 }}><h1 style={{ fontSize: 24, margin: 0 }}>Profile Not Found</h1><p style={{ margin: 0, color: 'var(--text-faint)' }}>This detailer profile doesn&apos;t exist.</p></div>
  }

  const MOCK_SERVICES = services
  const MOCK_PHOTOS = photos
  const MOCK_STATS = stats

  const initials = profile.company_name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-serif)', color: 'var(--text)' }}>

      {/* Top bar */}
      <div className={styles.topBar}>
        <h2 className={styles.logo}>GlossIO</h2>
        <div className={styles.verifiedBadge}>
          <div className={styles.verifiedDot} />
          <span className={styles.verifiedText}>Verified Detailer</span>
        </div>
      </div>

      <div className={styles.container}>

        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroGlow} />

          {/* Profile Pic */}
          <div className={styles.profilePic}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.company_name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              initials
            )}
          </div>

          {/* Name + Badge */}
          <div className={styles.nameRow}>
            <h1 className={styles.profileName}>{profile.company_name}</h1>
            {profile.is_pro && <span className={styles.proBadge}>PRO</span>}
          </div>

          {/* Tagline */}
          <p className={styles.tagline}>{profile.tagline}</p>

          {/* Stats row */}
          <div className={styles.statsPill}>
            {MOCK_STATS.map((s, i) => (
              <div key={s.label} className={`${styles.statsItem} ${i < MOCK_STATS.length - 1 ? styles.statsItemBorder : ''}`}>
                <p className={styles.statsValue}>{s.value}</p>
                <p className={styles.statsLabel}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Book Button */}
          <button onClick={() => setShowServices(true)} className={styles.bookBtn}>
            <WrenchSvg />
            See Services &amp; Book an Appointment
          </button>
          <p className={styles.bookSub}>Browse services · Pick a time · Get confirmed</p>

          {/* Scroll hint */}
          <div className={styles.scrollHint}>
            <p className={styles.scrollHintText}>Scroll to see our work</p>
            <ArrowDownSvg />
          </div>
        </div>

        {/* Divider */}
        <div className={styles.sectionDivider}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>Our Work</span>
          <div className={styles.dividerLine} />
        </div>

        {/* Photo Grid */}
        <div className={styles.photoSection}>
          {MOCK_PHOTOS.length > 0 ? (
            <>
              <div className={styles.photoGrid}>
                {MOCK_PHOTOS.map(photo => (
                  <div
                    key={photo.id}
                    onClick={() => setExpandedPhoto(photo)}
                    className={styles.photoCard}
                    style={{
                      background: photo.url ? `url(${photo.url}) center / cover` : photo.color,
                    }}
                  >
                    <div className={styles.photoOverlay} />
                    {!photo.url && (
                      <>
                        <span className={styles.photoPlaceholder}>
                          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                          </svg>
                        </span>
                        <span className={styles.photoLabel}>{photo.label}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <p className={styles.photoHint}>Tap any photo to view</p>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12, opacity: 0.5 }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
              <p style={{ fontSize: 14, margin: 0 }}>Work photos coming soon</p>
            </div>
          )}
        </div>

        {/* Bio */}
        <div className={styles.bioBox}>
          <p className={styles.bioLabel}>About</p>
          <p className={styles.bioText}>{profile.bio}</p>
        </div>

        {/* Bottom CTA */}
        <div className={styles.bottomCta}>
          <button onClick={() => setShowServices(true)} className={styles.bottomBookBtn}>
            <CalendarSvg />
            Ready to Book? Let&apos;s Go
          </button>
          <p className={styles.poweredBy}>
            Powered by <span className={styles.poweredByBrand}>GlossIO</span>
          </p>
        </div>
      </div>

      {/* Photo Expand Modal */}
      {expandedPhoto && (
        <div className={styles.photoModal} onClick={() => setExpandedPhoto(null)}>
          <div
            className={styles.photoModalContent}
            style={{
              background: expandedPhoto.url ? `url(${expandedPhoto.url}) center / cover` : expandedPhoto.color,
            }}
          >
            {!expandedPhoto.url && (
              <>
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
                <p className={styles.photoModalLabel}>{expandedPhoto.label}</p>
              </>
            )}
            <p className={styles.photoModalHint}>Tap anywhere to close</p>
          </div>
        </div>
      )}

      {/* Services Bottom Sheet */}
      {showServices && (
        <div className={styles.sheetOverlay}>
          <div className={styles.sheet}>
            <div className={styles.sheetHeader}>
              <h2 className={styles.sheetTitle}>Services &amp; Booking</h2>
              <button onClick={() => setShowServices(false)} className={styles.sheetCloseBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className={styles.sheetSub}>Select a service to start your booking.</p>

            <div className={styles.servicesList}>
              {MOCK_SERVICES.length > 0 ? (
                MOCK_SERVICES.map(svc => (
                  <div
                    key={svc.id}
                    className={styles.serviceItem}
                    style={{ borderLeft: `3px solid ${svc.color}` }}
                  >
                    <span className={styles.serviceItemIcon}>{svc.icon}</span>
                    <div className={styles.serviceItemInfo}>
                      <p className={styles.serviceItemName}>{svc.name}</p>
                      <p className={styles.serviceItemDesc}>{svc.description}</p>
                    </div>
                    <p className={styles.serviceItemPrice} style={{ color: svc.color }}>${svc.price}</p>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: 14, margin: '0 0 4px' }}>No services listed yet</p>
                  <p style={{ fontSize: 12, margin: 0, color: 'var(--text-faint)' }}>Check back soon!</p>
                </div>
              )}
            </div>

            <div className={styles.sheetInfo}>
              <ClipboardSvg />
              <p className={styles.sheetInfoText}>
                After selecting your service, you&apos;ll provide your info and preferred time. {profile.company_name.split(' ')[0]} will confirm within 24 hours.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
