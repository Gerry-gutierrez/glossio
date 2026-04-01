'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from './page.module.css'
import { createClient } from '@/lib/supabase/client'

type HistoryItem = { date: string; service: string; price: number; status: 'pending' | 'confirmed' | 'complete' }

type Client = {
  id: string | number; firstName: string; lastName: string; phone: string; email: string
  vehicle: string; source: string; since: string; lastVisit: string
  totalSpent: number; visits: number; status: 'active' | 'never_came'
  notes: string; history: HistoryItem[]
}

type ServiceOption = { id: string; name: string; price: string; icon: string; color: string; pricing_type: 'fixed' | 'quote' }

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  pending: { color: '#FFD60A', bg: '#FFD60A15', border: '#FFD60A33', label: 'Pending' },
  confirmed: { color: '#00C2FF', bg: '#00C2FF15', border: '#00C2FF33', label: 'Confirmed' },
  complete: { color: '#00E5A0', bg: '#00E5A015', border: '#00E5A033', label: 'Complete' },
}

const fmtMoney = (n: number) => `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'az', label: 'A \u2192 Z' },
  { value: 'za', label: 'Z \u2192 A' },
  { value: 'most_spent', label: 'Top Spenders' },
  { value: 'most_visits', label: 'Most Visits' },
]

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Clients' },
  { value: 'active', label: 'Came Through' },
  { value: 'never_came', label: 'Never Came' },
]

function SearchSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function UsersSvg() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function CheckCircleSvg() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function ClockSvg() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function DollarSvg() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function PhoneSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
}

function MailSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
}

function CarSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h14v-5l-2-5H7l-2 5v5z" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="16.5" cy="17.5" r="1.5" /></svg>
}

function MegaphoneSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
}

function ArrowLeftSvg() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
}

function CalendarPlusSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="12" y1="14" x2="12" y2="18" /><line x1="10" y1="16" x2="14" y2="16" /></svg>
}

function ScheduleModal({ client, onClose, onCreated }: { client: Client; onClose: () => void; onCreated: () => void }) {
  const [services, setServices] = useState<ServiceOption[]>([])
  const [selectedService, setSelectedService] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [apptNotes, setApptNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadServices() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('services')
        .select('id, name, price, icon, color, pricing_type')
        .eq('profile_id', user.id)
        .order('sort_order')
      if (data) setServices(data.map(s => ({ ...s, price: String(s.price), pricing_type: (s.pricing_type || 'fixed') as 'fixed' | 'quote' })))
    }
    loadServices()
  }, [])

  const handleSubmit = async () => {
    if (!selectedService || !date || !time) {
      setError('Please select a service, date, and time.')
      return
    }
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

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: profile.slug,
          serviceId: selectedService,
          firstName: client.firstName,
          lastName: client.lastName,
          phone: client.phone,
          email: client.email,
          scheduledDate: date,
          scheduledTime: time,
          notes: apptNotes,
          price,
        }),
      })
      const result = await res.json()
      if (!res.ok) { setError(result.error || 'Failed to create appointment'); setSubmitting(false); return }
      onCreated()
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modalBox}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Schedule Appointment</h2>
          <button onClick={onClose} className={styles.modalCloseBtn}>&times;</button>
        </div>

        <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--text-dim)' }}>
          For <strong style={{ color: 'var(--text)' }}>{client.firstName} {client.lastName}</strong>
          {client.vehicle && <> &middot; {client.vehicle}</>}
        </p>

        {services.length === 0 ? (
          <p style={{ color: 'var(--gold)', fontSize: 13 }}>No services found. Add services in the Services tab first.</p>
        ) : (
          <>
            <p className={styles.fieldLabel}>Service</p>
            <div className={styles.serviceGrid}>
              {services.map(svc => (
                <button
                  key={svc.id}
                  onClick={() => setSelectedService(svc.id)}
                  className={`${styles.serviceOption} ${selectedService === svc.id ? styles.serviceOptionActive : ''}`}
                  style={{ borderColor: selectedService === svc.id ? svc.color : undefined }}
                >
                  <span style={{ fontSize: 20 }}>{svc.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{svc.name}</span>
                  <span style={{ fontSize: 12, color: svc.color }}>
                    {svc.pricing_type === 'quote' ? 'Quote' : `$${svc.price}`}
                  </span>
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
            <textarea
              className={styles.modalInput}
              style={{ height: 60, resize: 'vertical' }}
              value={apptNotes}
              onChange={e => setApptNotes(e.target.value)}
              placeholder="Any notes for this appointment..."
            />
          </>
        )}

        {error && <p style={{ color: '#FF3366', fontSize: 13, margin: '12px 0 0' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} className={styles.modalCancelBtn}>Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={submitting || services.length === 0}
            className={styles.modalSubmitBtn}
          >
            {submitting ? 'Scheduling...' : 'Schedule Appointment'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ClientDetail({ client, onBack, onDelete, onRefresh }: { client: Client; onBack: () => void; onDelete: (id: string | number) => void; onRefresh: () => void }) {
  const [notes, setNotes] = useState(client.notes)
  const [saved, setSaved] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)

  const saveNotes = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      {showSchedule && (
        <ScheduleModal
          client={client}
          onClose={() => setShowSchedule(false)}
          onCreated={() => { setShowSchedule(false); onRefresh() }}
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} className={styles.detailBackBtn}>
          <ArrowLeftSvg /> Back to Clients
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowSchedule(true)}
            style={{ padding: '6px 14px', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer', background: 'linear-gradient(135deg, rgba(0,194,255,0.12), rgba(162,89,255,0.12))', border: '1px solid rgba(0,194,255,0.25)', color: '#00C2FF', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <CalendarPlusSvg /> Schedule Appointment
          </button>
          <button
            onClick={() => onDelete(client.id)}
            style={{ padding: '6px 14px', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer', background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.2)', color: '#FF3366' }}
          >
            Delete Client
          </button>
        </div>
      </div>

      <div className={styles.detailGrid}>
        {/* Left */}
        <div>
          <div className={styles.detailCard}>
            <div className={styles.detailHeaderRow}>
              <div className={styles.detailAvatar}>{client.firstName[0]}</div>
              <div>
                <h2 className={styles.detailName}>{client.firstName} {client.lastName}</h2>
                <p className={styles.detailSince}>Client since {client.since}</p>
              </div>
            </div>
            {[
              { icon: <PhoneSvg />, label: 'Phone', value: client.phone },
              { icon: <MailSvg />, label: 'Email', value: client.email },
              { icon: <CarSvg />, label: 'Vehicle', value: client.vehicle },
              { icon: <MegaphoneSvg />, label: 'Found via', value: client.source },
            ].map(f => (
              <div key={f.label} className={styles.detailField}>
                {f.icon}
                <div>
                  <p className={styles.detailFieldLabel}>{f.label}</p>
                  <p className={styles.detailFieldValue}>{f.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.detailStatGrid}>
            {[
              { label: 'Total Visits', value: client.visits, color: 'var(--primary)' },
              { label: 'Total Spent', value: fmtMoney(client.totalSpent), color: 'var(--success)' },
            ].map(s => (
              <div key={s.label} className={styles.detailStatCard} style={{ borderTop: `2px solid ${s.color}` }}>
                <p className={styles.detailStatValue} style={{ color: s.color }}>{s.value}</p>
                <p className={styles.detailStatLabel}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div>
          <div className={styles.detailCard}>
            <h3 className={styles.historyTitle}>Service History</h3>
            {client.history.length === 0 ? (
              <p className={styles.historyEmpty}>No services yet.</p>
            ) : client.history.map((h, i) => {
              const cfg = STATUS_CONFIG[h.status] || STATUS_CONFIG.complete
              return (
                <div key={i} className={styles.historyItem} style={{ borderBottom: i < client.history.length - 1 ? '1px solid #1A1A2A' : 'none' }}>
                  <div>
                    <p className={styles.historyServiceName}>{h.service}</p>
                    <p className={styles.historyDate}>{h.date}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className={styles.historyPrice}>{fmtMoney(h.price)}</p>
                    <span className={styles.historyBadge} style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className={styles.detailCard}>
            <h3 className={styles.notesTitle}>Notes</h3>
            <textarea
              className={styles.notesTextarea}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add notes about this client..."
              rows={4}
            />
            <button onClick={saveNotes} className={styles.saveNotesBtn}>
              {saved ? '\u2713 Saved!' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [filterBy, setFilterBy] = useState('all')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clients, setClients] = useState<Client[]>([])

  const loadClients = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Load clients with their appointment history
    const { data: clientsData } = await supabase
      .from('clients')
      .select('id, first_name, last_name, phone, email, vehicle_year, vehicle_make, vehicle_model, vehicle_color, source, notes, created_at')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })

    if (clientsData && clientsData.length > 0) {
      // Load appointments for all clients
      const clientIds = clientsData.map(c => c.id)
      const { data: allAppts } = await supabase
        .from('appointments')
        .select('id, client_id, scheduled_date, scheduled_time, status, price, services(name)')
        .in('client_id', clientIds)
        .order('scheduled_date', { ascending: false })

      setClients(clientsData.map(c => {
        const appts = (allAppts || []).filter((a: Record<string, unknown>) => a.client_id === c.id)
        const completed = appts.filter((a: Record<string, unknown>) => a.status === 'complete')
        const totalSpent = completed.reduce((s: number, a: Record<string, unknown>) => s + ((a.price as number) || 0), 0)
        const lastComplete = completed[0] as Record<string, unknown> | undefined
        const created = new Date(c.created_at)
        const sinceStr = created.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

        return {
          id: c.id,
          firstName: c.first_name,
          lastName: c.last_name || '',
          phone: c.phone || '',
          email: c.email || '',
          vehicle: [c.vehicle_year, c.vehicle_color, c.vehicle_make, c.vehicle_model].filter(Boolean).join(' ') || '',
          source: c.source || 'Direct',
          since: sinceStr,
          lastVisit: lastComplete ? (lastComplete.scheduled_date as string) : '\u2014',
          totalSpent,
          visits: completed.length,
          status: completed.length > 0 ? 'active' as const : 'never_came' as const,
          notes: c.notes || '',
          history: appts.map((a: Record<string, unknown>) => {
            const svc = a.services as Record<string, string> | null
            return {
              date: a.scheduled_date as string,
              service: svc?.name || 'Service',
              price: (a.price as number) || 0,
              status: (a.status as HistoryItem['status']) || 'pending',
            }
          }),
        }
      }))
    }
  }, [])

  const deleteClient = async (id: string | number) => {
    if (!confirm('Delete this client and all their appointments? This cannot be undone.')) return
    setClients(prev => prev.filter(c => c.id !== id))
    setSelectedClient(null)
    const supabase = createClient()
    // Appointments cascade-delete via FK, so just delete the client
    await supabase.from('clients').delete().eq('id', id)
  }

  useEffect(() => { loadClients() }, [loadClients])
  const activeCount = clients.filter(c => c.status === 'active').length
  const neverCount = clients.filter(c => c.status === 'never_came').length
  const totalRevenue = clients.reduce((s, c) => s + c.totalSpent, 0)

  const filtered = clients
    .filter(c => {
      const matchSearch = `${c.firstName} ${c.lastName} ${c.vehicle} ${c.email} ${c.source}`
        .toLowerCase().includes(search.toLowerCase())
      const matchFilter = filterBy === 'all' || c.status === filterBy
      return matchSearch && matchFilter
    })
    .sort((a, b) => {
      if (sortBy === 'az') return a.firstName.localeCompare(b.firstName)
      if (sortBy === 'za') return b.firstName.localeCompare(a.firstName)
      if (sortBy === 'most_spent') return b.totalSpent - a.totalSpent
      if (sortBy === 'most_visits') return b.visits - a.visits
      return String(b.id).localeCompare(String(a.id))
    })

  if (selectedClient) {
    return <ClientDetail client={selectedClient} onBack={() => setSelectedClient(null)} onDelete={deleteClient} onRefresh={() => { setSelectedClient(null); loadClients() }} />
  }

  return (
    <>
      <div className={styles.header}>
        <p className={styles.headerLabel}>CRM</p>
        <h1 className={styles.headerTitle}>Your Clients</h1>
      </div>

      {/* Stats */}
      <div className={styles.statGrid}>
        {[
          { label: 'Total Clients', value: clients.length, color: 'var(--primary)', icon: <UsersSvg /> },
          { label: 'Came Through', value: activeCount, color: 'var(--success)', icon: <CheckCircleSvg /> },
          { label: 'Never Came', value: neverCount, color: 'var(--gold)', icon: <ClockSvg /> },
          { label: 'Total Revenue', value: fmtMoney(totalRevenue), color: 'var(--secondary)', icon: <DollarSvg /> },
        ].map(s => (
          <div key={s.label} className={styles.statCard} style={{ borderTop: `2px solid ${s.color}` }}>
            <div className={styles.statIcon}>{s.icon}</div>
            <p className={styles.statValue} style={{ color: s.color }}>{s.value}</p>
            <p className={styles.statLabel}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <SearchSvg />
          <input
            className={styles.searchInput}
            placeholder="Search by name, vehicle, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className={styles.searchClear}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className={styles.divider} />

        <div className={styles.filterGroup}>
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilterBy(opt.value)}
              className={`${styles.filterBtn} ${filterBy === opt.value ? styles.filterBtnActive : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className={styles.divider} />

        <div className={styles.sortGroup}>
          <span className={styles.sortLabel}>Sort by</span>
          <select className={styles.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <span className={styles.resultCount}>{filtered.length} of {clients.length} clients</span>
      </div>

      {/* Client List */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><SearchSvg /></div>
          <p className={styles.emptyText}>No clients match your search.</p>
        </div>
      ) : (
        <div className={styles.clientList}>
          {filtered.map(client => (
            <div
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className={styles.clientRow}
              style={{ borderLeft: `3px solid ${client.status === 'active' ? 'var(--success)' : 'var(--gold)'}` }}
            >
              <div
                className={styles.clientAvatar}
                style={{
                  background: client.status === 'active' ? 'linear-gradient(135deg, rgba(0,229,160,0.13), rgba(0,194,255,0.13))' : 'linear-gradient(135deg, rgba(255,214,10,0.13), rgba(255,107,53,0.13))',
                  border: `1.5px solid ${client.status === 'active' ? 'rgba(0,229,160,0.2)' : 'rgba(255,214,10,0.2)'}`,
                  color: client.status === 'active' ? 'var(--success)' : 'var(--gold)',
                }}
              >
                {client.firstName[0]}
              </div>

              <div className={styles.clientInfo}>
                <div className={styles.clientNameRow}>
                  <p className={styles.clientName}>{client.firstName} {client.lastName}</p>
                  <span
                    className={styles.clientBadge}
                    style={{
                      background: client.status === 'active' ? 'rgba(0,229,160,0.08)' : 'rgba(255,214,10,0.08)',
                      color: client.status === 'active' ? 'var(--success)' : 'var(--gold)',
                      border: `1px solid ${client.status === 'active' ? 'rgba(0,229,160,0.2)' : 'rgba(255,214,10,0.2)'}`,
                    }}
                  >
                    {client.status === 'active' ? 'Came Through' : 'Never Came'}
                  </span>
                </div>
                <p className={styles.clientMeta}>{client.vehicle} · via {client.source}</p>
              </div>

              <div className={styles.clientStats}>
                <div className={styles.clientStatItem}>
                  <p className={styles.clientStatValue} style={{ color: 'var(--primary)' }}>{client.visits}</p>
                  <p className={styles.clientStatLabel}>Visits</p>
                </div>
                <div className={styles.clientStatItem}>
                  <p className={styles.clientStatValue} style={{ color: 'var(--success)' }}>{fmtMoney(client.totalSpent)}</p>
                  <p className={styles.clientStatLabel}>Spent</p>
                </div>
                <div className={styles.clientStatItem}>
                  <p className={styles.clientStatValue} style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>{client.lastVisit}</p>
                  <p className={styles.clientStatLabel}>Last Visit</p>
                </div>
              </div>

              <span className={styles.clientArrow}>\u203A</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
