/**
 * Stripe server-side client. Import ONLY from server code (route handlers,
 * server actions) — never from client components.
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set. Add it to .env.local.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-03-25.dahlia',
  appInfo: {
    name: 'DreamersJoy Floral Studio',
    url: 'https://dreamersjoystudio.com',
  },
});
