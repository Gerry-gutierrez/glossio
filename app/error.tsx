'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
      fontFamily: 'Georgia, serif',
      color: '#F0EDE8',
      padding: 24,
      textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: '#FF336615', border: '1px solid #FF336633',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28,
      }}>
        !
      </div>
      <h1 style={{ fontSize: 24, margin: 0 }}>Something went wrong</h1>
      <p style={{ color: '#888', margin: 0, maxWidth: 400, fontSize: 14 }}>
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        style={{
          marginTop: 8,
          background: '#00C2FF',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '12px 24px',
          fontSize: 14,
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
