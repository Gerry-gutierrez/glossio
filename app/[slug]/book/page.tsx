'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

const HOW_HEARD = ['Instagram', 'Facebook', 'Google', 'TikTok', 'Friend / Family Referral', 'Saw the vehicle', 'Business Card', 'Other']
const TIMES = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']

const getDates = () => {
  const dates: Date[] = []
  for (let i = 1; i <= 14; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    dates.push(d)
  }
  return dates
}

const fmt = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
const fmtLong = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

type Service = { id: string; name: string; price: string; description: string; icon: string; color: string }

interface FormState {
  firstName: string; lastName: string; phone: string; email: string
  year: string; make: string; model: string; color: string
  date: Date | null; time: string
  howHeard: string; notes: string
}

const INITIAL_FORM: FormState = {
  firstName: '', lastName: '', phone: '', email: '',
  year: '', make: '', model: '', color: '',
  date: null, time: '',
  howHeard: '', notes: '',
}

function CheckSvg() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ArrowLeftSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function PhoneSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  )
}

function MailSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function InfoSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

function CarSvg() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17h14v-5l-2-5H7l-2 5v5z" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="16.5" cy="17.5" r="1.5" />
    </svg>
  )
}

function CalendarCheckSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M9 16l2 2 4-4" />
    </svg>
  )
}

