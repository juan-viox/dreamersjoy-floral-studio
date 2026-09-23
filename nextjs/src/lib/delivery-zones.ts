/**
 * Which delivery zone a postcode falls in.
 *
 * Checkout used to offer three bands labelled by mileage — 0–10, 10–20,
 * 20–30 — and ask the customer to pick one. Nobody knows their mileage from
 * Wyckoff. They know their town, and faced with a free option and two paid
 * ones they choose the free one, which left the studio finding out where an
 * order was really going while loading the car.
 *
 * So the customer gives a postcode and we decide. They never see a band.
 *
 * The town lists are the studio's own. An unrecognised postcode is NOT
 * refused: it falls through to `null`, the checkout offers all three zones as
 * before, and the studio confirms by email. Losing a sale to a postcode this
 * table has not heard of would be far worse than a short conversation.
 */

export type ZoneId = 'local' | 'extended' | 'signature'

/**
 * Exact five-digit postcodes, by zone. Compiled from the studio's own town
 * list — worth spot-checking against the towns you actually serve, since a
 * postcode in the wrong band either undercharges you or overcharges a
 * customer.
 */
const ZONE_BY_ZIP: Record<string, ZoneId> = {}

const LOCAL_TOWNS: Array<[string, string[]]> = [
  ['Wyckoff', ['07481']],
  ['Franklin Lakes', ['07417']],
  ['Ridgewood', ['07450', '07451']],
  ['Midland Park', ['07432']],
  ['Waldwick', ['07463']],
  ['Allendale', ['07401']],
  ['Ho-Ho-Kus', ['07423']],
  ['Glen Rock', ['07452']],
  ['Oakland', ['07436']],
  ['Saddle River', ['07458']],
]

const EXTENDED_TOWNS: Array<[string, string[]]> = [
  ['Paramus', ['07652', '07653']],
  ['Hackensack', ['07601', '07602']],
  ['Teaneck', ['07666']],
  ['Englewood', ['07631']],
  ['Englewood Cliffs', ['07632']],
  ['Fair Lawn', ['07410']],
  ['Hawthorne', ['07506']],
  ['Mahwah', ['07430']],
  ['Ramsey', ['07446']],
  ['Kinnelon', ['07405']],
]

const SIGNATURE_TOWNS: Array<[string, string[]]> = [
  ['Montclair', ['07042', '07043', '07044']],
  ['Clifton', ['07011', '07012', '07013', '07014']],
  ['Newark', ['07102', '07103', '07104', '07105', '07106', '07107', '07108']],
  ['Jersey City', ['07302', '07304', '07305', '07306', '07307', '07310', '07311']],
]

for (const [, zips] of LOCAL_TOWNS) for (const z of zips) ZONE_BY_ZIP[z] = 'local'
for (const [, zips] of EXTENDED_TOWNS) for (const z of zips) ZONE_BY_ZIP[z] = 'extended'
for (const [, zips] of SIGNATURE_TOWNS) for (const z of zips) ZONE_BY_ZIP[z] = 'signature'

/** Manhattan is the whole 100xx / 101xx / 102xx range — too many to list. */
const SIGNATURE_PREFIXES = ['100', '101', '102']

/** Town names per zone, for telling the customer where they landed. */
export const ZONE_TOWNS: Record<ZoneId, string[]> = {
  local: LOCAL_TOWNS.map(([t]) => t),
  extended: EXTENDED_TOWNS.map(([t]) => t),
  signature: [...SIGNATURE_TOWNS.map(([t]) => t), 'Manhattan'],
}

/** Five digits, ignoring any +4 and any surrounding whitespace. */
export function normalizeZip(raw: string | null | undefined): string | null {
  if (!raw) return null
  const digits = String(raw).trim().slice(0, 10).replace(/[^0-9]/g, '')
  return digits.length >= 5 ? digits.slice(0, 5) : null
}

/**
 * The zone for a postcode, or null when we do not recognise it — in which
 * case the caller should fall back to offering every zone rather than
 * refusing the order.
 */
export function zoneForZip(raw: string | null | undefined): ZoneId | null {
  const zip = normalizeZip(raw)
  if (!zip) return null
  if (ZONE_BY_ZIP[zip]) return ZONE_BY_ZIP[zip]
  if (SIGNATURE_PREFIXES.includes(zip.slice(0, 3))) return 'signature'
  return null
}
