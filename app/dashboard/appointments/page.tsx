'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from './page.module.css'
import { createClient } from '@/lib/supabase/client'

interface Appointment {
  id: number; clientName: string; phone: string; email: string; vehicle: string
  service: string; serviceIcon: string; serviceColor: string; price: string
  date: string; time: string; status: 'pending' | 'confirmed' | 'complete' | 'cancelled'
  notes: string; isNew: boolean
}

const STATUS_STYLES: Record<string, { bg: string; border: string; color: string; label: string }> = {
  pending: { bg: 'rgba(255,214,10,0.08)', border: 'rgba(255,214,10,0.2)', color: '#FFD60A', label: 'Pending' },
  confirmed: { bg: 'rgba(0,194,255,0.08)', border: 'rgba(0,194,255,0.2)', color: '#00C2FF', label: 'Confirmed' },
  complete: { bg: 'rgba(0,229,160,0.08)', border: 'rgba(0,229,160,0.2)', color: '#00E5A0', label: 'Complete' },
  cancelled: { bg: 'rgba(255,51,102,0.08)', border: 'rgba(255,51,102,0.2)', color: '#FF3366', label: 'Cancelled' },
}

function CalendarSvg() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}

function ClockSvg() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
}

function CheckSvg() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
}

function DollarSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
}

function TrendingSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
}

