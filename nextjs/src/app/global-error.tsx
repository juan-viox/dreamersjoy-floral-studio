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
            Reloading usually clears it. If it keeps happening, you may have
            been signed out while you were away.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {/* A full reload, not just reset(). reset() re-renders the same
                tree, so anything that fails during render fails again
                identically and the button looks broken. */}
            <button
              onClick={() => window.location.reload()}
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
              Reload the page
            </button>
            {/* A plain <a>: this boundary renders its own document, outside
                the router, so next/link has nothing to navigate. */}
            <a
              href="/login"
              style={{
                padding: '10px 18px',
                background: 'transparent',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Sign in again
            </a>
          </div>
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
