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

type ServiceOption = { id: string; name: string; price: string; icon: string; color: string; pricing_type: 'fixed' | 'quote' }
type ClientOption = { id: string; first_name: string; last_name: string; phone: string; email: string; vehicle_year: string; vehicle_make: string; vehicle_model: string }

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

function PlusSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
}

function UsersSvg() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
}

function UserPlusSvg() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
}

function SearchSvg2() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
}

function CreateApptModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [step, setStep] = useState<'choose' | 'existing' | 'new'>('choose')
  const [clients, setClients] = useState<ClientOption[]>([])
  const [services, setServices] = useState<ServiceOption[]>([])
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null)
  const [selectedService, setSelectedService] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [apptNotes, setApptNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // New client fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [source, setSource] = useState('Instagram')

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [clientsRes, servicesRes] = await Promise.all([
        supabase.from('clients').select('id, first_name, last_name, phone, email, vehicle_year, vehicle_make, vehicle_model').eq('profile_id', user.id).order('created_at', { ascending: false }),
        supabase.from('services').select('id, name, price, icon, color, pricing_type').eq('profile_id', user.id).order('sort_order'),
      ])
      if (clientsRes.data) setClients(clientsRes.data)
      if (servicesRes.data) setServices(servicesRes.data.map(s => ({ ...s, price: String(s.price), pricing_type: (s.pricing_type || 'fixed') as 'fixed' | 'quote' })))
    }
    loadData()
  }, [])

  const filteredClients = clients.filter(c => {
    const q = search.toLowerCase()
    return `${c.first_name} ${c.last_name} ${c.phone} ${c.email}`.toLowerCase().includes(q)
  })

  const handleSubmit = async () => {
    if (!selectedService || !date || !time) { setError('Please select a service, date, and time.'); return }
    if (step === 'existing' && !selectedClient) { setError('Please select a client.'); return }
    if (step === 'new' && !firstName) { setError('Please enter the client\'s first name.'); return }
    if (step === 'new' && !phone) { setError('Please enter a phone number.'); return }

    setSubmitting(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); setSubmitting(false); return }
      const { data: profile } = await supabase.from('profiles').select('slug').eq('id', user.id).single()
      if (!profile?.slug) { setError('Profile not found'); setSubmitting(false); return }

      const svc = services.find(s => s.id === selectedService)
      const price = svc ? parseFloat(svc.price) || 0 : 0

      const body = step === 'existing' ? {
        slug: profile.slug, serviceId: selectedService,
        firstName: selectedClient!.first_name, lastName: selectedClient!.last_name,
        phone: selectedClient!.phone, email: selectedClient!.email,
        scheduledDate: date, scheduledTime: time, notes: apptNotes, price,
      } : {
        slug: profile.slug, serviceId: selectedService,
        firstName, lastName, phone, email,
        vehicleYear: vehicle.match(/^\d{4}/) ? vehicle.split(' ')[0] : '',
        vehicleMake: vehicle.match(/^\d{4}/) ? (vehicle.split(' ')[1] || '') : (vehicle.split(' ')[0] || ''),
        vehicleModel: vehicle.match(/^\d{4}/) ? vehicle.split(' ').slice(2).join(' ') : vehicle.split(' ').slice(1).join(' '),
        howHeard: source, scheduledDate: date, scheduledTime: time, notes: apptNotes, price,
      }

      const res = await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const result = await res.json()
      if (!res.ok) { setError(result.error || 'Failed to create appointment'); setSubmitting(false); return }
      onCreated()
    } catch {
      setError('Something went wrong.')
      setSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modalBox}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
            {step === 'choose' ? 'Create Appointment' : step === 'existing' ? 'Existing Client' : 'New Client'}
          </h2>
          <button onClick={onClose} className={styles.modalCloseBtn}>&times;</button>
        </div>

        {/* Step 1: Choose */}
        {step === 'choose' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <button onClick={() => setStep('existing')} className={styles.choiceCard}>
              <UsersSvg />
              <span style={{ fontSize: 15, fontWeight: 700 }}>Existing Client</span>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Pick from your client list</span>
            </button>
            <button onClick={() => setStep('new')} className={styles.choiceCard}>
              <UserPlusSvg />
              <span style={{ fontSize: 15, fontWeight: 700 }}>New Client</span>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Create a new client</span>
            </button>
          </div>
        )}

        {/* Step 2a: Existing client picker */}
        {step === 'existing' && !selectedClient && (
          <>
            <button onClick={() => setStep('choose')} className={styles.backLink}>&larr; Back</button>
            <div className={styles.clientSearchBox}>
              <SearchSvg2 />
              <input className={styles.clientSearchInput} placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className={styles.clientPickerList}>
              {filteredClients.length === 0 && <p style={{ color: 'var(--text-faint)', fontSize: 13, textAlign: 'center', padding: 20 }}>No clients found.</p>}
              {filteredClients.map(c => (
                <button key={c.id} onClick={() => setSelectedClient(c)} className={styles.clientPickerItem}>
                  <div className={styles.clientPickerAvatar}>{c.first_name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{c.first_name} {c.last_name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-dim)' }}>
                      {[c.vehicle_year, c.vehicle_make, c.vehicle_model].filter(Boolean).join(' ') || c.phone}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2b: New client form */}
        {step === 'new' && (
          <>
            <button onClick={() => setStep('choose')} className={styles.backLink}>&larr; Back</button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <p className={styles.fieldLabel}>First Name</p>
                <input className={styles.modalInput} placeholder="e.g. Marcus" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div>
                <p className={styles.fieldLabel}>Last Name</p>
                <input className={styles.modalInput} placeholder="e.g. T." value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div>
                <p className={styles.fieldLabel}>Phone</p>
                <input className={styles.modalInput} placeholder="(239) 555-0101" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div>
                <p className={styles.fieldLabel}>Email</p>
                <input className={styles.modalInput} placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <p className={styles.fieldLabel} style={{ marginTop: 12 }}>Vehicle</p>
            <input className={styles.modalInput} placeholder="e.g. 2021 BMW M3" value={vehicle} onChange={e => setVehicle(e.target.value)} />
            <p className={styles.fieldLabel} style={{ marginTop: 12 }}>Source</p>
            <select className={styles.modalInput} value={source} onChange={e => setSource(e.target.value)} style={{ cursor: 'pointer' }}>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="Facebook">Facebook</option>
              <option value="Word of Mouth">Word of Mouth</option>
              <option value="Google">Google</option>
              <option value="Other">Other</option>
            </select>
          </>
        )}

        {/* Schedule section — shown after client is selected or for new client */}
        {((step === 'existing' && selectedClient) || step === 'new') && (
          <>
            {step === 'existing' && selectedClient && (
              <>
                <button onClick={() => setSelectedClient(null)} className={styles.backLink}>&larr; Pick different client</button>
                <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--text-dim)' }}>
                  For <strong style={{ color: 'var(--text)' }}>{selectedClient.first_name} {selectedClient.last_name}</strong>
                  {selectedClient.phone && <> &middot; {selectedClient.phone}</>}
                </p>
              </>
            )}

            {step === 'new' && <div style={{ borderTop: '1px solid var(--border)', margin: '20px 0', paddingTop: 20 }}><p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>Appointment Details</p></div>}

            {services.length === 0 ? (
              <p style={{ color: 'var(--gold)', fontSize: 13 }}>No services found. Add services in the Services tab first.</p>
            ) : (
              <>
                <p className={styles.fieldLabel}>Service</p>
                <div className={styles.serviceGrid}>
                  {services.map(svc => (
                    <button key={svc.id} onClick={() => setSelectedService(svc.id)}
                      className={`${styles.serviceOption} ${selectedService === svc.id ? styles.serviceOptionActive : ''}`}
                      style={{ borderColor: selectedService === svc.id ? svc.color : undefined }}>
                      <span style={{ fontSize: 20 }}>{svc.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{svc.name}</span>
                      <span style={{ fontSize: 12, color: svc.color }}>{svc.pricing_type === 'quote' ? 'Quote' : `$${svc.price}`}</span>
                    </button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                  <div>
                    <p className={styles.fieldLabel}>Date</p>
                    <input type="date" className={styles.modalInput} value={date} onChange={e => setDate(e.target.value)} min={today} />
                  </div>
                  <div>
                    <p className={styles.fieldLabel}>Time</p>
                    <input type="time" className={styles.modalInput} value={time} onChange={e => setTime(e.target.value)} />
                  </div>
                </div>

                <p className={styles.fieldLabel} style={{ marginTop: 16 }}>Notes (optional)</p>
                <textarea className={styles.modalInput} style={{ height: 60, resize: 'vertical' }} value={apptNotes} onChange={e => setApptNotes(e.target.value)} placeholder="Any notes..." />
              </>
            )}

            {error && <p style={{ color: '#FF3366', fontSize: 13, margin: '12px 0 0' }}>{error}</p>}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={onClose} className={styles.modalCancelBtn}>Cancel</button>
              <button onClick={handleSubmit} disabled={submitting || services.length === 0} className={styles.modalSubmitBtn}>
                {submitting ? 'Creating...' : step === 'new' ? 'Add Client & Schedule' : 'Schedule Appointment'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const fmtMoney = (n: number) => `$${n.toFixed(2)}`

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)

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
      {showCreate && (
        <CreateApptModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadAppointments() }}
        />
      )}
      <div className={styles.header}>
        <div>
          <p className={styles.headerLabel}>Detailer Dashboard</p>
          <h1 className={styles.headerTitle}>Appointments</h1>
        </div>
        <button onClick={() => setShowCreate(true)} className={styles.createApptBtn}>
          <PlusSvg /> Create Appointment
        </button>
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