const fmtMoney = (n: number) => `$${n.toFixed(2)}`

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState('all')

  const loadAppointments = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('appointments')
      .select('id, scheduled_date, scheduled_time, status, price, notes, clients(first_name, last_name, phone, email, vehicle_year, vehicle_make, vehicle_model, vehicle_color), services(name, icon, color)')
      .in('status', ['pending', 'confirmed'])
      .eq('profile_id', user.id)
      .order('scheduled_date', { ascending: true })

    if (data && data.length > 0) {
      setAppointments(data.map((a: Record<string, unknown>) => {
        const client = a.clients as Record<string, string> | null
        const service = a.services as Record<string, string> | null
        return {
          id: a.id as number,
          clientName: client ? `${client.first_name} ${client.last_name || ''}`.trim() : 'Unknown',
          phone: client?.phone || '',
          email: client?.email || '',
          vehicle: client ? [client.vehicle_year, client.vehicle_color, client.vehicle_make, client.vehicle_model].filter(Boolean).join(' ') : '',
          service: service?.name || 'Service',
          serviceIcon: service?.icon || '🔧',
          serviceColor: service?.color || '#00C2FF',
          price: String(a.price || '0'),
          date: a.scheduled_date as string,
          time: (a.scheduled_time as string) || '',
          status: (a.status as Appointment['status']) || 'pending',
          notes: (a.notes as string) || '',
          isNew: a.status === 'pending',
        }
      }))
    }
  }, [])

  useEffect(() => { loadAppointments() }, [loadAppointments])

  const deleteAppointment = async (id: number) => {
    if (!confirm('Delete this appointment? This cannot be undone.')) return
    setAppointments(prev => prev.filter(a => a.id !== id))
    const supabase = createClient()
    await supabase.from('appointments').delete().eq('id', id)
  }

  const updateStatus = async (id: number, status: 'pending' | 'confirmed' | 'complete' | 'cancelled') => {
    if (status === 'complete' || status === 'cancelled') {
      // Remove from the active appointments list
      setAppointments(prev => prev.filter(a => a.id !== id))
    } else {
      setAppointments(prev => prev.map(a =>
        a.id === id ? { ...a, status, isNew: false } : a
      ))
    }
    const supabase = createClient()
    await supabase.from('appointments').update({ status }).eq('id', id)
  }

  const counts = {
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
  }

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  // Revenue calculations
  const projectedThis = appointments.filter(a => a.status === 'confirmed').reduce((s, a) => s + parseFloat(a.price), 0)
  const projectedPending = appointments.filter(a => a.status === 'pending').reduce((s, a) => s + parseFloat(a.price), 0)

  return (
    <>
      <div className={styles.header}>
        <div>
          <p className={styles.headerLabel}>Detailer Dashboard</p>
          <h1 className={styles.headerTitle}>Appointments</h1>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className={styles.revenueGrid}>
        {[
          { label: 'Confirmed Revenue', value: projectedThis, color: 'var(--primary)', note: 'Confirmed · not yet complete', icon: <DollarSvg /> },
          { label: 'Pending Revenue', value: projectedPending, color: 'var(--secondary)', note: 'Awaiting confirmation', icon: <TrendingSvg /> },
        ].map(card => (
          <div key={card.label} className={styles.revenueCard} style={{ borderTop: `2px solid ${card.color}` }}>
            <p className={styles.revenueLabel}>{card.label}</p>
            <p className={styles.revenueValue} style={{ color: card.color }}>{fmtMoney(card.value)}</p>
            <p className={styles.revenueNote}>{card.note}</p>
          </div>
        ))}
      </div>

      {/* Status Summary */}
      <div className={styles.statusGrid}>
        {[
          { key: 'pending', label: 'Awaiting Confirm' },
          { key: 'confirmed', label: 'Confirmed' },
        ].map(s => {
          const st = STATUS_STYLES[s.key]
          const isActive = filter === s.key
          return (
            <div
              key={s.key}
              onClick={() => setFilter(filter === s.key ? 'all' : s.key)}
              className={styles.statusCard}
              style={{
                background: isActive ? st.bg : 'var(--bg-card)',
                border: `1px solid ${isActive ? st.border : 'var(--border)'}`,
                borderTop: `2px solid ${isActive ? st.color : 'var(--border)'}`,
              }}
            >
              <p className={styles.statusCount} style={{ color: st.color }}>{counts[s.key as keyof typeof counts]}</p>
              <p className={styles.statusLabel}>{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterRow}>
        {['all', 'pending', 'confirmed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
          >
            {f === 'all' ? `All (${appointments.length})` : `${f} (${counts[f as keyof typeof counts]})`}
          </button>
        ))}
      </div>

      {/* Appointment List */}
      <div className={styles.apptList}>
        {filtered.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <CalendarSvg />
            </div>
            <p className={styles.emptyText}>No appointments here yet.</p>
          </div>
        )}

        {filtered.map(appt => {
          const st = STATUS_STYLES[appt.status]
          return (
            <div
              key={appt.id}
              className={styles.apptCard}
              style={{
                borderLeft: `3px solid ${st.color}`,
                background: appt.isNew ? 'rgba(255,107,53,0.03)' : undefined,
                borderColor: appt.isNew ? 'rgba(255,107,53,0.2)' : undefined,
              }}
            >
              {/* Top row */}
              <div className={styles.apptTopRow}>
                <div>
                  <div className={styles.apptClientName}>
                    {appt.isNew && <span className={styles.newBadge}>NEW</span>}
                    {appt.clientName}
                  </div>
                  <p className={styles.apptServiceLine}>
                    {appt.serviceIcon} {appt.service} · <span className={styles.apptServicePrice} style={{ color: appt.serviceColor }}>${appt.price}</span>
                  </p>
                  <p className={styles.apptDateLine}>
                    <CalendarSvg /> {appt.date} · <ClockSvg /> {appt.time}
                  </p>
                </div>
                <span className={styles.apptStatusBadge} style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                  <span className={styles.statusDot} style={{ background: st.color }} />
                  {st.label}
                </span>
              </div>

              {/* Details */}
              <div className={styles.apptDetails}>
                <div className={styles.apptDetailRow}>
                  <span className={styles.apptDetailLabel}>Vehicle</span>
                  <span className={styles.apptDetailValue}>{appt.vehicle}</span>
                </div>
                <div className={styles.apptDetailRow}>
                  <span className={styles.apptDetailLabel}>Phone</span>
                  <span className={styles.apptDetailValue}>{appt.phone}</span>
                </div>
                <div className={styles.apptDetailRow}>
                  <span className={styles.apptDetailLabel}>Email</span>
                  <span className={styles.apptDetailValue}>{appt.email}</span>
                </div>
                {appt.notes && (
                  <div className={styles.apptDetailRow}>
                    <span className={styles.apptDetailLabel}>Notes</span>
                    <span className={styles.apptNotes}>{appt.notes}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className={styles.apptActions}>
                {appt.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(appt.id, 'confirmed')} className={`${styles.actionBtn} ${styles.confirmActionBtn}`}>
                      <CheckSvg /> Confirm
                    </button>
                    <button onClick={() => updateStatus(appt.id, 'cancelled')} className={`${styles.actionBtn} ${styles.cancelActionBtn}`}>
                      Cancel
                    </button>
                  </>
                )}
                {appt.status === 'confirmed' && (
                  <>
                    <button onClick={() => updateStatus(appt.id, 'complete')} className={`${styles.actionBtn} ${styles.completeActionBtn}`}>
                      <CheckSvg /> Mark Complete
                    </button>
                    <button onClick={() => updateStatus(appt.id, 'cancelled')} className={`${styles.actionBtn} ${styles.cancelActionBtn}`}>
                      Cancel
                    </button>
                  </>
                )}
                <button onClick={() => deleteAppointment(appt.id)} className={`${styles.actionBtn}`} style={{ background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.2)', color: '#FF3366' }}>
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
