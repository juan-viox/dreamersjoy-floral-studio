'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { KeyRound, Loader2, Check, AlertCircle } from 'lucide-react'

const MIN_LENGTH = 8

export default function AccountPage() {
  const supabase = createClient()

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setDone(false)

    if (next.length < MIN_LENGTH) {
      setError(`Your new password needs at least ${MIN_LENGTH} characters.`)
      return
    }
    if (next !== confirm) {
      setError('The two new passwords do not match.')
      return
    }
    if (next === current) {
      setError('That is the password you are already using.')
      return
    }

    setSaving(true)
    try {
      // Supabase lets a signed-in user set a new password without proving the
      // old one. We ask for it anyway: an unlocked laptop should not be enough
      // to lock the owner out of her own CRM.
      const { data: userData } = await supabase.auth.getUser()
      const email = userData.user?.email
      if (!email) {
        setError('Your session has expired. Sign in again and retry.')
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: current,
      })
      if (signInError) {
        setError('That current password is not right.')
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: next })
      if (updateError) {
        setError(updateError.message)
        return
      }

      setCurrent('')
      setNext('')
      setConfirm('')
      setDone(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Account</h1>

      <div className="card space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <KeyRound className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          Change password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="current">Current password</label>
            <input
              id="current"
              type="password"
              autoComplete="current-password"
              required
              className="w-full"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="next">New password</label>
            <input
              id="next"
              type="password"
              autoComplete="new-password"
              required
              className="w-full"
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              At least {MIN_LENGTH} characters.
            </p>
          </div>

          <div>
            <label htmlFor="confirm">Confirm new password</label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              className="w-full"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm flex items-start gap-2" style={{ color: '#e17055' }}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </p>
          )}

          {done && (
            <p className="text-sm flex items-start gap-2" style={{ color: '#00b894' }}>
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              Password changed. Use the new one next time you sign in.
            </p>
          )}

          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving
              </>
            ) : (
              'Change password'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
