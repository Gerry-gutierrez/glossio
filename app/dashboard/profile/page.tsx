'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './page.module.css'
import { createClient } from '@/lib/supabase/client'

type Photo = {
  id: string | number
  color: string
  label: string
  url: string | null
}

interface ProfileData {
  name: string
  tagline: string
  instagram: string
  location: string
  bio: string
  avatarUrl: string | null
}

const INITIAL_PROFILE: ProfileData = {
  name: '',
  tagline: '',
  instagram: '',
  location: '',
  bio: '',
  avatarUrl: null,
}

function PencilSvg() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
}

function EyeSvg() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
}

function CameraSvg() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
}

function UploadSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
}

function TrashSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
}

function InstagramSvg() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
}

function MapPinSvg() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
}

function ImagePlaceholderSvg() {
  return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
}

function CloseSvg() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
}

export default function ProfilePage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [removeMode, setRemoveMode] = useState(false)
  const [selectedToRemove, setSelectedToRemove] = useState<(string | number)[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE)
  const [editDraft, setEditDraft] = useState<ProfileData>({ ...INITIAL_PROFILE })
  const [previewMode, setPreviewMode] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Load photos and profile from Supabase on mount
  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Load profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('company_name, tagline, instagram_handle, location, bio, avatar_url')
      .eq('id', user.id)
      .single()

    if (profileData) {
      setProfile({
        name: profileData.company_name || 'Your Business',
        tagline: profileData.tagline || '',
        instagram: profileData.instagram_handle || '',
        location: profileData.location || '',
        bio: profileData.bio || '',
        avatarUrl: profileData.avatar_url || null,
      })
      setEditDraft({
        name: profileData.company_name || 'Your Business',
        tagline: profileData.tagline || '',
        instagram: profileData.instagram_handle || '',
        location: profileData.location || '',
        bio: profileData.bio || '',
        avatarUrl: profileData.avatar_url || null,
      })
    } else {
      // Fallback to auth user_metadata (set during signup)
      const meta = user.user_metadata || {}
      const name = meta.company_name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || 'Your Business'
      const fallback: ProfileData = {
        name,
        tagline: '',
        instagram: '',
        location: meta.address || '',
        bio: '',
        avatarUrl: null,
      }
      setProfile(fallback)
      setEditDraft(fallback)
    }

    // Load work photos
    const { data: workPhotos } = await supabase
      .from('work_photos')
      .select('id, url, sort_order')
      .eq('profile_id', user.id)
      .order('sort_order', { ascending: true })

    if (workPhotos && workPhotos.length > 0) {
      setPhotos(workPhotos.map(p => ({
        id: p.id,
        color: '#111118',
        label: '',
        url: p.url,
      })))
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const initials = profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload-avatar', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.avatarUrl) {
        setProfile(prev => ({ ...prev, avatarUrl: data.avatarUrl }))
        setEditDraft(prev => ({ ...prev, avatarUrl: data.avatarUrl }))
      } else {
        alert(data.error || 'Upload failed')
      }
    } catch (err) {
      console.error('Avatar upload failed:', err)
      alert('Upload failed. Please try again.')
    } finally {
      setUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const toggleRemoveSelect = (id: string | number) => {
    setSelectedToRemove(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const confirmRemove = async () => {
    // Delete from Supabase
    const uuidIds = selectedToRemove.filter(id => typeof id === 'string')
    if (uuidIds.length > 0) {
      try {
        await fetch('/api/upload-photo', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoIds: uuidIds }),
        })
      } catch (err) {
        console.error('Delete failed:', err)
      }
    }
    setPhotos(prev => prev.filter(p => !selectedToRemove.includes(p.id)))
    setSelectedToRemove([])
    setRemoveMode(false)
  }

  const cancelRemove = () => {
    setSelectedToRemove([])
    setRemoveMode(false)
  }

  const saveProfile = async () => {
    setProfile({ ...editDraft })
    setShowEditModal(false)

    // Persist to Supabase
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({
          company_name: editDraft.name,
          tagline: editDraft.tagline,
          instagram_handle: editDraft.instagram,
          location: editDraft.location,
          bio: editDraft.bio,
        })
        .eq('id', user.id)
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    for (const file of Array.from(files)) {
      // Show immediate preview while uploading
      const previewUrl = URL.createObjectURL(file)
      const tempId = `temp-${Date.now()}-${Math.random()}`
      const tempPhoto: Photo = {
        id: tempId,
        color: '#111118',
        label: 'Uploading...',
        url: previewUrl,
      }
      setPhotos(prev => [...prev, tempPhoto])

      // Upload to Supabase via API route
      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload-photo', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          const { photo } = await res.json()
          // Replace temp photo with real record
          setPhotos(prev => prev.map(p =>
            p.id === tempId
              ? { id: photo.id, color: '#111118', label: '', url: photo.url }
              : p
          ))
        } else {
          // Remove failed upload
          setPhotos(prev => prev.filter(p => p.id !== tempId))
          const errData = await res.json()
          console.error('Upload failed:', errData.error)
        }
      } catch (err) {
        setPhotos(prev => prev.filter(p => p.id !== tempId))
        console.error('Upload error:', err)
      }

      URL.revokeObjectURL(previewUrl)
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <>
      {/* Top Actions */}
      <div className={styles.topActions}>
        <div className={styles.headerGroup}>
          <p className={styles.headerLabel}>Public Profile</p>
          <h1 className={styles.headerTitle}>My Profile</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {saved && <span className={styles.savedMsg}>✓ Saved!</span>}
          <button
            onClick={() => setPreviewMode(v => !v)}
            className={`${styles.previewToggle} ${previewMode ? styles.previewToggleActive : ''}`}
          >
            {previewMode ? <><PencilSvg /> Edit Mode</> : <><EyeSvg /> Preview as Client</>}
          </button>
        </div>
      </div>

      {/* Edit Mode Banner */}
      {!previewMode && (
        <div className={styles.editBanner}>
          <PencilSvg />
          <p className={styles.editBannerText}>
            <strong>You&apos;re editing your public profile.</strong> Clients won&apos;t see your changes until you save. Hit &quot;Preview as Client&quot; to see how it looks.
          </p>
        </div>
      )}

      {/* Profile Header */}
      <div className={styles.profileSection}>
        <div className={styles.profileGlow} />

        {/* Avatar */}
        <div className={styles.avatarWrapper}>
          <div className={styles.avatar}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} />
            ) : (
              initials
            )}
          </div>
          {!previewMode && (
            <button
              className={styles.avatarEditBtn}
              title="Change profile photo"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? <span className={styles.avatarSpinner} /> : <CameraSvg />}
            </button>
          )}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleAvatarUpload}
          />
        </div>

        {/* Name + Badge */}
        <div className={styles.nameRow}>
          <h2 className={styles.profileName}>{profile.name}</h2>
          <span className={styles.proBadge}>PRO</span>
        </div>

        <p className={styles.tagline}>{profile.tagline}</p>

        {/* Tags */}
        <div className={styles.tagRow}>
          <span className={styles.tag}><InstagramSvg /> {profile.instagram}</span>
          <span className={styles.tag}><MapPinSvg /> {profile.location}</span>
        </div>

        {/* Edit Profile Button */}
        {!previewMode && (
          <button
            onClick={() => { setEditDraft({ ...profile }); setShowEditModal(true) }}
            className={styles.editProfileBtn}
          >
            <PencilSvg /> Edit Profile Info
          </button>
        )}

        {/* Preview CTA */}
        {previewMode && (
          <div style={{ width: '100%', maxWidth: 520, marginBottom: 24 }}>
            <button style={{
              width: '100%', background: 'var(--primary)', border: 'none', borderRadius: 14,
              color: '#fff', fontSize: 16, fontWeight: 700, padding: 18, cursor: 'pointer',
              boxShadow: '0 4px 32px rgba(0,194,255,0.2)', marginBottom: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              Book an Appointment
            </button>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-faint)', textAlign: 'center' }}>
              Select your service · Pick a time · Get confirmed
            </p>
          </div>
        )}

        {/* Bio */}
        <div className={styles.bioBox}>
          <p className={styles.bioLabel}>About</p>
          <p className={styles.bioText}>{profile.bio}</p>
        </div>
      </div>

      {/* Divider */}
      <div className={styles.sectionDivider}>
        <div className={styles.dividerLine} />
        <span className={styles.dividerText}>Work Photos</span>
        <div className={styles.dividerLine} />
      </div>

      {/* Photo Grid */}
      <div className={styles.photoSection}>
        {/* Remove mode banner */}
        {removeMode && (
          <div className={styles.removeModeBanner}>
            <p className={styles.removeModeText}>
              {selectedToRemove.length === 0
                ? 'Tap photos to select them for removal'
                : `${selectedToRemove.length} photo${selectedToRemove.length > 1 ? 's' : ''} selected`}
            </p>
            <div className={styles.removeModeActions}>
              {selectedToRemove.length > 0 && (
                <button onClick={confirmRemove} className={styles.removeConfirmBtn}>Remove</button>
              )}
              <button onClick={cancelRemove} className={styles.removeCancelBtn}>Cancel</button>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className={styles.photoGrid}>
          {photos.map(photo => (
            <div
              key={photo.id}
              onClick={() => removeMode && toggleRemoveSelect(photo.id)}
              className={`${styles.photoCard} ${removeMode ? styles.photoCardRemovable : ''} ${removeMode && selectedToRemove.includes(photo.id) ? styles.photoCardSelected : ''}`}
              style={{
                background: photo.url ? `url(${photo.url}) center / cover` : photo.color,
              }}
            >
              <div className={styles.photoOverlay} />

              {removeMode && (
                <div
                  className={styles.removeCheck}
                  style={{
                    background: selectedToRemove.includes(photo.id) ? 'var(--danger)' : 'var(--bg-card)',
                    border: `2px solid ${selectedToRemove.includes(photo.id) ? 'var(--danger)' : 'var(--border-light)'}`,
                  }}
                >
                  {selectedToRemove.includes(photo.id) ? '\u2713' : ''}
                </div>
              )}

              {!photo.url && (
                <>
                  <span className={styles.photoPlaceholder}><ImagePlaceholderSvg /></span>
                  <span className={styles.photoLabel}>{photo.label}</span>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Photo Actions — edit mode only */}
        {!previewMode && (
          <div className={styles.photoActions}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className={styles.fileInput}
              onChange={handleFileUpload}
            />
            <button onClick={() => fileInputRef.current?.click()} className={styles.uploadBtn} disabled={uploading}>
              <UploadSvg /> {uploading ? 'Uploading...' : 'Upload Photos'}
            </button>
            <button
              onClick={() => { setRemoveMode(true); setSelectedToRemove([]) }}
              disabled={removeMode}
              className={`${styles.removeBtn} ${removeMode ? styles.removeBtnDisabled : ''}`}
            >
              <TrashSvg /> Remove Photos
            </button>
          </div>
        )}
      </div>

      {/* Preview bottom CTA */}
      {previewMode && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-faint)' }}>
            Powered by <span style={{ color: 'var(--primary)' }}>GlossIO</span>
          </p>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit Profile Info</h2>
              <button onClick={() => setShowEditModal(false)} className={styles.modalCloseBtn}>
                <CloseSvg />
              </button>
            </div>

            {[
              { label: 'Display Name', key: 'name' as const, placeholder: 'Carlos Detail Co.' },
              { label: 'Tagline', key: 'tagline' as const, placeholder: 'Premium mobile detailing in Naples, FL' },
              { label: 'Instagram Handle', key: 'instagram' as const, placeholder: '@yourhandle' },
              { label: 'Location', key: 'location' as const, placeholder: 'Naples, FL' },
            ].map(f => (
              <div key={f.key} className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{f.label}</label>
                <input
                  className={styles.fieldInput}
                  value={editDraft[f.key]}
                  onChange={e => setEditDraft(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                />
              </div>
            ))}

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Bio</label>
              <textarea
                className={styles.fieldTextarea}
                value={editDraft.bio}
                onChange={e => setEditDraft(p => ({ ...p, bio: e.target.value }))}
                rows={4}
              />
            </div>

            <div className={styles.modalBtnRow}>
              <button onClick={() => setShowEditModal(false)} className={styles.cancelBtn}>Cancel</button>
              <button onClick={saveProfile} className={styles.saveBtn}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
