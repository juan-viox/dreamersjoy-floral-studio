/**
 * The two chasing alerts.
 *
 * The studio answers everyone inside 48 business hours. Three things happen
 * on the way there:
 *
 *   0h   notifyNewLead fires the moment the enquiry lands.
 *   24h  first nudge — half the promise spent, still time to be prompt.
 *   48h  final nudge — the promise is now due.
 *
 * After that it stops. An enquiry nobody has answered in two working days is
 * not going to be rescued by a third email; it needs a person, and by then the
 * person has been told twice.
 *
 * Hours are BUSINESS hours: Saturday and Sunday do not count. An enquiry that
 * arrives on Friday evening should not turn urgent on Sunday morning, and the
 * promise made to customers is about working days.
 *
 * An enquiry only enters this sweep if `awaiting_reply_since` was stamped by
 * notifyNewLead, so Stripe orders and newsletter signups are structurally
 * excluded rather than filtered out by guesswork.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  businessHoursSince,
  FIRST_REMINDER_BUSINESS_HOURS,
  FINAL_REMINDER_BUSINESS_HOURS,
} from '../businessHours'
import { alertRecipients } from './recipients'

/** Past this, the enquiry is stale enough that a nudge is just noise. */
const GIVE_UP_AFTER_DAYS = 14

const HOUR_MS = 3_600_000

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamersjoystudio.com').trim()

type Stage = 'first' | 'final'

type OverdueLead = {
  id: string
  organization_id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  notes: string | null
  awaiting_reply_since: string
  reminder_sent_at: string | null
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

/** Which nudge, if any, this enquiry is owed right now. */
function stageFor(lead: OverdueLead, businessHours: number): Stage | null {
  if (lead.reminder_sent_at === null) {
    return businessHours >= FIRST_REMINDER_BUSINESS_HOURS ? 'first' : null
  }
  return businessHours >= FINAL_REMINDER_BUSINESS_HOURS ? 'final' : null
}

const headline = (stage: Stage): string =>
  stage === 'final' ? 'This one is due now' : 'Still waiting on a reply'

const subject = (stage: Stage, name: string): string =>
  stage === 'final' ? `Due now: ${name} is still waiting` : `Still unanswered: ${name}`

function summary(stage: Stage, hours: number): string {
  return stage === 'final'
    ? `It has been ${hours} business hours — the 48-hour promise is up.`
    : `It has been ${hours} business hours. The 48-hour promise has ${FINAL_REMINDER_BUSINESS_HOURS - hours} left.`
}

function plainText(lead: OverdueLead, stage: Stage, hours: number, contactUrl: string): string {
  return [
    `${displayName(lead)} enquired and has not had a reply yet.`,
    summary(stage, hours),
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

function html(lead: OverdueLead, stage: Stage, hours: number, contactUrl: string): string {
  const accent = stage === 'final' ? '#e17055' : '#8B7355'

  return `<div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px;">
  <h2 style="font-size:18px;margin:0 0 4px;color:${accent};">${headline(stage)}</h2>
  <p style="margin:0 0 16px;color:#6b7280;font-size:14px;">
    <strong>${escapeHtml(displayName(lead))}</strong> — ${escapeHtml(summary(stage, hours))}
  </p>
  <table style="border-collapse:collapse;margin-bottom:16px;">
    ${lead.email ? `<tr><td style="padding:4px 16px 4px 0;color:#6b7280;font-size:14px;">Email</td><td style="padding:4px 0;font-size:14px;">${escapeHtml(lead.email)}</td></tr>` : ''}
    ${lead.phone ? `<tr><td style="padding:4px 16px 4px 0;color:#6b7280;font-size:14px;">Phone</td><td style="padding:4px 0;font-size:14px;">${escapeHtml(lead.phone)}</td></tr>` : ''}
  </table>
  ${
    lead.notes
      ? `<p style="margin:0 0 4px;color:#6b7280;font-size:14px;">What they wrote</p>
         <blockquote style="margin:0 0 16px;padding:12px 16px;background:#f9fafb;border-left:3px solid ${accent};font-size:14px;white-space:pre-wrap;">${escapeHtml(lead.notes)}</blockquote>`
      : ''
  }
  <a href="${contactUrl}" style="display:inline-block;padding:10px 18px;background:#334155;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;">Open in the CRM</a>
</div>`
}

async function remindByEmail(
  lead: OverdueLead,
  stage: Stage,
  hours: number,
  contactUrl: string,
): Promise<void> {
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
      to: alertRecipients(),
      reply_to: lead.email || undefined,
      subject: subject(stage, displayName(lead)),
      text: plainText(lead, stage, hours, contactUrl),
      html: html(lead, stage, hours, contactUrl),
    }),
  })

  if (!res.ok) {
    console.error('[reminders] Resend rejected the send:', res.status, await res.text().catch(() => ''))
  }
}

async function remindInApp(
  supabase: SupabaseClient,
  lead: OverdueLead,
  stage: Stage,
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
      title: `${headline(stage)}: ${displayName(lead)}`,
      message: summary(stage, hours),
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
  // Cheap prefilter in the database. Business hours can never exceed wall-clock
  // hours, so nothing due for a nudge can sit newer than this cutoff.
  const cutoff = new Date(Date.now() - FIRST_REMINDER_BUSINESS_HOURS * HOUR_MS).toISOString()
  const floor = new Date(Date.now() - GIVE_UP_AFTER_DAYS * 86_400_000).toISOString()

  const { data, error } = await supabase
    .from('contacts')
    .select(
      'id, organization_id, first_name, last_name, email, phone, notes, awaiting_reply_since, reminder_sent_at',
    )
    .not('awaiting_reply_since', 'is', null)
    .is('replied_at', null)
    .is('final_reminder_sent_at', null)
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
    const hours = businessHoursSince(lead.awaiting_reply_since)
    const stage = stageFor(lead, hours)

    // Weekend padding means a row can clear the SQL prefilter and still not be
    // due. Leave it for a later sweep.
    if (stage === null) continue

    const contactUrl = `${SITE_URL}/contacts/${lead.id}`

    const results = await Promise.allSettled([
      remindInApp(supabase, lead, stage, hours),
      remindByEmail(lead, stage, hours, contactUrl),
    ])

    const broke = results.some((r) => r.status === 'rejected')
    for (const r of results) {
      if (r.status === 'rejected') console.error('[reminders]', r.reason)
    }

    if (broke) {
      // Leave the stamp unset so the next sweep tries this stage again.
      failed += 1
      continue
    }

    const stamp =
      stage === 'first'
        ? { reminder_sent_at: new Date().toISOString() }
        : { final_reminder_sent_at: new Date().toISOString() }

    await supabase.from('contacts').update(stamp).eq('id', lead.id)
    reminded += 1
  }

  return { checked: leads.length, reminded, failed }
}
