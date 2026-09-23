/**
 * The enclosure cards the studio keeps printed.
 *
 * Every order goes out with one, handwritten. This list is the single
 * source of truth: the shop renders the dropdown from it, the checkout
 * route validates against it, and the Stripe webhook writes the chosen
 * one into the CRM so it is on the build sheet when the order is made.
 *
 * Keep it in step with the printed stock — offering a card at checkout
 * that isn't in the drawer is a promise the studio can't keep.
 */

export type OccasionCard = {
  /** Stable id. Matches the printed PDF filename. */
  id: string
  /** Exactly as it reads on the front of the card. */
  label: string
}

export const OCCASION_CARDS: OccasionCard[] = [
  { id: 'happy-birthday', label: 'Happy Birthday' },
  { id: 'happy-anniversary', label: 'Happy Anniversary' },
  { id: 'thinking-of-you', label: 'Thinking of You' },
  { id: 'i-love-you', label: 'I Love You' },
  { id: 'get-well-soon', label: 'Get Well Soon' },
  { id: 'congratulations', label: 'Congratulations' },
  { id: 'thank-you', label: 'Thank You' },
  { id: 'with-sympathy', label: 'With Sympathy' },
  { id: 'welcome-baby', label: 'Welcome, Baby' },
  { id: 'happy-mothers-day', label: "Happy Mother's Day" },
  { id: 'happy-fathers-day', label: "Happy Father's Day" },
  { id: 'happy-valentines', label: "Happy Valentine's Day" },
  { id: 'happy-holidays', label: 'Happy Holidays' },
  { id: 'welcome-home', label: 'Welcome Home' },
  { id: 'just-because', label: 'Just Because' },
  { id: 'blank', label: 'No printed occasion — blank card' },
]

const BY_ID = new Map(OCCASION_CARDS.map((c) => [c.id, c]))

export function getOccasionCard(id: string | null | undefined): OccasionCard | null {
  if (!id) return null
  return BY_ID.get(id.trim()) ?? null
}
