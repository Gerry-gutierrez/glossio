'use client'

import styles from './page.module.css'

function ShieldSvg() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
}

const SETTINGS_SECTIONS = [
  {
    id: 'account',
    label: 'Account & Security',
    description: 'Password, email, phone, two-factor authentication',
    color: '#00C2FF',
    items: ['Change Password', 'Change Email', 'Change Phone', 'Two-Factor Auth'],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00C2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    id: 'business',
    label: 'Business Info',
    description: 'Business name, location, hours, tagline, bio',
    color: '#A259FF',
    items: ['Business Name', 'Location & Service Area', 'Business Hours', 'Tagline & Bio'],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A259FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'availability',
    label: 'Availability & Blocking',
    description: 'Days off, vacation blocks, booking limits, advance window',
    color: '#FF6B35',
    items: ['Vacation / Date Blocks', 'Max Appts Per Day', 'Advance Booking Window'],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Booking alerts, cancellations, reminders, email summaries',
    color: '#FFD60A',
    items: ['New Booking Alerts', 'Cancellation Alerts', '24hr Reminder Toggle', 'Weekly Email Summary'],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFD60A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    id: 'subscription',
    label: 'Subscription & Billing',
    description: 'Current plan, billing date, payment method, cancel',
    color: '#00E5A0',
    items: ['Current Plan', 'Update Payment Method', 'Billing History', 'Cancel Subscription'],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00E5A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    id: 'support',
    label: 'Support',
    description: 'Contact admin, submit feedback, help docs',
    color: '#FF3366',
    items: ['Contact Support'],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF3366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
]

// TODO: Replace with real profile data from Supabase
const QUICK_INFO = [
  { label: 'Plan', value: 'GlossIO Pro', color: 'var(--primary)' },
  { label: 'Trial Ends', value: 'Mar 26, 2026', color: 'var(--gold)' },
  { label: 'Member Since', value: 'Mar 12, 2026', color: 'var(--secondary)' },
  { label: 'Account', value: 'carlos@detailco.com', color: 'var(--text)' },
]

export default function SettingsPage() {
  return (
    <>
      <div className={styles.header}>
        <p className={styles.headerLabel}>Detailer Dashboard</p>
        <h1 className={styles.headerTitle}>Settings</h1>
        <p className={styles.headerSub}>Manage your account, availability, notifications, and subscription.</p>
      </div>

      {/* Quick Info */}
      <div className={styles.infoBar}>
        {QUICK_INFO.map(item => (
          <div key={item.label} className={styles.infoItem}>
            <p className={styles.infoLabel}>{item.label}</p>
            <p className={styles.infoValue} style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Section Cards */}
      <div className={styles.sectionGrid}>
        {SETTINGS_SECTIONS.map(section => (
          <div
            key={section.id}
            className={styles.sectionCard}
            style={{ borderLeftWidth: 3, borderLeftStyle: 'solid', borderLeftColor: 'var(--border)' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = `${section.color}0A`
              e.currentTarget.style.borderLeftColor = section.color
              e.currentTarget.style.borderColor = `${section.color}44`
              e.currentTarget.style.borderLeftColor = section.color
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--bg-sidebar)'
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.borderLeftColor = 'var(--border)'
            }}
          >
            <div className={styles.sectionCardHeader}>
              <div className={styles.sectionCardInfo}>
                <div
                  className={styles.sectionIconBox}
                  style={{ background: `${section.color}15`, border: `1px solid ${section.color}33` }}
                >
                  {section.icon}
                </div>
                <div>
                  <p className={styles.sectionLabel}>{section.label}</p>
                  <p className={styles.sectionDesc}>{section.description}</p>
                </div>
              </div>
              <span className={styles.sectionArrow}>{'\u203A'}</span>
            </div>

            <div
              className={styles.sectionItems}
              style={{ borderTop: '1px solid var(--border)' }}
            >
              {section.items.map(item => (
                <span key={item} className={styles.sectionItemChip}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Note */}
      <div className={styles.bottomNote}>
        <ShieldSvg />
        <p className={styles.bottomNoteText}>
          Your data is encrypted and never shared. For urgent account issues contact us at{' '}
          <span className={styles.bottomNoteLink}>support@glossio.app</span>
        </p>
      </div>
    </>
  )
}
