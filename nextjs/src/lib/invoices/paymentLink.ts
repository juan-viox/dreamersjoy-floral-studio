/**
 * The "Pay now" button on an invoice.
 *
 * Deliberately a Stripe **Payment Link**, not a Checkout Session. A Checkout
 * Session expires after 24 hours, which is fine for a shop and wrong for an
 * invoice — an invoice may sit in somebody's inbox for a fortnight before they
 * get round to it, and a dead link at that moment reads as a broken business.
 * Payment Links do not expire.
 *
 * The link is created once and reused. Re-creating it on every send would
 * leave a trail of live links to the same money, any of which could be paid.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import crmConfig from '@/crm.config'

export type InvoiceForLink = {
  id: string
  invoice_number: string
  total: number | string
  payment_link_url: string | null
  payment_link_id: string | null
}

/** Whole dollars → integer cents, the only unit Stripe accepts. */
function toCents(total: number | string): number {
  const n = typeof total === 'string' ? Number(total) : total
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error('This invoice has no payable total.')
  }
  return Math.round(n * 100)
}

/**
 * Return the invoice's payment link, creating it on first use.
 *
 * Writes the link back to the invoice row so the next call is free and so the
 * webhook has something to match an incoming payment against.
 */
export async function ensurePaymentLink(
  supabase: SupabaseClient,
  invoice: InvoiceForLink,
): Promise<string> {
  if (invoice.payment_link_url) return invoice.payment_link_url

  const amount = toCents(invoice.total)

  // An inline product rather than one from the catalogue: this charge is for
  // a specific invoice, and it should read that way on the customer's
  // statement and in the Stripe dashboard.
  const price = await stripe.prices.create({
    currency: 'usd',
    unit_amount: amount,
    product_data: { name: `${crmConfig.name} — Invoice ${invoice.invoice_number}` },
  })

  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    // Read back by the Stripe webhook to mark this exact invoice paid.
    metadata: { invoice_id: invoice.id, invoice_number: invoice.invoice_number },
    payment_intent_data: {
      metadata: { invoice_id: invoice.id, invoice_number: invoice.invoice_number },
    },
    after_completion: {
      type: 'hosted_confirmation',
      hosted_confirmation: {
        custom_message: `Thank you — your payment for invoice ${invoice.invoice_number} has been received. A receipt is on its way to your email.`,
      },
    },
  })

  const { error } = await supabase
    .from('invoices')
    .update({ payment_link_url: link.url, payment_link_id: link.id })
    .eq('id', invoice.id)

  if (error) {
    // The link exists in Stripe but we failed to record it. Say so loudly:
    // silently returning it would orphan a live payment link that no webhook
    // could ever match back to this invoice.
    console.error('[invoices] created a payment link but could not store it:', error.message)
    throw new Error('Could not save the payment link. Try again.')
  }

  return link.url
}

/**
 * Stop a link being payable — used when an invoice is cancelled.
 *
 * Never throws: cancelling an invoice must succeed even if Stripe is having a
 * bad day. A still-live link on a cancelled invoice is logged for a human.
 */
export async function deactivatePaymentLink(paymentLinkId: string | null): Promise<void> {
  if (!paymentLinkId) return
  try {
    await stripe.paymentLinks.update(paymentLinkId, { active: false })
  } catch (err) {
    console.error('[invoices] could not deactivate payment link', paymentLinkId, err)
  }
}
