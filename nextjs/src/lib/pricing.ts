/**
 * What the studio actually keeps.
 *
 * Aviva's order was $125 and paid out $119.20 — Stripe took $5.80, because
 * she paid on an international card (2.9% + 1.5% + $0.30). Nothing on the
 * site accounted for that, so every sale quietly cost the studio its fee.
 *
 * The fee line puts it back, shown to the customer rather than buried, in
 * the same way the studio's other shop does it.
 */

/**
 * Percentage added as "Processing & Handling".
 *
 * 3.5%, not 3%. Stripe's domestic card rate is 2.9% + $0.30, and that flat
 * 30 cents is what a flat 3% misses: on a $75 bouquet the real cost is 3.3%,
 * on a $125 arrangement 3.14%. An international card adds another 1.5% on
 * top. 3.5% covers every domestic order in full and most of the rest.
 *
 * Override with PROCESSING_FEE_PERCENT if the studio's rate changes.
 */
export const PROCESSING_FEE_PERCENT = (() => {
  const raw = Number(process.env.PROCESSING_FEE_PERCENT)
  return Number.isFinite(raw) && raw >= 0 && raw <= 10 ? raw : 3.5
})()

/** Label the customer sees on the Stripe receipt and at checkout. */
export const PROCESSING_FEE_LABEL = `Processing & Handling (${PROCESSING_FEE_PERCENT}%)`

/**
 * The fee on a subtotal, in whole cents, rounded to the nearest cent.
 *
 * Deliberately computed on the arrangement subtotal only. Delivery is chosen
 * inside Stripe Checkout, after this session is built, so its amount is not
 * knowable here — which means the fee slightly under-recovers on a delivered
 * order. Under-charging by a few cents is the right way to be wrong.
 */
export function processingFeeCents(subtotalCents: number): number {
  if (!Number.isFinite(subtotalCents) || subtotalCents <= 0) return 0
  return Math.round((subtotalCents * PROCESSING_FEE_PERCENT) / 100)
}
