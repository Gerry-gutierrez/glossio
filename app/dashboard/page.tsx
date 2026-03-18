'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

// TODO: Replace with real Supabase data
const MOCK_APPOINTMENTS = [
  { id: 1, client: 'Marcus T.', service: 'Full Detail', price: 159.99, date: '2025-03-06', time: '10:00 AM', status: 'complete' as const, vehicle: '2021 BMW M3', phone: '(239) 555-0101' },
  { id: 2, client: 'Jenna R.', service: 'Exterior Wash', price: 49.99, date: '2025-03-06', time: '1:00 PM', status: 'complete' as const, vehicle: '2019 Honda Civic', phone: '(239) 555-0102' },
  { id: 3, client: 'Devon S.', service: 'Paint Correction', price: 299.99, date: '2025-03-10', time: '9:00 AM', status: 'confirmed' as const, vehicle: '2020 Dodge Charger', phone: '(239) 555-0103' },
  { id: 4, client: 'Aisha M.', service: 'Interior Detail', price: 89.99, date: '2025-03-12', time: '11:00 AM', status: 'confirmed' as const, vehicle: '2022 Tesla Model 3', phone: '(239) 555-0104' },
  { id: 5, client: 'Tyler W.', service: 'Full Detail', price: 159.99, date: '2025-03-15', time: '2:00 PM', status: 'pending' as const, vehicle: '2023 Ford F-150', phone: '(239) 555-0105' },
  { id: 6, client: 'Sofia L.', service: 'Ceramic Coat', price: 599.99, date: '2025-03-20', time: '10:00 AM', status: 'confirmed' as const, vehicle: '2020 Porsche Cayenne', phone: '(239) 555-0106' },
]

const STATUS_CONFIG = {
  pending:   { color: '#FFD60A', bg: '#FFD60A15', border: '#FFD60A33', label: 'Pending' },
  confirmed: { color: '#00C2FF', bg: '#00C2FF15', border: '#00C2FF33', label: 'Confirmed' },
  complete:  { color: '#00E5A0', bg: '#00E5A015', border: '#00E5A033', label: 'Complete' },
} as const

type Status = keyof typeof STATUS_CONFIG

const fmt = (n: number) => `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`

