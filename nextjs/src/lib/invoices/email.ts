/**
 * Emailing an invoice to the person who owes it.
 *
 * The CRM could already write an invoice and print one. It could not put one
 * in front of a customer — "Send" logged an activity and told the studio to
 * "configure email integration". This is that integration.
 *
 * The mail carries the figures inline (most people never open an attachment),
 * a Pay now button, and a link to the full printable invoice.
 */
import crmConfig from '@/crm.config'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamersjoystudio.com').trim()

/** Replies go to the studio, never to the no-reply sending domain. */
const REPLY_TO = (process.env.INVOICE_REPLY_TO || 'sarah@dreamersjoystudio.com').trim()

export type InvoiceEmailInput = {
  invoiceId: string
  invoiceNumber: string
  to: string
  customerName: string
  total: number
  dueDate: string | null
  notes: string | null
  items: { description: string; quantity: number; total: number }[]
  payUrl: string | null
}

const money = (n: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const longDate = (d: string): string =>
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: crmConfig.settings.timezone,
  }).format(new Date(d))

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function plainText(input: InvoiceEmailInput, viewUrl: string): string {
  return [
    `Hello ${input.customerName},`,
    '',
    `Please find invoice ${input.invoiceNumber} from ${crmConfig.name}.`,
    '',
    ...input.items.map((i) => `  ${i.quantity} x ${i.description} — ${money(i.total)}`),
    '',
    `Total due: ${money(input.total)}`,
    input.dueDate ? `Due: ${longDate(input.dueDate)}` : null,
    '',
    input.payUrl ? `Pay online: ${input.payUrl}` : null,
    `View the invoice: ${viewUrl}`,
    '',
    input.notes ? `${input.notes}\n` : null,
    `With thanks,`,
    crmConfig.name,
    crmConfig.website,
  ]
    .filter((l) => l !== null)
    .join('\n')
}

function html(input: InvoiceEmailInput, viewUrl: string): string {
  const accent = crmConfig.branding.accentColor
  const dark = crmConfig.branding.darkColor

  const rows = input.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;font-size:14px;border-bottom:1px solid #eee;">${escapeHtml(i.description)}</td>
        <td style="padding:8px 0;font-size:14px;border-bottom:1px solid #eee;text-align:right;color:#6b7280;">${i.quantity}</td>
        <td style="padding:8px 0;font-size:14px;border-bottom:1px solid #eee;text-align:right;">${money(i.total)}</td>
      </tr>`,
    )
    .join('')

  return `<div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px;color:${dark};">
  <p style="font-size:15px;margin:0 0 16px;">Hello ${escapeHtml(input.customerName)},</p>
  <p style="font-size:15px;margin:0 0 24px;">
    Please find invoice <strong>${escapeHtml(input.invoiceNumber)}</strong> from ${escapeHtml(crmConfig.name)}.
  </p>

  <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
    <thead>
      <tr>
        <th style="text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;padding-bottom:6px;">Description</th>
        <th style="text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;padding-bottom:6px;">Qty</th>
        <th style="text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;padding-bottom:6px;">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <p style="text-align:right;font-size:18px;margin:16px 0 4px;">
    <span style="color:#6b7280;font-size:14px;">Total due</span>
    &nbsp;<strong>${money(input.total)}</strong>
  </p>
  ${
    input.dueDate
      ? `<p style="text-align:right;font-size:13px;color:#6b7280;margin:0 0 24px;">Due ${longDate(input.dueDate)}</p>`
      : '<div style="height:24px;"></div>'
  }

  ${
    input.payUrl
      ? `<p style="margin:0 0 12px;">
           <a href="${input.payUrl}" style="display:inline-block;padding:12px 24px;background:${accent};color:#fff;text-decoration:none;border-radius:6px;font-size:15px;">Pay ${money(input.total)}</a>
         </p>`
      : ''
  }
  <p style="margin:0 0 24px;font-size:14px;">
    <a href="${viewUrl}" style="color:${accent};">View or print the full invoice</a>
  </p>

  ${
    input.notes
      ? `<p style="font-size:14px;color:#6b7280;white-space:pre-wrap;border-top:1px solid #eee;padding-top:16px;margin:0 0 24px;">${escapeHtml(input.notes)}</p>`
      : ''
  }

  <p style="font-size:14px;margin:0;">With thanks,<br/>${escapeHtml(crmConfig.name)}</p>
  <p style="font-size:13px;color:#6b7280;margin:4px 0 0;">
    ${escapeHtml(crmConfig.website)} &nbsp;·&nbsp; ${escapeHtml(crmConfig.phone)}
  </p>
</div>`
}

/**
 * Send it. Throws on failure — unlike the alert emails, the studio is standing
 * at the screen waiting to hear whether this reached the customer, so a silent
 * no-op would be a lie.
 */
export async function sendInvoiceEmail(input: InvoiceEmailInput): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) {
    throw new Error('RESEND_API_KEY is not set, so the invoice cannot be emailed.')
  }

  const viewUrl = `${SITE_URL}/api/v1/invoices/${input.invoiceId}/pdf`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: (process.env.RESEND_FROM_EMAIL || `${crmConfig.name} <hello@dreamersjoystudio.com>`).trim(),
      to: [input.to],
      reply_to: REPLY_TO,
      subject: `Invoice ${input.invoiceNumber} from ${crmConfig.name}`,
      text: plainText(input, viewUrl),
      html: html(input, viewUrl),
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('[invoices] Resend rejected the send:', res.status, detail)
    throw new Error('The email service rejected that send.')
  }
}
