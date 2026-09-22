'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCw, LogIn } from 'lucide-react'

/**
 * What the studio sees when a CRM page throws.
 *
 * Before this existed, any unhandled error rendered Next's bare fallback —
 * a white page reading "Application error: a client-side exception has
 * occurred", with no way forward but the browser's back button. The most
 * common cause is simply an expired session after a few hours away, which is
 * not an error anybody should have to read a stack trace to recover from.
 *
 * So: say what happened in plain words, and offer the two things that
 * actually fix it.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[crm]', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="card max-w-md w-full text-center">
        <AlertTriangle
          className="w-8 h-8 mx-auto mb-3"
          style={{ color: '#e17055' }}
          aria-hidden
        />

        <h1 className="text-lg font-semibold mb-2">This page didn&rsquo;t load</h1>

        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          Most often this just means you&rsquo;ve been signed out after a while
          away. Try again, and if it keeps happening, sign back in.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button onClick={reset} className="btn btn-primary">
            <RotateCw className="w-4 h-4" />
            Try again
          </button>
          <Link href="/login" className="btn">
            <LogIn className="w-4 h-4" />
            Sign in
          </Link>
        </div>

        {error.digest && (
          <p className="text-xs mt-6" style={{ color: 'var(--muted)' }}>
            Reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
