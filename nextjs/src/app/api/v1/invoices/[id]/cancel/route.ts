/**
 * POST /api/v1/invoices/[id]/cancel
 *
 * Cancel an invoice AND take its Stripe payment link out of service.
 *
 * The second half is the point. Cancelling only the database row would leave a
 * live, payable link sitting in the customer's inbox — they could pay an
 * invoice the studio had already withdrawn, and the webhook would dutifully
 * mark the cancelled invoice paid.
 *
 * Authenticated here rather than in middleware, which waves all /api/ paths
 * through; the organization check is what authorises the write.
 */
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { deactivatePaymentLink } from '@/lib/invoices/paymentLink'

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

    const supabase = createAdminClient()

    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, organization_id, status, payment_link_id')
      .eq('id', id)
      .single()

    if (!invoice || invoice.organization_id !== profile.organization_id) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'That invoice is already paid — refund it in Stripe instead of cancelling.' },
        { status: 409 },
      )
    }

    // Kill the link first. If this fails it logs and returns rather than
    // throwing, so a Stripe outage can't block the cancellation — but the
    // order matters: never mark it cancelled while believing the link is dead.
    await deactivatePaymentLink(invoice.payment_link_id)

    await supabase
      .from('invoices')
      .update({ status: 'cancelled', payment_link_url: null })
      .eq('id', invoice.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[invoices] cancel failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not cancel that invoice.' },
      { status: 500 },
    )
  }
}