function StatIcon({ type, color }: { type: string; color: string }) {
  const props = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  if (type === 'revenue') return <svg {...props}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
  if (type === 'projected') return <svg {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
  return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}

function QuickIcon({ type, color }: { type: string; color: string }) {
  const props = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  if (type === 'profile') return <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  if (type === 'services') return <svg {...props}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
  if (type === 'photos') return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
  return <svg {...props}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
}

export default function DashboardPage() {
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS)
  const [apptView, setApptView] = useState<'table' | 'calendar'>('table')

  const revenueMTD = appointments.filter(a => a.status === 'complete').reduce((s, a) => s + a.price, 0)
  const projectedThisMonth = appointments.filter(a => ['confirmed', 'pending'].includes(a.status)).reduce((s, a) => s + a.price, 0)
  const pending = appointments.filter(a => a.status === 'pending').length

  const confirmAppt = (id: number) => setAppointments(p => p.map(a => a.id === id ? { ...a, status: 'confirmed' as const } : a))
  const completeAppt = (id: number) => setAppointments(p => p.map(a => a.id === id ? { ...a, status: 'complete' as const } : a))

  const businessName = 'Your Business'

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className={styles.headerLabel}>Welcome back</p>
          <h1 className={styles.headerTitle}>{businessName}</h1>
        </div>
        {pending > 0 && (
          <div className={styles.pendingBanner}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD60A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className={styles.pendingText}>
              {pending} Pending {pending === 1 ? 'Appointment' : 'Appointments'}
            </span>
          </div>
        )}
      </div>

      {/* Revenue Stats */}
      <div className={styles.statGrid}>
        {[
          {
            label: 'Revenue MTD',
            value: fmt(revenueMTD),
            color: '#00E5A0',
            sub: 'Completed jobs this month',
            detail: `${appointments.filter(a => a.status === 'complete').length} jobs completed`,
            iconType: 'revenue',
          },
          {
            label: 'Projected This Month',
            value: fmt(projectedThisMonth),
            color: '#00C2FF',
            sub: 'Confirmed + pending remaining',
            detail: `${appointments.filter(a => ['confirmed', 'pending'].includes(a.status)).length} jobs remaining`,
            iconType: 'projected',
          },
          {
            label: 'Total Booked',
            value: `${appointments.length}`,
            color: '#A259FF',
            sub: 'All appointments',
            detail: `${pending} awaiting confirmation`,
            iconType: 'booked',
          },
        ].map(s => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statGlow} style={{ background: `radial-gradient(circle, ${s.color}10, transparent)` }} />
            <div className={styles.statIcon} style={{ background: `${s.color}15` }}>
              <StatIcon type={s.iconType} color={s.color} />
            </div>
            <p className={styles.statValue} style={{ color: s.color }}>{s.value}</p>
            <p className={styles.statLabel}>{s.label}</p>
            <p className={styles.statSub}>{s.sub}</p>
            <p className={styles.statDetail} style={{ color: s.color }}>{s.detail}</p>
          </div>
        ))}
      </div>

      {/* Appointments */}
      <div className={styles.apptCard}>
        <div className={styles.apptHeader}>
          <div>
            <h2 className={styles.apptTitle}>Appointments</h2>
            <p className={styles.apptSubtitle}>{appointments.length} total</p>
          </div>
          <div className={styles.viewToggle}>
            {(['table', 'calendar'] as const).map(v => (
              <button
                key={v}
                onClick={() => setApptView(v)}
                className={`${styles.viewBtn} ${apptView === v ? styles.viewBtnActive : styles.viewBtnInactive}`}
              >
                {v === 'table' ? 'List' : 'Calendar'}
              </button>
            ))}
          </div>
        </div>

        {/* Status legend */}
        <div className={styles.statusLegend}>
          {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([key, cfg]) => (
            <div key={key} className={styles.statusItem}>
              <div className={styles.statusDot} style={{ background: cfg.color }} />
              <span>{cfg.label} ({appointments.filter(a => a.status === key).length})</span>
            </div>
          ))}
        </div>

        {apptView === 'table' && (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.apptTable}>
              <thead>
                <tr>
                  {['Client', 'Vehicle', 'Service', 'Price', 'Date & Time', 'Status', 'Actions'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => {
                  const cfg = STATUS_CONFIG[a.status]
                  return (
                    <tr key={a.id}>
                      <td>
                        <p className={styles.clientName}>{a.client}</p>
                        <p className={styles.clientPhone}>{a.phone}</p>
                      </td>
                      <td style={{ fontSize: 13, color: '#888' }}>{a.vehicle}</td>
                      <td style={{ fontSize: 13, color: '#C8C4BC' }}>{a.service}</td>
                      <td style={{ fontSize: 13, color: '#00E5A0', fontWeight: 700 }}>{fmt(a.price)}</td>
                      <td>
                        <p style={{ margin: '0 0 2px', fontSize: 13, color: '#C8C4BC' }}>{a.date}</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#555' }}>{a.time}</p>
                      </td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                        >
                          {cfg.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {a.status === 'pending' && (
                            <>
                              <button
                                onClick={() => confirmAppt(a.id)}
                                className={styles.actionBtn}
                                style={{ background: '#00C2FF15', border: '1px solid #00C2FF33', color: '#00C2FF' }}
                              >
                                Confirm
                              </button>
                              <button
                                className={styles.actionBtn}
                                style={{ background: '#FF6B3515', border: '1px solid #FF6B3533', color: '#FF6B35' }}
                              >
                                Alt Time
                              </button>
                            </>
                          )}
                          {a.status === 'confirmed' && (
                            <button
                              onClick={() => completeAppt(a.id)}
                              className={styles.actionBtn}
                              style={{ background: '#00E5A015', border: '1px solid #00E5A033', color: '#00E5A0' }}
                            >
                              Mark Complete
                            </button>
                          )}
                          {a.status === 'complete' && (
                            <span style={{ fontSize: 12, color: '#444' }}>Done</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {apptView === 'calendar' && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} style={{ background: 'rgba(0, 194, 255, 0.1)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00C2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p className={styles.emptyTitle}>Calendar View</p>
            <p className={styles.emptySub}>Calendar view will be available once connected to Supabase.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h2 className={styles.quickTitle}>Quick Actions</h2>
        <div className={styles.quickGrid}>
          {[
            { label: 'Edit Profile', color: '#00C2FF', iconType: 'profile', href: '/dashboard/profile' },
            { label: 'Manage Services', color: '#A259FF', iconType: 'services', href: '/dashboard/services' },
            { label: 'Upload Photos', color: '#FF6B35', iconType: 'photos', href: '/dashboard/profile' },
            { label: 'Copy Booking Link', color: '#FFD60A', iconType: 'link', href: '#' },
          ].map(a => (
            <Link key={a.label} href={a.href} className={styles.quickCard}>
              <div className={styles.quickIcon} style={{ background: `${a.color}15` }}>
                <QuickIcon type={a.iconType} color={a.color} />
              </div>
              <span className={styles.quickLabel}>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
