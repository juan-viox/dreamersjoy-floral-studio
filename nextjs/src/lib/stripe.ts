/**
 * Stripe server-side client. Import ONLY from server code (route handlers,
 * server actions) — never from client components.
 *
 * Lazy-initialized so that build-time module evaluation (e.g. Next.js
 * collecting routes during `next build`) doesn't throw when STRIPE_SECRET_KEY
 * isn't present. The actual Stripe instance is created on first access,
 * which only happens at runtime when a request comes in.
 */

import Stripe from 'stripe';

let cachedStripe: Stripe | null = null;

function getStripe(): Stripe {
  if (cachedStripe) return cachedStripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Add it to .env.local (local) or ' +
        'Vercel project Environment Variables (production).',
    );
  }
  cachedStripe = new Stripe(key, {
    apiVersion: '2026-03-25.dahlia',
    appInfo: {
      name: 'DreamersJoy Floral Studio',
      url: 'https://dreamersjoystudio.com',
    },
  });
  return cachedStripe;
}

/**
 * Proxy that defers Stripe client creation until first actual use.
 * Callers use `stripe.checkout.sessions.create(...)` as normal; the
 * Stripe constructor only runs when a method/property is accessed.
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const real = getStripe();
    const value = (real as unknown as Record<string | symbol, unknown>)[prop as string | symbol];
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(real) : value;
  },
});
