/**
 * The second alert.
 *
 * The first alert fires when an enquiry arrives. This one fires 24 hours
 * later if nobody has marked it replied — leaving a full day of the studio's
 * 48-hour promise still on the clock.
 *
 * An enquiry only enters this sweep if `awaiting_reply_since` was stamped by
 * notifyNewLead, so Stripe orders and newsletter signups are structurally
 * excluded rather than filtered out by guesswork.
 *
 * Each enquiry is reminded at most once: `reminder_sent_at` is written on the
 * way out, and the query skips anything that already carries it.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

/** Hours an enquiry may sit unanswered before the reminder goes out. */
const REMIND_AFTER_HOURS = 24

/** Past this, the enquiry is stale enough that a nudge is just noise. */
const GIVE_UP_AFTER_DAYS = 14

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamersjoystudio.com').trim()

const alertRecipient = (): string =>
  (process.env.LEAD_NOTIFICATION_EMAIL || 'sarah@dreamersjoystudio.com').trim()

type OverdueLead = {
  id: string
  organization_id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  notes: string | null
  awaiting_reply_since: string
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const displayName = (lead: OverdueLead): string =>
  [lead.first_name, lead.last_name].filter(Boolean).join(' ').trim() ||
  lead.email ||
  lead.phone ||
  'Someone'

const hoursWaiting = (lead: OverdueLead): number =>
  Math.floor((Date.now() - new Date(lead.awaiting_reply_since).getTime()) / 3_600_000)

function plainText(lead: OverdueLead, hours: number, contactUrl: string): string {
  return [
    `${displayName(lead)} enquired ${hours} hours ago and has not had a reply yet.`,
    '',
    lead.email ? `Email:  ${lead.email}` : null,
    lead.phone ? `Phone:  ${lead.phone}` : null,
    '',
    lead.notes ? `What they wrote:\n${lead.notes}` : null,
    '',
    `Open in the CRM: ${contactUrl}`,
  ]
    .filter((l) => l !== null)
    .join('\n')
}

function html(lead: OverdueLead, hours: number, contactUrl: string): string {
  return `<div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px;">
  <h2 style="font-size:18px;margin:0 0 4px;">Still waiting on a reply</h2>
  <p style="margin:0 0 16px;color:#6b7280;font-size:14px;">
    <strong>${escapeHtml(displayName(lead))}</strong> enquired ${hours} hours ago.
  </p>
  <table style="border-collapse:collapse;margin-bottom:16px;">
    ${lead.email ? `<tr><td style="padding:4px 16px 4px 0;color:#6b7280;font-size:14px;">Email</td><td style="padding:4px 0;font-size:14px;">${escapeHtml(lead.email)}</td></tr>` : ''}
    ${lead.phone ? `<tr><td style="padding:4px 16px 4px 0;color:#6b7280;font-size:14px;">Phone</td><td style="padding:4px 0;font-size:14px;">${escapeHtml(lead.phone)}</td></tr>` : ''}
  </table>
  ${
    lead.notes
      ? `<p style="margin:0 0 4px;color:#6b7280;font-size:14px;">What they wrote</p>
         <blockquote style="margin:0 0 16px;padding:12px 16px;background:#f9fafb;border-left:3px solid #8B7355;font-size:14px;white-space:pre-wrap;">${escapeHtml(lead.notes)}</blockquote>`
      : ''
  }
  <a href="${contactUrl}" style="display:inline-block;padding:10px 18px;background:#334155;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;">Open in the CRM</a>
</div>`
}

async function remindByEmail(lead: OverdueLead, hours: number, contactUrl: string): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) {
    console.warn('[reminders] RESEND_API_KEY not set — no reminder email sent')
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: (process.env.RESEND_FROM_EMAIL || 'DreamersJoy <hello@dreamersjoystudio.com>').trim(),
      to: [alertRecipient()],
      reply_to: lead.email || undefined,
      subject: `Still unanswered: ${displayName(lead)}`,
      text: plainText(lead, hours, contactUrl),
      html: html(lead, hours, contactUrl),
    }),
  })

  if (!res.ok) {
    console.error('[reminders] Resend rejected the send:', res.status, await res.text().catch(() => ''))
  }
}

async function remindInApp(
  supabase: SupabaseClient,
  lead: OverdueLead,
  hours: number,
): Promise<void> {
  const { data: members } = await supabase
    .from('profiles')
    .select('id')
    .eq('organization_id', lead.organization_id)

  if (!members?.length) return

  await supabase.from('notifications').insert(
    members.map((m: { id: string }) => ({
      user_id: m.id,
      type: 'new_lead',
      title: `Still unanswered: ${displayName(lead)}`,
      message: `Enquired ${hours} hours ago and has not had a reply.`,
      entity_type: 'contact',
      entity_id: lead.id,
    })),
  )
}

export type ReminderRun = { checked: number; reminded: number; failed: number }

/**
 * Sweep for overdue enquiries and nudge both channels. Never throws.
 */
export async function sendLeadReminders(supabase: SupabaseClient): Promise<ReminderRun> {
  const cutoff = new Date(Date.now() - REMIND_AFTER_HOURS * 3_600_000).toISOString()
  const floor = new Date(Date.now() - GIVE_UP_AFTER_DAYS * 86_400_000).toISOString()

  const { data, error } = await supabase
    .from('contacts')
    .select('id, organization_id, first_name, last_name, email, phone, notes, awaiting_reply_since')
    .not('awaiting_reply_since', 'is', null)
    .is('replied_at', null)
    .is('reminder_sent_at', null)
    .lt('awaiting_reply_since', cutoff)
    .gt('awaiting_reply_since', floor)
    .order('awaiting_reply_since')
    .limit(50)

  if (error) {
    console.error('[reminders] could not read overdue enquiries:', error.message)
    return { checked: 0, reminded: 0, failed: 0 }
  }

  const leads = (data ?? []) as OverdueLead[]
  let reminded = 0
  let failed = 0

  for (const lead of leads) {
    const hours = hoursWaiting(lead)
    const contactUrl = `${SITE_URL}/contacts/${lead.id}`

    const results = await Promise.allSettled([
      remindInApp(supabase, lead, hours),
      remindByEmail(lead, hours, contactUrl),
    ])

    const broke = results.some((r) => r.status === 'rejected')
    for (const r of results) {
      if (r.status === 'rejected') console.error('[reminders]', r.reason)
    }

    if (broke) {
      // Leave reminder_sent_at unset so the next sweep tries again.
      failed += 1
      continue
    }

    await supabase
      .from('contacts')
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq('id', lead.id)
    reminded += 1
  }

  return { checked: leads.length, reminded, failed }
}
