/**
 * The studio's order terms.
 *
 * These exist to set an expectation before someone pays, which is the only
 * moment at which a term actually protects anybody. They are repeated in
 * three places on purpose: the shop modal (before Add to Cart), the Stripe
 * checkout page (above the Pay button), and the footer of the invoice that
 * lands in the customer's inbox afterwards.
 *
 * The full text also lives at /cinematic/terms.html for the public page.
 * If you change the wording here, change it there too — they are deliberate
 * duplicates rather than a shared fetch, because a terms page has to render
 * for someone with JavaScript switched off.
 *
 * Written as plain trade terms, not legal drafting. Worth having a lawyer
 * read once if the studio ever wants certainty rather than clarity.
 */

/**
 * How long before the delivery date an order can still be changed.
 *
 * Deliberately longer than the studio's own buying lead time. Stems are
 * bought roughly two days ahead, so a 48-hour window let a customer cancel
 * at the exact moment the flowers were being paid for. The window has to
 * close before the studio spends money, not alongside it.
 */
export const CHANGE_WINDOW_HOURS = 72

/** How long after delivery a problem can be reported. */
export const ISSUE_WINDOW_HOURS = 24

export type Term = { heading: string; body: string }

export const ORDER_TERMS: Term[] = [
  {
    heading: 'Every arrangement is one of a kind',
    body:
      'Each piece is designed and built by hand, in the studio, for your order. ' +
      'No two are ever identical — that is rather the point of them. The photographs ' +
      'on this site show a representative example of a palette and a scale, not the ' +
      'exact stems you will receive.',
  },
  {
    heading: 'We build with what is in season',
    body:
      'Flowers are seasonal and the market changes week to week. We buy what is at ' +
      'its best on the day rather than forcing a variety that has gone over or has ' +
      'not yet arrived. This is why the work looks different in October than it does ' +
      'in May, and why it is worth what it is.',
  },
  {
    heading: 'Substitutions',
    body:
      'If a flower named in a description is unavailable, or is not up to standard on ' +
      'the day, we replace it with another of similar value, tone and character, ' +
      'keeping the palette and the feeling of the piece intact. We never substitute ' +
      'downward in value. Because substitution is part of how seasonal work is made, ' +
      'it is not grounds for a refund.',
  },
  {
    heading: 'Vessels',
    body:
      'Vessel measurements are approximate and given as a guide to scale. Style and ' +
      'dimensions vary with what is available. Where a particular vessel cannot be ' +
      'sourced we use an equivalent of similar size, material and character.',
  },
  {
    heading: 'Delivery',
    body:
      'The date you give us is a request, and we confirm it by email — please treat ' +
      'an order as scheduled only once you have that confirmation. Delivery is priced ' +
      'by distance from the studio in Wyckoff. Please check the recipient’s address ' +
      'carefully; we cannot be responsible for flowers delivered to an address given ' +
      'to us in error. If nobody is home we leave the arrangement in a shaded, ' +
      'sheltered spot and let you know.',
  },
  {
    heading: 'Changes and cancellations',
    body:
      `Tell us at least ${CHANGE_WINDOW_HOURS} hours before the delivery date and we ` +
      'will change or cancel an order without charge. After that we have bought the ' +
      'flowers for your piece specifically — they are cut, they are yours, and they ' +
      'cannot go back — so we are not able to refund it. For larger pieces we buy ' +
      'further ahead and will say so when we confirm your date.',
  },
  {
    heading: 'If something is not right',
    body:
      `Write to us within ${ISSUE_WINDOW_HOURS} hours of delivery with a photograph ` +
      'and we will put it right — a replacement or a refund, whichever suits you ' +
      'better. We would always rather know.',
  },
  {
    heading: 'Fresh flowers are perishable',
    body:
      'Vase life varies by variety, by season and by where the arrangement is kept. ' +
      'Every delivery comes with a care note. Flowers kept in direct sun, near heat, ' +
      'or beside ripening fruit will fade faster than the same flowers kept cool.',
  },
  {
    heading: 'Prices',
    body:
      'All prices are in US dollars. A processing and handling charge of 3.5% is ' +
      'added at checkout and shown as its own line. Delivery is $18 within about ' +
      'nine miles of the studio and complimentary there on orders over $125, $15 ' +
      'out to roughly fifteen miles, and $45 beyond that. You give us the delivery ' +
      'postcode and we show you the price — there is nothing to work out.',
  },
]

/**
 * The short form, for the line above Stripe's Pay button.
 * Stripe caps custom_text.submit.message at 1200 characters.
 */
export const TERMS_SUMMARY =
  'Every arrangement is made by hand and no two are identical — the photograph ' +
  'shows a representative example, not the exact stems. We build with what is in ' +
  'season, and if a flower is unavailable we substitute one of similar value and ' +
  'tone, keeping the palette intact. Vessel sizes are approximate and vary with ' +
  'availability. Your delivery date is confirmed by email. Full terms: ' +
  'dreamersjoystudio.com/terms'

/** The invoice footer. Stripe allows up to 5000 characters. */
export const INVOICE_FOOTER = [
  ORDER_TERMS.map((t) => `${t.heading} — ${t.body}`).join('\n\n'),
  '',
  'DreamersJoy Floral Studio · Wyckoff, NJ · dreamersjoystudio.com',
  'Questions about this order: sarah@dreamersjoystudio.com',
].join('\n')
