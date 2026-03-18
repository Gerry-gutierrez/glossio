'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{
      padding: 40,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: '#FF336615', border: '1px solid #FF336633',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, color: '#FF3366',
      }}>
        !
      </div>
      <h2 style={{ fontSize: 20, margin: 0, color: '#F0EDE8' }}>Something went wrong</h2>
      <p style={{ color: '#888', margin: 0, maxWidth: 360, fontSize: 13 }}>
        {error.message || 'This page encountered an error. Try refreshing.'}
      </p>
      <button
        onClick={reset}
        style={{
          marginTop: 4,
          background: '#00C2FF',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '10px 20px',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'Georgia, serif',
        }}
      >
        Try Again
      </button>
    </div>
  )
}
