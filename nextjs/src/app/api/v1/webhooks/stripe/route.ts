/**
 * POST /api/v1/webhooks/stripe
 *
 * Stripe webhook receiver. Verifies the signature, then on
 * `checkout.session.completed`:
 *   1. Creates a Supabase contact (source=stripe_order) with full order
 *      details in the `notes` field.
 *   2. Sends Sarah a notification email via the existing CRM ingest API.
 *
 * To configure: in Stripe dashboard → Developers → Webhooks → Add endpoint
 *   URL:    https://dreamersjoystudio.com/api/v1/webhooks/stripe
 *   Events: checkout.session.completed, checkout.session.async_payment_succeeded
 * Copy the signing secret into STRIPE_WEBHOOK_SECRET in .env.local (and in
 * your Vercel project env vars).
 */

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';

// Force this route to run on the Node runtime (needed for stripe.webhooks.constructEvent)
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!signature || !webhookSecret) {
    console.error('[stripe.webhook] Missing signature or webhook secret');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 400 },
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('[stripe.webhook] Signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 },
    );
  }

  // We care about checkout completion (both sync and async payment success)
  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await handleCheckoutComplete(session);
    } catch (err) {
      console.error('[stripe.webhook] handleCheckoutComplete error:', err);
      // Return 200 so Stripe doesn't retry — we've logged the error
      // and can backfill manually if needed.
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  // Pull the customer info Stripe collected
  const email = session.customer_details?.email || session.customer_email || '';
  const fullName = session.customer_details?.name || '';
  const phone = session.customer_details?.phone || '';
  const [firstName, ...lastParts] = fullName.split(' ').filter(Boolean);
  const lastName = lastParts.join(' ') || '';

  const shipping = session.collected_information?.shipping_details || null;
  const address = shipping?.address;
  const shippingLines = address
    ? [
        address.line1,
        address.line2,
        [address.city, address.state, address.postal_code].filter(Boolean).join(', '),
        address.country,
      ]
        .filter(Boolean)
        .join(' • ')
    : '';

  // Custom fields (card message, delivery date, recipient name)
  const customFields = (session.custom_fields || []).reduce<Record<string, string>>(
    (acc, f) => {
      const val =
        (f.text?.value as string | undefined) ||
        (f.dropdown?.value as string | undefined) ||
        '';
      if (val) acc[f.key] = val;
      return acc;
    },
    {},
  );

  const metadata = session.metadata || {};
  const totalCents = session.amount_total ?? 0;
  const totalDollars = (totalCents / 100).toFixed(2);

  const notes = [
    `STRIPE ORDER — ${metadata.arrangement_name || metadata.arrangement_id || 'Arrangement'}`,
    `Session: ${session.id}`,
    `Total: $${totalDollars} ${(session.currency || 'usd').toUpperCase()}`,
    `Collection: ${metadata.collection || ''}`,
    `Size: ${metadata.size || ''}`,
    shippingLines ? `Ship to: ${fullName}  •  ${shippingLines}` : '',
    customFields.recipient_name ? `Recipient: ${customFields.recipient_name}` : '',
    customFields.card_message ? `Card message: "${customFields.card_message}"` : '',
    customFields.delivery_date ? `Requested delivery: ${customFields.delivery_date}` : '',
    phone ? `Phone: ${phone}` : '',
  ]
    .filter(Boolean)
    .join(' | ');

  // Route both the customer contact + the order notification through the
  // existing /api/v1/ingest/lead endpoint. That endpoint already handles
  // organization_id resolution (looks up the API key → site → org), which
  // is a NOT NULL column we can't populate directly from here.
  // Defensive .trim() on every env var — Vercel occasionally stores values
  // with trailing whitespace/newlines depending on how they were added.
  const apiKey = process.env.SITE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'SITE_API_KEY env var is required. Set it in Vercel project Environment Variables (production) or .env.local (local).',
    );
  }
  const origin = new URL(
    (process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamersjoystudio.com').trim(),
  ).origin;
  const notificationEmail = (
    process.env.ORDER_NOTIFICATION_EMAIL || 'hello@dreamersjoystudio.com'
  ).trim();

  async function postLead(payload: Record<string, string>) {
    const res = await fetch(`${origin}/api/v1/ingest/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error('[stripe.webhook] ingest/lead failed:', res.status, txt);
    }
    return res;
  }

  // NOTE: The contacts table has a CHECK constraint allowing only
  // 'manual' | 'newsletter' | 'web_form' for the source column. We use
  // 'web_form' as the tag here — Stripe orders are uniquely identifiable
  // because their notes field always begins with "STRIPE ORDER —".
  //
  // 1. The customer contact
  if (email) {
    await postLead({
      firstName: firstName || 'Stripe',
      lastName: lastName || 'Customer',
      email,
      phone: phone || '',
      description: notes,
      source: 'web_form',
    });
  }

  // 2. A notification "lead" to Sarah's inbox. firstName="NEW ORDER" so it
  //    sorts to the top of her CRM — she sees the order without logging
  //    into Stripe.
  await postLead({
    firstName: 'NEW ORDER',
    lastName: metadata.arrangement_name || 'Arrangement',
    email: notificationEmail,
    phone: '',
    description: notes,
    source: 'web_form',
  });
}
