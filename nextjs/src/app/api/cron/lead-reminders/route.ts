import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendLeadReminders } from '@/lib/ingest/reminders'

/**
 * Hourly sweep for enquiries that have gone 24 hours without a reply.
 *
 * Runs on Vercel Cron (see vercel.json). Hourly rather than daily so a
 * reminder lands close to the 24-hour mark whatever time the enquiry came in,
 * instead of anywhere up to a day late.
 *
 * The sweep is naturally idempotent — each enquiry is stamped
 * `reminder_sent_at` once and then skipped — so a repeated call cannot spam
 * the studio.
 */
export const dynamic = 'force-dynamic'
export const maxDuration = 60

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim()

  // Vercel sends `Authorization: Bearer $CRON_SECRET` when the variable is
  // set. That is the check we want, so prefer it whenever it is available.
  if (secret) {
    return request.headers.get('authorization') === `Bearer ${secret}`
  }

  // Until CRON_SECRET is set, fall back to the header Vercel Cron attaches.
  // Weaker — it is forgeable — but the worst a forged call can do is send a
  // reminder that was already due, once.
  console.warn('[cron] CRON_SECRET not set — falling back to the x-vercel-cron header')
  return request.headers.get('x-vercel-cron') !== null
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }

  const result = await sendLeadReminders(createAdminClient())
  console.log('[cron] lead reminders:', result)
  return NextResponse.json({ ok: true, ...result })
}
