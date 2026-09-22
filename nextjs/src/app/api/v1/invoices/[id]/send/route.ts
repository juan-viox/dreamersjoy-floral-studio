/**
 * POST /api/v1/invoices/[id]/send
 *
 * Create the invoice's Stripe payment link if it hasn't got one, email the
 * invoice to the contact, then mark it sent and log the activity.
 *
 * Authenticated as the signed-in studio member. `middleware.ts` waves every
 * /api/ path through without an auth check (so the ingest and webhook routes
 * can work), which means the check has to happen here — and it has to confirm
 * the invoice belongs to the caller's organization, not merely that somebody
 * is signed in.
 */
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensurePaymentLink } from '@/lib/invoices/paymentLink'
import { sendInvoiceEmail } from '@/lib/invoices/email'

export const dynamic = 'force-dynamic'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const auth = await createServerSupabaseClient()
    const {
      data: { user },
    } = await auth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
    }

    const { data: profile } = await auth
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization' }, { status: 403 })
    }

    // Admin client from here: the writes below (payment link, sent_at) are
    // ours to make, but the organization check above is what authorises them.
    const supabase = createAdminClient()

    const { data: invoice } = await supabase
      .from('invoices')
      .select(
        'id, organization_id, invoice_number, status, total, due_date, notes, payment_link_url, payment_link_id, contact_id, contact:contacts(first_name, last_name, email)',
      )
      .eq('id', id)
      .single()

    if (!invoice || invoice.organization_id !== profile.organization_id) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const contact = invoice.contact as unknown as {
      first_name: string | null
      last_name: string | null
      email: string | null
    } | null

    if (!contact?.email) {
      return NextResponse.json(
        { error: 'That contact has no email address, so there is nowhere to send it.' },
        { status: 422 },
      )
    }

    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'That invoice is already paid.' },
        { status: 409 },
      )
    }
    if (invoice.status === 'cancelled') {
      return NextResponse.json(
        { error: 'That invoice is cancelled. Reopen it before sending.' },
        { status: 409 },
      )
    }

    const { data: items } = await supabase
      .from('invoice_items')
      .select('description, quantity, total')
      .eq('invoice_id', id)
      .order('sort_order')

    // A link failure must not stop the invoice reaching the customer — they
    // can still pay by other means, and an invoice nobody received is worse
    // than one without a button.
    let payUrl: string | null = null
    try {
      payUrl = await ensurePaymentLink(supabase, invoice)
    } catch (err) {
      console.error('[invoices] no payment link for', invoice.invoice_number, err)
    }

    await sendInvoiceEmail({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      to: contact.email,
      customerName: [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'there',
      total: Number(invoice.total),
      dueDate: invoice.due_date ?? null,
      notes: invoice.notes ?? null,
      items: (items ?? []).map((i) => ({
        description: i.description,
        quantity: Number(i.quantity),
        total: Number(i.total),
      })),
      payUrl,
    })

    const sentAt = new Date().toISOString()
    await supabase
      .from('invoices')
      .update({
        sent_at: sentAt,
        // An invoice that was overdue stays overdue; resending doesn't reset it.
        status: invoice.status === 'draft' ? 'sent' : invoice.status,
      })
      .eq('id', invoice.id)

    await supabase.from('activities').insert({
      organization_id: invoice.organization_id,
      contact_id: invoice.contact_id,
      type: 'email',
      title: `Invoice ${invoice.invoice_number} emailed`,
      description: payUrl
        ? `Sent to ${contact.email} with a payment link.`
        : `Sent to ${contact.email}. No payment link — see the logs.`,
      status: 'completed',
      completed_at: sentAt,
      metadata: { invoice_id: invoice.id },
    })

    return NextResponse.json({ success: true, sentTo: contact.email, payUrl })
  } catch (err) {
    console.error('[invoices] send failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not send that invoice.' },
      { status: 500 },
    )
  }
}
