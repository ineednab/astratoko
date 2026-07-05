'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="id">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 24px',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
            background: '#ffffff',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>😵</div>
          <h1 style={{ fontWeight: 800, fontSize: 22, color: '#111827', marginBottom: 8 }}>
            Ada yang tidak beres
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 28, maxWidth: 320 }}>
            Terjadi kesalahan tak terduga. Coba muat ulang aplikasi.
          </p>
          <button
            onClick={reset}
            style={{
              background: '#1A3CC4',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 14,
              padding: '14px 28px',
              borderRadius: 16,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  )
}
