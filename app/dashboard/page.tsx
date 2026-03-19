'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import styles from './page.module.css'
import { createClient } from '@/lib/supabase/client'

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

type DashAppt = {
  id: string | number; client: string; service: string; price: number
  date: string; time: string; status: 'pending' | 'confirmed' | 'complete'
  vehicle: string; phone: string
}

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<DashAppt[]>([])
  const [apptView, setApptView] = useState<'table' | 'calendar'>('table')
  const [businessName, setBusinessName] = useState('Your Business')
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Load profile name (try profiles table, fallback to auth metadata)
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_name')
      .eq('id', user.id)
      .single()
    if (profile?.company_name) {
      setBusinessName(profile.company_name)
    } else {
      const meta = user.user_metadata || {}
      setBusinessName(meta.company_name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || 'Your Business')
    }

    // Load appointments with client and service info
    const { data: appts } = await supabase
      .from('appointments')
      .select('id, scheduled_date, scheduled_time, status, price, notes, clients(first_name, last_name, phone, vehicle_info), services(name)')
      .eq('profile_id', user.id)
      .order('scheduled_date', { ascending: true })

    if (appts && appts.length > 0) {
      setAppointments(appts.map((a: Record<string, unknown>) => {
        const client = a.clients as Record<string, string> | null
        const service = a.services as Record<string, string> | null
        return {
          id: a.id as string,
          client: client ? `${client.first_name} ${(client.last_name || '').charAt(0)}.` : 'Unknown',
          service: service?.name || 'Service',
          price: (a.price as number) || 0,
          date: a.scheduled_date as string,
          time: a.scheduled_time as string || '',
          status: (a.status as 'pending' | 'confirmed' | 'complete') || 'pending',
          vehicle: client?.vehicle_info || '',
          phone: client?.phone || '',
        }
      }))
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const revenueMTD = appointments.filter(a => a.status === 'complete').reduce((s, a) => s + a.price, 0)
  const projectedThisMonth = appointments.filter(a => ['confirmed', 'pending'].includes(a.status)).reduce((s, a) => s + a.price, 0)
  const pending = appointments.filter(a => a.status === 'pending').length

  const confirmAppt = async (id: string | number) => {
    setAppointments(p => p.map(a => a.id === id ? { ...a, status: 'confirmed' as const } : a))
    const supabase = createClient()
    await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', id)
  }
  const completeAppt = async (id: string | number) => {
    setAppointments(p => p.map(a => a.id === id ? { ...a, status: 'complete' as const } : a))
    const supabase = createClient()
    await supabase.from('appointments').update({ status: 'complete' }).eq('id', id)
  }

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

        {apptView === 'calendar' && (() => {
          const now = new Date()

          const firstDay = new Date(calYear, calMonth, 1).getDay()
          const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
          const monthName = new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

          const apptsByDate: Record<string, DashAppt[]> = {}
          appointments.forEach(a => {
            if (!apptsByDate[a.date]) apptsByDate[a.date] = []
            apptsByDate[a.date].push(a)
          })

          const prevMonth = () => {
            if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
            else setCalMonth(m => m - 1)
          }
          const nextMonth = () => {
            if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
            else setCalMonth(m => m + 1)
          }

          const cells = []
          for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} style={{ minHeight: 64 }} />)
          for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            const dayAppts = apptsByDate[dateStr] || []
            const isToday = d === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear()

            cells.push(
              <div key={d} style={{
                minHeight: 64, padding: '4px 6px', borderRadius: 8,
                background: isToday ? 'rgba(0,194,255,0.08)' : 'transparent',
                border: isToday ? '1px solid rgba(0,194,255,0.25)' : '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? '#00C2FF' : 'var(--text-muted)' }}>{d}</span>
                {dayAppts.map((a, i) => (
                  <div key={i} style={{
                    fontSize: 10, marginTop: 2, padding: '2px 4px', borderRadius: 4,
                    background: a.status === 'confirmed' ? 'rgba(0,229,160,0.15)' : a.status === 'pending' ? 'rgba(255,214,10,0.15)' : 'rgba(162,89,255,0.15)',
                    color: a.status === 'confirmed' ? '#00E5A0' : a.status === 'pending' ? '#FFD60A' : '#A259FF',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {a.time} {a.client.split(' ')[0]}
                  </div>
                ))}
              </div>
            )
          }

          return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <button onClick={prevMonth} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>{'<'}</button>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{monthName}</span>
                <button onClick={nextMonth} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>{'>'}</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-faint)', paddingBottom: 4 }}>{d}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {cells}
              </div>
            </div>
          )
        })()}
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
