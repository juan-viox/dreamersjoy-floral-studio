/**
 * DreamersJoy Floral Studio — Arrangement Catalog
 *
 * Maps every arrangement SKU (as used across shop.html, mothers-day.html,
 * and the /order page) to its canonical name + price in cents.
 *
 * Prices here are the FINAL checkout price — the "+" suffixes shown on the
 * marketing pages (e.g. "$85+") are dropped to a fixed base price.
 *
 * To change a price: edit here (single source of truth).
 */

export interface Arrangement {
  id: string;
  name: string;
  /** Price in USD cents */
  amount: number;
  description: string;
  collection: string;
  size: string;
  /** Image path used in Stripe Checkout line item (relative to /cinematic/assets/images/) */
  image: string;
}

const BASE = '/cinematic/assets/images/';

export const CATALOG: Record<string, Arrangement> = {
  // ═══ MOTHER'S DAY — THE SPRING EDIT ═══
  'md-veiled-citrus-petite': {
    id: 'md-veiled-citrus-petite',
    name: "Mother's Day — Veiled Citrus (Petite)",
    amount: 9500, // $95
    description: 'Soft yellow, cream, fresh green. Ranunculus, sweet pea, jasmine vine.',
    collection: "Mother's Day — The Spring Edit",
    size: 'Petite',
    image: BASE + 'mothersday-veiled-citrus.png',
  },
  'md-veiled-citrus-signature': {
    id: 'md-veiled-citrus-signature',
    name: "Mother's Day — Veiled Citrus (Signature)",
    amount: 14500,
    description: 'Garden roses, ranunculus, butter-yellow tulips.',
    collection: "Mother's Day — The Spring Edit",
    size: 'Signature',
    image: BASE + 'mothersday-veiled-citrus.png',
  },
  'md-olive-air-petite': {
    id: 'md-olive-air-petite',
    name: "Mother's Day — Olive Air (Petite)",
    amount: 9500,
    description: 'Muted olive, ivory, soft white. Hellebore, white ranunculus, olive branch.',
    collection: "Mother's Day — The Spring Edit",
    size: 'Petite',
    image: BASE + 'mothersday-olive-air.png',
  },
  'md-olive-air-signature': {
    id: 'md-olive-air-signature',
    name: "Mother's Day — Olive Air (Signature)",
    amount: 14500,
    description: 'Tonal greens, ivory blooms, refined negative space.',
    collection: "Mother's Day — The Spring Edit",
    size: 'Signature',
    image: BASE + 'mothersday-olive-air.png',
  },
  'md-quiet-bloom-petite': {
    id: 'md-quiet-bloom-petite',
    name: "Mother's Day — Quiet Bloom (Petite)",
    amount: 9500,
    description: 'Blush, dusty rose, soft neutrals. Garden roses, lisianthus, scabiosa.',
    collection: "Mother's Day — The Spring Edit",
    size: 'Petite',
    image: BASE + 'mothersday-quiet-bloom.png',
  },
  'md-quiet-bloom-signature': {
    id: 'md-quiet-bloom-signature',
    name: "Mother's Day — Quiet Bloom (Signature)",
    amount: 14500,
    description: 'Full, romantic, composed with airy movement.',
    collection: "Mother's Day — The Spring Edit",
    size: 'Signature',
    image: BASE + 'mothersday-quiet-bloom.png',
  },
  'md-quiet-bloom-statement': {
    id: 'md-quiet-bloom-statement',
    name: "Mother's Day — Quiet Bloom (Statement)",
    amount: 19500,
    description: 'A sculptural, anchor piece in the Quiet Bloom palette.',
    collection: "Mother's Day — The Spring Edit",
    size: 'Statement',
    image: BASE + 'mothersday-quiet-bloom.png',
  },

  // ═══ COLLECTION I · SOFT GARDEN ═══
  'softgarden-petite': {
    id: 'softgarden-petite',
    name: 'Soft Garden — Petite',
    amount: 8500,
    description: 'Garden roses, ranunculus, sweet pea. Ivory, blush, pale peach, soft green.',
    collection: 'Collection I — Soft Garden',
    size: 'Petite',
    image: BASE + 'palette-softgarden-petite.png',
  },
  'softgarden-signature': {
    id: 'softgarden-signature',
    name: 'Soft Garden — Signature',
    amount: 12500,
    description: 'Garden roses, lisianthus, scabiosa. Fuller presence, airy feel.',
    collection: 'Collection I — Soft Garden',
    size: 'Signature',
    image: BASE + 'palette-softgarden-signature.png',
  },
  'softgarden-statement': {
    id: 'softgarden-statement',
    name: 'Soft Garden — Statement',
    amount: 17500,
    description: 'Garden roses, sweet pea, jasmine vine, spirea branches. Sculptural presence.',
    collection: 'Collection I — Soft Garden',
    size: 'Statement',
    image: BASE + 'palette-softgarden-statement.png',
  },

  // ═══ COLLECTION II · DUSTY ROMANTIC ═══
  'dustyromantic-petite': {
    id: 'dustyromantic-petite',
    name: 'Dusty Romantic — Petite',
    amount: 8500,
    description: 'Garden roses in deeper tones, scabiosa, astilbe. Mauve, antique rose, dusty blush.',
    collection: 'Collection II — Dusty Romantic',
    size: 'Petite',
    image: BASE + 'palette-dustyromantic-petite.png',
  },
  'dustyromantic-signature': {
    id: 'dustyromantic-signature',
    name: 'Dusty Romantic — Signature',
    amount: 12500,
    description: 'Garden roses, hellebore, scabiosa, astilbe. Rich and textured.',
    collection: 'Collection II — Dusty Romantic',
    size: 'Signature',
    image: BASE + 'palette-dustyromantic-signature.png',
  },
  'dustyromantic-statement': {
    id: 'dustyromantic-statement',
    name: 'Dusty Romantic — Statement',
    amount: 17500,
    description: 'Garden roses, scabiosa, astilbe, spirea. Softly dramatic.',
    collection: 'Collection II — Dusty Romantic',
    size: 'Statement',
    image: BASE + 'palette-dustyromantic-statement.png',
  },

  // ═══ COLLECTION III · CITRUS SCULPTURAL ═══
  'citrussculptural-petite': {
    id: 'citrussculptural-petite',
    name: 'Citrus Sculptural — Petite',
    amount: 8500,
    description: 'Garden roses, ranunculus, tulips. Apricot, coral, butter yellow.',
    collection: 'Collection III — Citrus Sculptural',
    size: 'Petite',
    image: BASE + 'palette-citrussculptural-petite.png',
  },
  'citrussculptural-signature': {
    id: 'citrussculptural-signature',
    name: 'Citrus Sculptural — Signature',
    amount: 12500,
    description: 'Garden roses, ranunculus, select orchid accents. Warm and structural.',
    collection: 'Collection III — Citrus Sculptural',
    size: 'Signature',
    image: BASE + 'palette-citrussculptural-signature.png',
  },
  'citrussculptural-statement': {
    id: 'citrussculptural-statement',
    name: 'Citrus Sculptural — Statement',
    amount: 17500,
    description: 'Garden roses, tulips, orchids, spirea. Modern and elevated.',
    collection: 'Collection III — Citrus Sculptural',
    size: 'Statement',
    image: BASE + 'palette-citrussculptural-statement.png',
  },

  // ═══ HAND-TIED BOUQUETS (Giftable) ═══
  'small-bouquet': {
    id: 'small-bouquet',
    name: 'The Small Bouquet',
    amount: 7500,
    description: 'A delicate, thoughtfully composed bouquet. Perfect for simple gestures.',
    collection: 'Giftable — Hand-Tied Bouquets',
    size: 'Small',
    image: BASE + 'bouquet-small.png',
  },
  'medium-bouquet': {
    id: 'medium-bouquet',
    name: 'The Medium Bouquet',
    amount: 9500,
    description: 'A balanced, fuller bouquet with a curated mix of seasonal florals.',
    collection: 'Giftable — Hand-Tied Bouquets',
    size: 'Medium',
    image: BASE + 'bouquet-medium.png',
  },
  'large-bouquet': {
    id: 'large-bouquet',
    name: 'The Large Bouquet',
    amount: 12500,
    description: 'An abundant, expressive bouquet with layered blooms and natural movement.',
    collection: 'Giftable — Hand-Tied Bouquets',
    size: 'Large',
    image: BASE + 'bouquet-large.png',
  },
  'signature-bouquet': {
    id: 'signature-bouquet',
    name: 'The Signature Bouquet',
    amount: 16500,
    description: 'A luxurious hand-tied bouquet featuring carefully selected stems.',
    collection: 'Giftable — Hand-Tied Bouquets',
    size: 'Signature',
    image: BASE + 'bouquet-signature.png',
  },
};

export function getArrangement(id: string): Arrangement | null {
  return CATALOG[id] || null;
}

/**
 * Mileage-based shipping options aligned with /delivery page:
 *   Local (0–10 mi):    $18 (free over $125 subtotal — enforced at session level)
 *   Extended (10–20 mi): $32
 *   Signature (20–30 mi): $55
 *   Concierge (30+ mi):  contact us (not offered in self-serve checkout)
 */
export const SHIPPING_OPTIONS = [
  {
    id: 'local',
    label: 'Local Delivery (0–10 miles)',
    amount: 1800, // $18
    detail: 'Bergen County inner ring. Complimentary on orders over $125.',
  },
  {
    id: 'extended',
    label: 'Extended Delivery (10–20 miles)',
    amount: 3200, // $32
    detail: 'Bergen County outer + select Passaic / Hudson towns.',
  },
  {
    id: 'signature',
    label: 'Signature Delivery (20–30 miles)',
    amount: 5500, // $55
    detail: 'Northern NJ + Manhattan. Minimum order $125.',
  },
];

/** Free-shipping threshold for Local zone (in cents) */
export const LOCAL_FREE_SHIPPING_THRESHOLD = 12500; // $125
