'use client'

import { useEffect } from 'react'

/**
 * The last net.
 *
 * `(app)/error.tsx` catches anything thrown inside a CRM page. This catches
 * the rarer case where the root layout itself fails, which leaves no app
 * chrome and no stylesheet — so everything here is inline, and it renders its
 * own <html>/<body> as Next requires.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[crm:global]', error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FAFAF8',
          color: '#1A1A2E',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: '380px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '18px', margin: '0 0 8px' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '14px', lineHeight: 1.5, color: '#6b7280', margin: '0 0 20px' }}>
            The page couldn&rsquo;t be loaded. Reloading usually clears it.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '10px 18px',
              background: '#334155',
              color: '#fff',
              border: 0,
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
          {error.digest && (
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '24px' }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