export default function BookingFlowPage() {
  const params = useParams()
  const slug = params.slug as string
  const supabase = createClient()

  const [services, setServices] = useState<Service[]>([])
  const [detailerName, setDetailerName] = useState('')
  const [loadingData, setLoadingData] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [step, setStep] = useState(0)
  const [expandedService, setExpandedService] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const loadData = useCallback(async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, company_name')
      .eq('slug', slug)
      .single()

    if (!profile) { setLoadingData(false); return }

    setDetailerName(profile.company_name?.split(' ')[0] || 'Detailer')

    const { data: svcs } = await supabase
      .from('services')
      .select('id, name, description, price, icon, color')
      .eq('profile_id', profile.id)
      .eq('is_active', true)
      .order('sort_order')

    if (svcs) setServices(svcs.map(s => ({ ...s, price: String(s.price) })))
    setLoadingData(false)
  }, [supabase, slug])

  useEffect(() => { loadData() }, [loadData])

  const set = (key: keyof FormState) => (val: string | Date | null) =>
    setForm(f => ({ ...f, [key]: val }))

  const startBooking = (svc: Service) => {
    setSelectedService(svc)
    setStep(1)
  }

  const step1Valid = form.firstName.trim() && form.lastName.trim() && form.phone.trim() && form.email.trim()
  const step2Valid = form.year.trim() && form.make.trim() && form.model.trim() && form.color.trim()
  const step3Valid = form.date && form.time

  const resetFlow = () => {
    setStep(0)
    setSelectedService(null)
    setForm(INITIAL_FORM)
  }

  const submitBooking = async () => {
    if (!selectedService || !form.date) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          serviceId: selectedService.id,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          vehicleYear: form.year,
          vehicleMake: form.make,
          vehicleModel: form.model,
          vehicleColor: form.color,
          scheduledDate: form.date.toISOString().split('T')[0],
          scheduledTime: form.time,
          howHeard: form.howHeard,
          notes: form.notes,
          price: selectedService.price,
        }),
      })
      if (res.ok) {
        setStep(5)
      } else {
        const data = await res.json()
        setSubmitError(data.error || 'Failed to book appointment')
      }
    } catch {
      setSubmitError('Network error. Please try again.')
    }
    setSubmitting(false)
  }

  const STEP_LABELS = ['Your Info', 'Your Vehicle', 'Date & Time', 'Final Details']

  if (loadingData) {
    return <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading...</div>
  }

  if (!loadingData && services.length === 0) {
    return <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: 12 }}><h1 style={{ fontSize: 24, margin: 0 }}>No Services Available</h1><p style={{ margin: 0, color: 'var(--text-faint)' }}>This detailer hasn&apos;t added any services yet.</p></div>
  }

  // ── Confirmation Screen ──
  if (step === 5 && selectedService) {
    return (
      <div className={styles.confirmationScreen} style={{ fontFamily: 'var(--font-serif)', color: 'var(--text)' }}>
        <div className={styles.successIcon}>
          <CheckSvg />
        </div>

        <h1 className={styles.confirmTitle}>Booking Request Sent!</h1>
        <p className={styles.confirmSub}>
          {detailerName} will review your request and confirm within 24 hours. You&apos;ll get a text and email at:
        </p>

        <div className={styles.confirmCard}>
          <p className={styles.confirmName}>{form.firstName} {form.lastName}</p>
          <p className={styles.confirmContact}><PhoneSvg /> {form.phone}</p>
          <p className={styles.confirmContact}><MailSvg /> {form.email}</p>
          <div className={styles.confirmDivider}>
            <p className={styles.confirmService}>{selectedService.icon} {selectedService.name} — ${selectedService.price}</p>
            <p className={styles.confirmDate}>
              {form.date ? fmtLong(form.date) : ''} · {form.time}
            </p>
          </div>
        </div>

        <div className={styles.confirmInfo}>
          <p className={styles.confirmInfoText}>
            <InfoSvg />
            Once {detailerName} confirms, you&apos;ll receive a final text with all the details. No payment is due until the job is complete.
          </p>
        </div>

        <Link href={`/${slug}`} className={styles.backToProfileBtn}>
          <ArrowLeftSvg /> Back to Profile
        </Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-serif)', color: 'var(--text)' }}>

      {/* Top Bar */}
      <div className={styles.topBar}>
        <Link href={`/${slug}`} style={{ textDecoration: 'none' }}>
          <h2 className={styles.logo}>GlossIO</h2>
        </Link>
        {step > 0 && (
          <button onClick={() => step === 1 ? setStep(0) : setStep(s => s - 1)} className={styles.backBtn}>
            <ArrowLeftSvg /> Back
          </button>
        )}
      </div>

      {/* Step 0: Service Selection */}
      {step === 0 && (
        <div className={styles.containerWide}>
          <p className={styles.headerLabel}>{detailerName}</p>
          <h1 className={styles.pageTitle}>Book an Appointment</h1>
          <p className={styles.pageSubtitle}>Select a service to get started.</p>

          <div className={styles.serviceList}>
            {services.map(svc => {
              const isOpen = expandedService === svc.id
              return (
                <div
                  key={svc.id}
                  className={`${styles.serviceCard} ${isOpen ? styles.serviceCardExpanded : ''}`}
                  style={isOpen ? { background: `${svc.color}08`, borderColor: `${svc.color}44` } : undefined}
                >
                  <div className={styles.serviceRow} onClick={() => setExpandedService(isOpen ? null : svc.id)}>
                    <div className={styles.serviceIconBox} style={{ background: `${svc.color}15`, border: `1px solid ${svc.color}33` }}>
                      {svc.icon}
                    </div>
                    <div className={styles.serviceInfo}>
                      <p className={styles.serviceName}>{svc.name}</p>
                      <p className={`${styles.serviceDesc} ${!isOpen ? styles.serviceDescTruncated : ''}`}>{svc.description}</p>
                    </div>
                    <div className={styles.servicePriceCol}>
                      <p className={styles.servicePrice} style={{ color: svc.color }}>${svc.price}</p>
                      <span className={styles.expandArrow}>{isOpen ? '\u25B2' : '\u25BC'}</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className={styles.serviceExpanded} style={{ borderTop: `1px solid ${svc.color}22` }}>
                      <p className={styles.expandedLabel}>What&apos;s Included</p>
                      <p className={styles.expandedDesc}>{svc.description}</p>
                      <div className={styles.priceBox} style={{ background: `${svc.color}10`, border: `1px solid ${svc.color}22` }}>
                        <span className={styles.priceBoxLabel}>Starting at</span>
                        <span className={styles.priceBoxValue} style={{ color: svc.color }}>${svc.price}</span>
                      </div>
                      <button onClick={() => startBooking(svc)} className={styles.bookServiceBtn} style={{ background: svc.color }}>
                        Book {svc.name}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Steps 1-4 */}
      {step > 0 && step < 5 && selectedService && (
        <div className={styles.container}>

          {/* Service Chip */}
          <div className={styles.serviceChip} style={{ background: `${selectedService.color}15`, border: `1px solid ${selectedService.color}33` }}>
            <span>{selectedService.icon}</span>
            <span className={styles.serviceChipName} style={{ color: selectedService.color }}>{selectedService.name}</span>
            <span className={styles.serviceChipPrice}>· ${selectedService.price}</span>
          </div>

          {/* Progress */}
          <div className={styles.progressBar}>
            {STEP_LABELS.map((label, i) => (
              <div key={label} className={styles.progressStep}>
                <div
                  className={styles.progressTrack}
                  style={{
                    background: i < step ? selectedService.color : i === step - 1 ? selectedService.color : 'var(--border)',
                    opacity: i === step - 1 ? 1 : i < step ? 0.4 : 0.2,
                  }}
                />
                <p className={styles.progressLabel} style={{ color: i === step - 1 ? '#C8C4BC' : '#444' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Step 1: Your Info */}
          {step === 1 && (
            <div>
              <h2 className={styles.stepTitle}>Your Info</h2>
              <p className={styles.stepSub}>So {detailerName} knows who&apos;s coming in.</p>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>First Name<span className={styles.fieldRequired}>*</span></label>
                  <input className={`${styles.fieldInput} ${!form.firstName.trim() ? styles.fieldInputError : ''}`} value={form.firstName} onChange={e => set('firstName')(e.target.value)} placeholder="John" />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Last Name<span className={styles.fieldRequired}>*</span></label>
                  <input className={`${styles.fieldInput} ${!form.lastName.trim() ? styles.fieldInputError : ''}`} value={form.lastName} onChange={e => set('lastName')(e.target.value)} placeholder="Smith" />
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Phone Number<span className={styles.fieldRequired}>*</span></label>
                <input className={styles.fieldInput} type="tel" value={form.phone} onChange={e => set('phone')(e.target.value)} placeholder="(239) 555-0100" />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Email Address<span className={styles.fieldRequired}>*</span></label>
                <input className={styles.fieldInput} type="email" value={form.email} onChange={e => set('email')(e.target.value)} placeholder="john@email.com" />
              </div>
              <p className={styles.fieldHint}>
                <PhoneSvg /> {detailerName} will text and email your confirmation to these.
              </p>
              <button
                onClick={() => setStep(2)}
                disabled={!step1Valid}
                className={styles.nextBtn}
                style={{ background: step1Valid ? 'var(--primary)' : undefined }}
              >
                Next: Your Vehicle
              </button>
            </div>
          )}

          {/* Step 2: Vehicle */}
          {step === 2 && (
            <div>
              <h2 className={styles.stepTitle}>Your Vehicle</h2>
              <p className={styles.stepSub}>Tell {detailerName} what he&apos;ll be working on.</p>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Year<span className={styles.fieldRequired}>*</span></label>
                  <input className={styles.fieldInput} value={form.year} onChange={e => set('year')(e.target.value)} placeholder="2021" />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Color<span className={styles.fieldRequired}>*</span></label>
                  <input className={styles.fieldInput} value={form.color} onChange={e => set('color')(e.target.value)} placeholder="Pearl White" />
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Make<span className={styles.fieldRequired}>*</span></label>
                <input className={styles.fieldInput} value={form.make} onChange={e => set('make')(e.target.value)} placeholder="Toyota" />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Model<span className={styles.fieldRequired}>*</span></label>
                <input className={styles.fieldInput} value={form.model} onChange={e => set('model')(e.target.value)} placeholder="Camry" />
              </div>

              {form.year && form.make && form.model && (
                <div className={styles.vehiclePreview}>
                  <CarSvg />
                  <div>
                    <p className={styles.vehicleName}>{form.year} {form.make} {form.model}</p>
                    {form.color && <p className={styles.vehicleColor}>{form.color}</p>}
                  </div>
                </div>
              )}

              <button
                onClick={() => setStep(3)}
                disabled={!step2Valid}
                className={`${styles.nextBtn} ${!step2Valid ? styles.nextBtnDisabled : ''}`}
                style={step2Valid ? { background: 'var(--primary)' } : undefined}
              >
                Next: Pick a Date &amp; Time
              </button>
            </div>
          )}

          {/* Step 3: Date & Time */}
          {step === 3 && (
            <div>
              <h2 className={styles.stepTitle}>Pick a Date &amp; Time</h2>
              <p className={styles.stepSub}>Choose your preferred slot. {detailerName} will confirm within 24 hrs.</p>

              <label className={styles.fieldLabel}>Preferred Date<span className={styles.fieldRequired}>*</span></label>
              <div className={styles.dateScroll}>
                {getDates().map((d, i) => {
                  const sel = form.date && fmt(form.date) === fmt(d)
                  return (
                    <div
                      key={i}
                      onClick={() => set('date')(d)}
                      className={styles.dateCard}
                      style={{
                        background: sel ? selectedService.color : 'var(--bg-card)',
                        border: `1px solid ${sel ? selectedService.color : 'var(--border)'}`,
                      }}
                    >
                      <p className={styles.dateCardDay} style={{ color: sel ? 'var(--bg)' : 'var(--text-faint)' }}>
                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <p className={styles.dateCardNum} style={{ color: sel ? 'var(--bg)' : 'var(--text)' }}>
                        {d.getDate()}
                      </p>
                      <p className={styles.dateCardMonth} style={{ color: sel ? 'var(--bg)' : 'var(--text-faint)' }}>
                        {d.toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                    </div>
                  )
                })}
              </div>

              <label className={styles.fieldLabel}>Preferred Time<span className={styles.fieldRequired}>*</span></label>
              <div className={styles.timeGrid}>
                {TIMES.map(t => {
                  const sel = form.time === t
                  return (
                    <div
                      key={t}
                      onClick={() => set('time')(t)}
                      className={styles.timeSlot}
                      style={{
                        background: sel ? selectedService.color : 'var(--bg-card)',
                        border: `1px solid ${sel ? selectedService.color : 'var(--border)'}`,
                        fontWeight: sel ? 700 : 400,
                        color: sel ? 'var(--bg)' : '#C8C4BC',
                      }}
                    >
                      {t}
                    </div>
                  )
                })}
              </div>

              <button
                onClick={() => setStep(4)}
                disabled={!step3Valid}
                className={`${styles.nextBtn} ${!step3Valid ? styles.nextBtnDisabled : ''}`}
                style={step3Valid ? { background: 'var(--primary)' } : undefined}
              >
                Next: Final Details
              </button>
            </div>
          )}

          {/* Step 4: Final Details + Review */}
          {step === 4 && (
            <div>
              <h2 className={styles.stepTitle}>Almost Done!</h2>
              <p className={styles.stepSub}>One last thing — then review your booking.</p>

              <label className={styles.fieldLabel}>How did you hear about {detailerName}?</label>
              <div className={styles.howHeardGrid}>
                {HOW_HEARD.map(opt => {
                  const sel = form.howHeard === opt
                  return (
                    <div
                      key={opt}
                      onClick={() => set('howHeard')(opt)}
                      className={styles.howHeardOption}
                      style={{
                        background: sel ? 'rgba(0, 194, 255, 0.08)' : 'var(--bg-card)',
                        border: `1px solid ${sel ? 'rgba(0, 194, 255, 0.27)' : 'var(--border)'}`,
                        color: sel ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: sel ? 700 : 400,
                      }}
                    >
                      {opt}
                    </div>
                  )
                })}
              </div>

              <label className={styles.fieldLabel}>
                Additional Notes <span style={{ fontSize: 10, color: '#444', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <textarea
                className={styles.fieldTextarea}
                value={form.notes}
                onChange={e => set('notes')(e.target.value)}
                placeholder="Any special requests, damage to note, gate codes, etc."
                rows={3}
              />

              {/* Booking Summary */}
              <div className={styles.summaryCard}>
                <p className={styles.summaryLabel}>Booking Summary</p>
                {[
                  { label: 'Service', value: `${selectedService.icon} ${selectedService.name} — $${selectedService.price}` },
                  { label: 'Client', value: `${form.firstName} ${form.lastName}` },
                  { label: 'Contact', value: `${form.phone} · ${form.email}` },
                  { label: 'Vehicle', value: `${form.year} ${form.make} ${form.model} (${form.color})` },
                  { label: 'Date', value: form.date ? fmt(form.date) : '—' },
                  { label: 'Time', value: form.time || '—' },
                ].map(row => (
                  <div key={row.label} className={styles.summaryRow}>
                    <span className={styles.summaryRowKey}>{row.label}</span>
                    <span className={styles.summaryRowValue}>{row.value}</span>
                  </div>
                ))}
                <div className={styles.summaryTotal}>
                  <span className={styles.summaryTotalLabel}>Total</span>
                  <span className={styles.summaryTotalValue} style={{ color: selectedService.color }}>${selectedService.price}</span>
                </div>
              </div>

              {submitError && <p style={{ color: '#FF3366', fontSize: 13, marginBottom: 12 }}>{submitError}</p>}
              <button onClick={submitBooking} disabled={submitting} className={styles.confirmBtn}>
                <CalendarCheckSvg /> {submitting ? 'Submitting...' : 'Confirm Booking Request'}
              </button>
              <p className={styles.nextBtnHint}>{detailerName} will confirm within 24 hours via text &amp; email.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
