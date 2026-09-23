/**
 * POST /api/v1/checkout/create-session
 *
 * Body: { arrangement_id: string, quantity?: number, card_message?: string,
 *         delivery_date?: string }
 *
 * Creates a Stripe Checkout Session for the requested arrangement and
 * returns { url, session_id } for the browser to redirect to.
 *
 * — Stripe Checkout collects shipping address, tax (if Stripe Tax enabled),
 *   and payment. We just pass the arrangement + mileage-based shipping
 *   options. Custom fields capture card_message + delivery_date so Sarah
 *   has the info she needs when fulfilling.
 */

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import {
  getArrangement,
  SHIPPING_OPTIONS,
  LOCAL_FREE_SHIPPING_THRESHOLD,
} from '@/lib/arrangement-catalog';
import { getOccasionCard } from '@/lib/occasion-cards';
import {
  processingFeeCents,
  PROCESSING_FEE_LABEL,
  PROCESSING_FEE_PERCENT,
} from '@/lib/pricing';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      arrangement_id,
      quantity = 1,
      card_message,
      card_occasion,
      delivery_date,
    } = body as {
      arrangement_id?: string;
      quantity?: number;
      card_message?: string;
      card_occasion?: string;
      delivery_date?: string;
    };

    if (!arrangement_id) {
      return NextResponse.json(
        { error: 'arrangement_id is required' },
        { status: 400 },
      );
    }

    // Every arrangement goes out with a handwritten card, so the card is not
    // optional — and it has to be chosen BEFORE payment, not chased up
    // afterwards. The browser disables its own button, but that is a
    // courtesy; this is the check that actually holds.
    const card = getOccasionCard(card_occasion);
    if (!card) {
      return NextResponse.json(
        { error: 'Choose a card before checking out.' },
        { status: 422 },
      );
    }

    const arrangement = getArrangement(arrangement_id);
    if (!arrangement) {
      return NextResponse.json(
        { error: `Unknown arrangement: ${arrangement_id}` },
        { status: 404 },
      );
    }

    // Safety: clamp quantity
    const qty = Math.min(Math.max(1, Number(quantity) || 1), 10);
    const subtotalCents = arrangement.amount * qty;
    const feeCents = processingFeeCents(subtotalCents);

    const origin = new URL(request.url).origin;

    // Build shipping options. Local zone gets free-over-$125 treatment by
    // swapping the $18 line item for $0 when subtotal clears the threshold.
    const shippingOptions = SHIPPING_OPTIONS.map((opt) => {
      const amount =
        opt.id === 'local' && subtotalCents >= LOCAL_FREE_SHIPPING_THRESHOLD
          ? 0
          : opt.amount;
      return {
        shipping_rate_data: {
          type: 'fixed_amount' as const,
          display_name: opt.label,
          fixed_amount: { amount, currency: 'usd' },
          delivery_estimate: {
            minimum: { unit: 'business_day' as const, value: 1 },
            maximum: { unit: 'business_day' as const, value: 3 },
          },
          metadata: {
            zone_id: opt.id,
            detail: opt.detail,
          },
        },
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      // Stripe Tax: set automatic_tax.enabled=true once Sarah activates
      // Stripe Tax in the dashboard. Until then, this remains false so
      // checkout doesn't error on unregistered jurisdictions.
      automatic_tax: {
        enabled: process.env.STRIPE_TAX_ENABLED === 'true',
      },
      line_items: [
        {
          quantity: qty,
          price_data: {
            currency: 'usd',
            product_data: {
              name: arrangement.name,
              description: arrangement.description,
              images: [origin + arrangement.image],
              metadata: {
                arrangement_id: arrangement.id,
                collection: arrangement.collection,
                size: arrangement.size,
              },
              tax_code: 'txcd_99999999', // General tangible goods
            },
            unit_amount: arrangement.amount,
            tax_behavior: 'exclusive',
          },
        },
        // What Stripe takes, put back on the bill rather than absorbed. Its
        // own line so the customer can see exactly what it is — the same way
        // the studio's other shop presents it.
        ...(feeCents > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: 'usd' as const,
                  product_data: {
                    name: PROCESSING_FEE_LABEL,
                    description:
                      'Covers card processing and secure handling of your order.',
                    tax_code: 'txcd_99999999',
                  },
                  unit_amount: feeCents,
                  tax_behavior: 'exclusive' as const,
                },
              },
            ]
          : []),
      ],
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      shipping_options: shippingOptions,
      phone_number_collection: { enabled: true },
      // Stripe allows at most three custom fields, and the card occasion is
      // already chosen on the site before we get here — so these three are
      // the ones that still need asking.
      custom_fields: [
        {
          key: 'card_message',
          label: { type: 'custom', custom: `Message for your ${card.label} card` },
          type: 'text',
          optional: true,
          text: { maximum_length: 240 },
        },
        {
          key: 'delivery_date',
          label: { type: 'custom', custom: 'Requested delivery date' },
          type: 'text',
          optional: true,
          text: { maximum_length: 24 },
        },
        {
          key: 'recipient_name',
          label: { type: 'custom', custom: 'Recipient name (if a gift)' },
          type: 'text',
          optional: true,
          text: { maximum_length: 120 },
        },
      ],
      metadata: {
        arrangement_id: arrangement.id,
        arrangement_name: arrangement.name,
        collection: arrangement.collection,
        size: arrangement.size,
        card_message: card_message?.slice(0, 240) || '',
        card_occasion: card.label,
        card_occasion_id: card.id,
        delivery_date: delivery_date?.slice(0, 24) || '',
        processing_fee_percent: String(PROCESSING_FEE_PERCENT),
        processing_fee_cents: String(feeCents),
        source: 'dreamersjoy_web_checkout',
      },
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/order/cancel`,
      // 30 minute cart expiration
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    return NextResponse.json({
      url: session.url,
      session_id: session.id,
    });
  } catch (err) {
    console.error('[checkout.create-session] Failed:', err);
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json(
      { error: 'Failed to create checkout session', detail: message },
      { status: 500 },
    );
  }
}
