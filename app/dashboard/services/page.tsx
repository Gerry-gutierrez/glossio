'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

const ICON_OPTIONS = ['🚗', '💧', '✨', '🔧', '🪑', '🧼', '💎', '🏆', '⚡', '🌟', '🛞', '🪣', '🎯', '🔥', '🌊']
const COLOR_OPTIONS = ['#00C2FF', '#FF6B35', '#A259FF', '#FFD60A', '#00E5A0', '#FF3366', '#FF9F1C', '#2EC4B6']

type Service = { id: string; name: string; price: string; description: string; icon: string; color: string; sort_order: number }

export default function ServicesPage() {
  const supabase = createClient()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Service>>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [newService, setNewService] = useState({ name: '', price: '', description: '', icon: '🚗', color: '#00C2FF' })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadServices = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('services')
      .select('id, name, description, price, icon, color, sort_order')
      .eq('profile_id', user.id)
      .order('sort_order')

    if (data) {
      const mapped = data.map(s => ({ ...s, price: String(s.price) }))
      setServices(mapped)
      if (mapped.length > 0 && !activeTab) setActiveTab(mapped[0].id)
    }
    setLoading(false)
  }, [supabase, activeTab])

  useEffect(() => { loadServices() }, [loadServices])

  const active = services.find(s => s.id === activeTab) || services[0]

  const startEdit = (svc: Service) => {
    setEditingId(svc.id)
    setEditData({ name: svc.name, price: svc.price, description: svc.description, icon: svc.icon, color: svc.color })
  }

  const saveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    const { error } = await supabase
      .from('services')
      .update({
        name: editData.name,
        price: parseFloat(editData.price || '0'),
        description: editData.description,
        icon: editData.icon,
        color: editData.color,
      })
      .eq('id', editingId)

    if (!error) {
      setServices(services.map(s => s.id === editingId ? { ...s, ...editData } as Service : s))
      setEditingId(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  const cancelEdit = () => setEditingId(null)

  const confirmDelete = async (id: string) => {
    setSaving(true)
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (!error) {
      const remaining = services.filter(s => s.id !== id)
      setServices(remaining)
      setDeleteConfirm(null)
      if (remaining.length > 0) setActiveTab(remaining[0].id)
      else setActiveTab(null)
    }
    setSaving(false)
  }

  const addService = async () => {
    if (!newService.name.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { data, error } = await supabase
      .from('services')
      .insert({
        profile_id: user.id,
        name: newService.name,
        price: parseFloat(newService.price || '0'),
        description: newService.description,
        icon: newService.icon,
        color: newService.color,
        sort_order: services.length,
      })
      .select()
      .single()

    if (!error && data) {
      const svc = { ...data, price: String(data.price) }
      setServices([...services, svc])
      setActiveTab(svc.id)
      setShowAddModal(false)
      setNewService({ name: '', price: '', description: '', icon: '🚗', color: '#00C2FF' })
    }
    setSaving(false)
  }

  const prices = services.map(s => parseFloat(s.price)).filter(p => !isNaN(p))

  if (loading) {
    return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Loading services...</div>
  }

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className={styles.headerLabel}>Detailer Dashboard</p>
          <h1 className={styles.headerTitle}>My Services</h1>
        </div>
        <div className={styles.headerActions}>
          {saved && <span className={styles.savedMsg}>✓ Changes Saved!</span>}
          <button onClick={() => setShowAddModal(true)} className={styles.addBtn}>
            + Add Service
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className={styles.infoBanner}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <p className={styles.infoText}>
          These are the services your clients see on your public profile. Keep them updated so clients know exactly what you offer.
        </p>
      </div>

      {/* Stats */}
      <div className={styles.statRow}>
        {[
          { label: 'Total Services', value: `${services.length}`, color: '#00C2FF' },
          { label: 'Starting From', value: prices.length > 0 ? `$${Math.min(...prices).toFixed(2)}` : '$0.00', color: '#00E5A0' },
          { label: 'Up To', value: prices.length > 0 ? `$${Math.max(...prices).toFixed(2)}` : '$0.00', color: '#A259FF' },
        ].map(s => (
          <div key={s.label} className={styles.statCard}>
            <p className={styles.statValue} style={{ color: s.color }}>{s.value}</p>
            <p className={styles.statLabel}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Service Card with Tabs */}
      {services.length > 0 ? (
        <div className={styles.serviceCard}>
          {/* Tabs */}
          <div className={styles.tabsRow}>
            {services.map(svc => (
              <button
                key={svc.id}
                onClick={() => { setActiveTab(svc.id); setEditingId(null) }}
                className={`${styles.tabBtn} ${activeTab === svc.id ? styles.tabBtnActive : styles.tabBtnInactive}`}
                style={activeTab === svc.id ? { borderBottomColor: svc.color } : undefined}
              >
                <span>{svc.icon}</span>
                <span>{svc.name}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          {active && (
            <div className={styles.serviceContent}>
              {editingId === active.id ? (
                /* ── EDIT MODE ── */
                <div>
                  <p className={styles.headerLabel} style={{ marginBottom: 24 }}>Editing — {active.name}</p>

                  <p className={styles.editLabel}>Choose Icon</p>
                  <div className={styles.iconPicker}>
                    {ICON_OPTIONS.map(ic => (
                      <button
                        key={ic}
                        onClick={() => setEditData({ ...editData, icon: ic })}
                        className={`${styles.iconBtn} ${editData.icon === ic ? styles.iconBtnSelected : styles.iconBtnDefault}`}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>

                  <p className={styles.editLabel}>Accent Color</p>
                  <div className={styles.colorPicker}>
                    {COLOR_OPTIONS.map(c => (
                      <button
                        key={c}
                        onClick={() => setEditData({ ...editData, color: c })}
                        className={styles.colorBtn}
                        style={{ background: c, border: editData.color === c ? '3px solid #fff' : '3px solid transparent' }}
                      />
                    ))}
                  </div>

                  <div className={styles.editRow}>
                    <div>
                      <p className={styles.editLabel}>Service Name</p>
                      <input
                        className={styles.editInput}
                        value={editData.name || ''}
                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <p className={styles.editLabel}>Price ($)</p>
                      <input
                        className={styles.editInput}
                        value={editData.price || ''}
                        onChange={e => setEditData({ ...editData, price: e.target.value })}
                      />
                    </div>
                  </div>

                  <p className={styles.editLabel}>Description</p>
                  <textarea
                    className={styles.editTextarea}
                    value={editData.description || ''}
                    onChange={e => setEditData({ ...editData, description: e.target.value })}
                  />

                  <div className={styles.btnRow}>
                    <button onClick={saveEdit} disabled={saving} className={styles.primaryBtn}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button onClick={cancelEdit} className={styles.ghostBtn}>Cancel</button>
                  </div>
                </div>
              ) : (
                /* ── VIEW MODE ── */
                <div>
                  <div className={styles.serviceHeader}>
                    <div className={styles.serviceInfo}>
                      <div
                        className={styles.serviceIcon}
                        style={{ background: `${active.color}18`, border: `1.5px solid ${active.color}44` }}
                      >
                        {active.icon}
                      </div>
                      <div>
                        <h2 className={styles.serviceName}>{active.name}</h2>
                        <p className={styles.servicePrice} style={{ color: active.color }}>${active.price}</p>
                      </div>
                    </div>
                    <div className={styles.serviceActions}>
                      <button onClick={() => startEdit(active)} className={styles.editBtn}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        Edit
                      </button>
                      <button onClick={() => setDeleteConfirm(active.id)} className={styles.removeBtn}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className={styles.descBox}>
                    <p className={styles.descLabel}>What&apos;s Included</p>
                    <p className={styles.descText}>{active.description}</p>
                  </div>

                  <div className={styles.priceDivider}>
                    <div className={styles.priceLine} />
                    <span className={styles.priceLabel}>Starting At</span>
                    <div className={styles.priceLine} />
                  </div>
                  <p className={styles.priceDisplay} style={{ color: active.color }}>${active.price}</p>
                  <p className={styles.priceNote}>This is what clients see on your public profile</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ── EMPTY STATE ── */
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A259FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <h3 className={styles.emptyTitle}>No services yet</h3>
          <p className={styles.emptySub}>Add your first service so clients know what you offer.</p>
          <button onClick={() => setShowAddModal(true)} className={styles.primaryBtn}>
            + Add Your First Service
          </button>
        </div>
      )}

      {/* ── ADD SERVICE MODAL ── */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add New Service</h2>
              <button onClick={() => setShowAddModal(false)} className={styles.closeBtn}>✕</button>
            </div>

            <p className={styles.editLabel}>Choose Icon</p>
            <div className={styles.iconPicker}>
              {ICON_OPTIONS.map(ic => (
                <button
                  key={ic}
                  onClick={() => setNewService({ ...newService, icon: ic })}
                  className={`${styles.iconBtn} ${newService.icon === ic ? styles.iconBtnSelected : styles.iconBtnDefault}`}
                >
                  {ic}
                </button>
              ))}
            </div>

            <p className={styles.editLabel}>Accent Color</p>
            <div className={styles.colorPicker}>
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewService({ ...newService, color: c })}
                  className={styles.colorBtn}
                  style={{ background: c, border: newService.color === c ? '3px solid #fff' : '3px solid transparent' }}
                />
              ))}
            </div>

            <p className={styles.editLabel}>Service Name</p>
            <input
              className={styles.editInput}
              value={newService.name}
              onChange={e => setNewService({ ...newService, name: e.target.value })}
              placeholder="e.g. Ceramic Coating"
            />

            <p className={styles.editLabel}>Price ($)</p>
            <input
              className={styles.editInput}
              value={newService.price}
              onChange={e => setNewService({ ...newService, price: e.target.value })}
              placeholder="e.g. 199.99"
            />

            <p className={styles.editLabel}>Description</p>
            <textarea
              className={styles.editTextarea}
              value={newService.description}
              onChange={e => setNewService({ ...newService, description: e.target.value })}
              placeholder="What's included in this service?"
            />

            {/* Live Preview */}
            {newService.name && (
              <div className={styles.preview} style={{ borderColor: `${newService.color}33` }}>
                <p className={styles.previewLabel}>Preview</p>
                <div className={styles.previewRow}>
                  <span className={styles.previewIcon}>{newService.icon}</span>
                  <div>
                    <p className={styles.previewName}>{newService.name}</p>
                    {newService.price && <p className={styles.previewPrice} style={{ color: newService.color }}>${newService.price}</p>}
                  </div>
                </div>
              </div>
            )}

            <div className={styles.btnRow}>
              <button onClick={() => setShowAddModal(false)} className={styles.ghostBtn}>Cancel</button>
              <button
                onClick={addService}
                disabled={!newService.name.trim() || saving}
                className={styles.primaryBtn}
                style={{ flex: 1, opacity: newService.name.trim() && !saving ? 1 : 0.4, cursor: newService.name.trim() && !saving ? 'pointer' : 'not-allowed' }}
              >
                {saving ? 'Adding...' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <div className={styles.deleteIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF3366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h3 className={styles.deleteTitle}>Remove this service?</h3>
            <p className={styles.deleteSub}>
              Clients will no longer see this on your public profile. This can&apos;t be undone.
            </p>
            <div className={styles.deleteBtnRow}>
              <button onClick={() => confirmDelete(deleteConfirm)} disabled={saving} className={styles.deleteBtn}>
                {saving ? 'Removing...' : 'Yes, Remove It'}
              </button>
              <button onClick={() => setDeleteConfirm(null)} className={styles.ghostBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
