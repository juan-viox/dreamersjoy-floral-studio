'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  businessHoursSince,
  FIRST_REMINDER_BUSINESS_HOURS,
  FINAL_REMINDER_BUSINESS_HOURS,
} from '@/lib/businessHours'
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

  // Business hours, matching the reminder emails exactly — a contact should
  // never look overdue here while the sweep still considers it in time.
  const hours = businessHoursSince(awaitingSince)
  const due = hours >= FINAL_REMINDER_BUSINESS_HOURS
  const overdue = hours >= FIRST_REMINDER_BUSINESS_HOURS

  const waited =
    hours < 1
      ? 'less than an hour of working time ago'
      : `${hours} business hour${hours === 1 ? '' : 's'} ago`

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

  // Three states, three colours: in hand, running late, due now.
  const accent = due ? '#e17055' : overdue ? '#fdcb6e' : '#8B7355'

  return (
    <div
      className="card mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between"
      style={{ borderColor: accent, background: `${accent}14` }}
    >
      <div className="flex items-start gap-3">
        <Clock className="w-5 h-5 shrink-0 mt-0.5" style={{ color: accent }} />
        <div>
          <p className="font-semibold">
            {due
              ? 'This one is due now'
              : overdue
                ? 'Still waiting on a reply'
                : 'Waiting on a reply'}
          </p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            They enquired {waited}.{' '}
            {due
              ? `That is the full ${FINAL_REMINDER_BUSINESS_HOURS} business hours — both reminders have gone out.`
              : overdue
                ? `A reminder has gone out. The ${FINAL_REMINDER_BUSINESS_HOURS}-hour promise has ${FINAL_REMINDER_BUSINESS_HOURS - hours} business hours left.`
                : `A reminder goes out after ${FIRST_REMINDER_BUSINESS_HOURS} business hours if this is still open. Weekends don't count.`}
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
