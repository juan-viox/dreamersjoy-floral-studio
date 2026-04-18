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
import { createClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

// Force this route to run on the Node runtime (needed for stripe.webhooks.constructEvent)
export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
        .join(' \u2022 ')
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
    shippingLines ? `Ship to: ${fullName}  \u2022  ${shippingLines}` : '',
    customFields.recipient_name ? `Recipient: ${customFields.recipient_name}` : '',
    customFields.card_message ? `Card message: "${customFields.card_message}"` : '',
    customFields.delivery_date ? `Requested delivery: ${customFields.delivery_date}` : '',
    phone ? `Phone: ${phone}` : '',
  ]
    .filter(Boolean)
    .join(' | ');

  // 1. Create / upsert CRM contact (source=stripe_order)
  const { error: contactError } = await supabase.from('contacts').insert({
    first_name: firstName || 'Stripe',
    last_name: lastName || 'Customer',
    email,
    phone: phone || null,
    source: 'stripe_order',
    notes,
  });

  if (contactError) {
    console.error('[stripe.webhook] Supabase contact insert failed:', contactError);
  }

  // 2. Fire a notification "newsletter"-style email lead to Sarah
  //    using the existing /api/v1/ingest/lead infra. This keeps the
  //    notification path consistent with other site events and lets
  //    Sarah see the order in her CRM inbox.
  const notificationEmail = process.env.ORDER_NOTIFICATION_EMAIL || 'hello@dreamersjoystudio.com';
  const apiKey = process.env.INGEST_API_KEY || '8e2c0eaeca4b01990e4f60b660afa52d7ee93c15c9d1b5a2c8a138b9853f33aa';
  try {
    const origin = new URL(
      process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamersjoystudio.com',
    ).origin;
    await fetch(`${origin}/api/v1/ingest/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({
        firstName: 'NEW ORDER',
        lastName: metadata.arrangement_name || 'Arrangement',
        email: notificationEmail,
        phone: '',
        description: notes,
        source: 'stripe_order_notification',
      }),
    });
  } catch (err) {
    console.error('[stripe.webhook] Order notification dispatch failed:', err);
  }
}
