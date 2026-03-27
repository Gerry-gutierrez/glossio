'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  company_name: string | null
  slug: string
  subscription_status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete'
  is_pro: boolean
  trial_ends_at: string | null
  created_at: string
}

type Filter = 'all' | 'active' | 'paused'

function getStatusLabel(status: string) {
  switch (status) {
    case 'active': return 'Active'
    case 'trialing': return 'Free Trial'
    case 'past_due': return 'Past Due'
    case 'canceled': return 'Canceled'
    case 'incomplete': return 'Incomplete'
    default: return status
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'active': return styles.badgeActive
    case 'trialing': return styles.badgeTrialing
    case 'canceled': return styles.badgeCanceled
    case 'past_due': return styles.badgePastDue
    default: return ''
  }
}

function isUserActive(user: User): boolean {
  if (user.subscription_status === 'active') return true
  if (user.subscription_status === 'trialing') {
    // Check if trial has expired
    if (user.trial_ends_at) {
      return new Date(user.trial_ends_at) > new Date()
    }
    return true
  }
  return false
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [adminKey, setAdminKey] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  async function handleLogin() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/users?key=${encodeURIComponent(adminKey)}`)
      if (!res.ok) {
        setError('Invalid admin key')
        setLoading(false)
        return
      }
      const data = await res.json()
      setUsers(data.users || [])
      setAuthenticated(true)
    } catch {
      setError('Failed to connect')
    }
    setLoading(false)
  }

  // Login gate
  if (!authenticated) {
    return (
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>← Back to GlossIO</Link>
        <div className={styles.loginGate}>
          <h1 className={styles.loginTitle}>Admin Access</h1>
          <input
            type="password"
            className={styles.loginInput}
            placeholder="Enter admin key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin} className={styles.loginBtn} disabled={loading}>
            {loading ? 'Checking...' : 'Enter'}
          </button>
          {error && <p className={styles.loginError}>{error}</p>}
        </div>
      </div>
    )
  }

  // Filter users
  const activeUsers = users.filter(isUserActive)
  const pausedUsers = users.filter(u => !isUserActive(u))

  const filteredUsers = filter === 'active'
    ? activeUsers
    : filter === 'paused'
      ? pausedUsers
      : users

  // Count by subscription type
  const trialingCount = users.filter(u => u.subscription_status === 'trialing' && isUserActive(u)).length
  const monthlyOrAnnual = users.filter(u => u.subscription_status === 'active').length
  const canceledCount = pausedUsers.length

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>← Back to GlossIO</Link>

      <div className={styles.header}>
        <p className={styles.headerLabel}>Admin</p>
        <h1 className={styles.headerTitle}>User Dashboard</h1>
      </div>

      {/* Stats */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <p className={styles.statValue}>{users.length}</p>
          <p className={styles.statLabel}>Total Users</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statValue} style={{ color: '#34c759' }}>{activeUsers.length}</p>
          <p className={styles.statLabel}>Active</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statValue} style={{ color: '#ff4d4d' }}>{pausedUsers.length}</p>
          <p className={styles.statLabel}>Paused / Canceled</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statValue} style={{ color: '#00c2ff' }}>{trialingCount}</p>
          <p className={styles.statLabel}>On Free Trial</p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterRow}>
        {(['all', 'active', 'paused'] as Filter[]).map(f => (
          <button
            key={f}
            className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? `All (${users.length})` : f === 'active' ? `Active (${activeUsers.length})` : `Paused (${pausedUsers.length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Business</th>
              <th>Status</th>
              <th>Trial Ends</th>
              <th>Signed Up</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className={styles.userName}>{user.first_name} {user.last_name}</div>
                  <div className={styles.userEmail}>{user.email}</div>
                </td>
                <td>{user.company_name || '—'}</td>
                <td>
                  <span className={`${styles.badge} ${getStatusBadgeClass(user.subscription_status)}`}>
                    {getStatusLabel(user.subscription_status)}
                  </span>
                </td>
                <td>{user.trial_ends_at ? formatDate(user.trial_ends_at) : '—'}</td>
                <td>{formatDate(user.created_at)}</td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-faint)', padding: 40 }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
