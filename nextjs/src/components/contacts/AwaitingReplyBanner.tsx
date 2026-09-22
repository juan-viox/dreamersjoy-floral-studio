'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Clock, Check, Loader2 } from 'lucide-react'

/**
 * The switch that turns the 24-hour reminder off.
 *
 * Shown only while an enquiry is genuinely waiting on a human. Pressing it
 * writes `replied_at`, which both clears the banner and takes the contact out
 * of the reminder sweep — so the studio is never nudged about something it
 * has already handled.
 */
export default function AwaitingReplyBanner({
  contactId,
  awaitingSince,
}: {
  contactId: string
  awaitingSince: string
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hours = Math.floor((Date.now() - new Date(awaitingSince).getTime()) / 3_600_000)
  const overdue = hours >= 24

  const waited =
    hours < 1
      ? 'less than an hour ago'
      : hours < 24
        ? `${hours} hour${hours === 1 ? '' : 's'} ago`
        : `${Math.floor(hours / 24)} day${Math.floor(hours / 24) === 1 ? '' : 's'} ago`

  async function markReplied() {
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('contacts')
      .update({ replied_at: new Date().toISOString(), awaiting_reply_since: null })
      .eq('id', contactId)

    setSaving(false)
    if (updateError) {
      setError('Could not save that. Try again.')
      return
    }
    router.refresh()
  }

  const accent = overdue ? '#e17055' : '#fdcb6e'

  return (
    <div
      className="card mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between"
      style={{ borderColor: accent, background: `${accent}14` }}
    >
      <div className="flex items-start gap-3">
        <Clock className="w-5 h-5 shrink-0 mt-0.5" style={{ color: accent }} />
        <div>
          <p className="font-semibold">
            {overdue ? 'Still waiting on a reply' : 'Waiting on a reply'}
          </p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            They enquired {waited}.{' '}
            {overdue
              ? 'A reminder has gone out.'
              : 'A reminder goes out at 24 hours if this is still open.'}
          </p>
          {error && (
            <p className="text-sm mt-1" style={{ color: '#e17055' }}>
              {error}
            </p>
          )}
        </div>
      </div>

      <button onClick={markReplied} disabled={saving} className="btn btn-primary shrink-0">
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            I&rsquo;ve replied
          </>
        )}
      </button>
    </div>
  )
}
