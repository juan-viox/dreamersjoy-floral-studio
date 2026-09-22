/**
 * "A lead just came in" alerts.
 *
 * Two independent channels, because they fail independently:
 *
 *   1. A row in `notifications` for every member of the studio — works with
 *      no third-party setup at all, and shows up in the CRM.
 *   2. An email via Resend — only if RESEND_API_KEY is set.
 *
 * Nothing in here is allowed to throw. A lead that saved but failed to send
 * an alert is a nuisance; a lead lost because the alert threw is the bug we
 * are trying to fix. Every path is caught and logged.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { alertRecipients } from './recipients'

export type LeadAlert = {
  name: string
  email?: string | null
  phone?: string | null
  description?: string | null
  source?: string | null
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamersjoystudio.com').trim()

function plainText(lead: LeadAlert, contactUrl: string): string {
  return [
    `${lead.name} just enquired through the website.`,
    '',
    lead.email ? `Email:  ${lead.email}` : null,
    lead.phone ? `Phone:  ${lead.phone}` : null,
    lead.source ? `Form:   ${lead.source}` : null,
    '',
    lead.description ? `What they wrote:\n${lead.description}` : null,
    '',
    `Open in the CRM: ${contactUrl}`,
  ]
    .filter((l) => l !== null)
    .join('\n')
}

function html(lead: LeadAlert, contactUrl: string): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 16px 4px 0;color:#6b7280;font-size:14px;">${label}</td>` +
    `<td style="padding:4px 0;font-size:14px;">${escapeHtml(value)}</td></tr>`

  return `<div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px;">
  <h2 style="font-size:18px;margin:0 0 4px;">New enquiry from the website</h2>
  <p style="margin:0 0 16px;color:#6b7280;font-size:14px;">${escapeHtml(lead.name)} just filled in a form.</p>
  <table style="border-collapse:collapse;margin-bottom:16px;">
    ${lead.email ? row('Email', lead.email) : ''}
    ${lead.phone ? row('Phone', lead.phone) : ''}
    ${lead.source ? row('Form', lead.source) : ''}
  </table>
  ${
    lead.description
      ? `<p style="margin:0 0 4px;color:#6b7280;font-size:14px;">What they wrote</p>
         <blockquote style="margin:0 0 16px;padding:12px 16px;background:#f9fafb;border-left:3px solid #8B7355;font-size:14px;white-space:pre-wrap;">${escapeHtml(lead.description)}</blockquote>`
      : ''
  }
  <a href="${contactUrl}" style="display:inline-block;padding:10px 18px;background:#334155;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;">Open in the CRM</a>
</div>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** In-app notification for every member of the studio. */
async function notifyInApp(
  supabase: SupabaseClient,
  orgId: string,
  contactId: string,
  lead: LeadAlert,
): Promise<void> {
  const { data: members } = await supabase
    .from('profiles')
    .select('id')
    .eq('organization_id', orgId)

  if (!members?.length) return

  await supabase.from('notifications').insert(
    members.map((m: { id: string }) => ({
      user_id: m.id,
      type: 'new_lead',
      title: `New enquiry: ${lead.name}`,
      message: lead.description?.slice(0, 500) || lead.email || lead.phone || null,
      entity_type: 'contact',
      entity_id: contactId,
    })),
  )
}

/** Email alert. No-ops (with a log line) when RESEND_API_KEY is unset. */
async function notifyEmail(contactId: string, lead: LeadAlert): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) {
    console.warn('[ingest.notify] RESEND_API_KEY not set — no email sent for new lead')
    return
  }

  const contactUrl = `${SITE_URL}/contacts/${contactId}`
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: (process.env.RESEND_FROM_EMAIL || 'DreamersJoy <hello@dreamersjoystudio.com>').trim(),
      to: alertRecipients(),
      reply_to: lead.email || undefined,
      subject: `New enquiry: ${lead.name}`,
      text: plainText(lead, contactUrl),
      html: html(lead, contactUrl),
    }),
  })

  if (!res.ok) {
    console.error('[ingest.notify] Resend rejected the send:', res.status, await res.text().catch(() => ''))
  }
}

/**
 * Mark the enquiry as waiting on a human.
 *
 * Stamped here rather than at insert time on purpose: this function runs
 * exactly when a real person needs a reply, so a Stripe order or a newsletter
 * signup can never end up in the reminder sweep.
 */
async function markAwaitingReply(supabase: SupabaseClient, contactId: string): Promise<void> {
  await supabase
    .from('contacts')
    .update({ awaiting_reply_since: new Date().toISOString() })
    .eq('id', contactId)
    .is('replied_at', null)
}

/**
 * Fire both channels. Never throws — callers can await this without wrapping.
 */
export async function notifyNewLead(
  supabase: SupabaseClient,
  orgId: string,
  contactId: string,
  lead: LeadAlert,
): Promise<void> {
  const results = await Promise.allSettled([
    notifyInApp(supabase, orgId, contactId, lead),
    notifyEmail(contactId, lead),
    markAwaitingReply(supabase, contactId),
  ])

  for (const r of results) {
    if (r.status === 'rejected') console.error('[ingest.notify]', r.reason)
  }
}
