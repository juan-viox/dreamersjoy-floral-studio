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
 * The bands are the studio's own, set by what the drive actually costs
 * rather than by distance alone: the run east toward the river — Englewood,
 * Fort Lee, the Palisades — is barely further than Paramus but takes twice
 * as long, and that traffic is what the middle band is really pricing.
 *
 *   local     0–9 miles     $18, complimentary over $125
 *   nearby    10–15 miles   $15
 *   extended  beyond 15     $45
 *
 * An unrecognised postcode is NOT refused: it falls through to `null`, the
 * checkout offers all three zones as before, and the studio confirms by
 * email. Losing a sale to a postcode this table has not heard of would be
 * far worse than a short conversation.
 */

export type ZoneId = 'local' | 'nearby' | 'extended'

const ZONE_BY_ZIP: Record<string, ZoneId> = {}

/** $18, waived over $125. Roughly nine miles, and an easy drive. */
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
  ['Saddle River / Upper Saddle River', ['07458']],
  ['Fair Lawn', ['07410']],
  ['Paramus', ['07652', '07653']],
  ['Hawthorne', ['07506']],
  ['Ramsey', ['07446']],
  ['Mahwah', ['07430']],
  ['Hackensack', ['07601', '07602']],
  ['Elmwood Park', ['07407']],
  ['Rochelle Park', ['07662']],
  ['Maywood', ['07607']],
  ['River Edge', ['07661']],
  ['Oradell', ['07649']],
  ['Emerson', ['07630']],
  ['Westwood', ['07675']],
  ['Hillsdale', ['07642']],
  ['Woodcliff Lake', ['07677']],
  ['Park Ridge', ['07656']],
  ['Montvale', ['07645']],
  ['Pompton Lakes', ['07442']],
  ['Wanaque', ['07465']],
]

/** $15. Ten to fifteen miles — and, east of here, the traffic. */
const NEARBY_TOWNS: Array<[string, string[]]> = [
  ['Teaneck', ['07666']],
  ['Bergenfield', ['07621']],
  ['Dumont', ['07628']],
  ['New Milford', ['07646']],
  ['Tenafly', ['07670']],
  ['Englewood', ['07631']],
  ['Englewood Cliffs', ['07632']],
  ['Leonia', ['07605']],
  ['Fort Lee', ['07024']],
  ['Palisades Park', ['07650']],
  ['Fairview', ['07022']],
  ['Cliffside Park', ['07010']],
  ['Edgewater', ['07020']],
  ['Clifton', ['07011', '07012', '07013', '07014']],
  ['Totowa', ['07512']],
  ['Little Falls', ['07424']],
  ['Wayne', ['07470']],
  ['Kinnelon', ['07405']],
  ['Montclair', ['07042', '07043', '07044']],
]

/** $45. Beyond fifteen miles. */
const EXTENDED_TOWNS: Array<[string, string[]]> = [
  ['Newark', ['07102', '07103', '07104', '07105', '07106', '07107', '07108']],
  ['Jersey City', ['07302', '07304', '07305', '07306', '07307', '07310', '07311']],
  ['Hoboken', ['07030']],
  ['Morristown', ['07960']],
]

for (const [, zips] of LOCAL_TOWNS) for (const z of zips) ZONE_BY_ZIP[z] = 'local'
for (const [, zips] of NEARBY_TOWNS) for (const z of zips) ZONE_BY_ZIP[z] = 'nearby'
for (const [, zips] of EXTENDED_TOWNS) for (const z of zips) ZONE_BY_ZIP[z] = 'extended'

/** Manhattan is the whole 100xx / 101xx / 102xx range — too many to list. */
const EXTENDED_PREFIXES = ['100', '101', '102']

/** Town names per zone, for telling the customer where they landed. */
export const ZONE_TOWNS: Record<ZoneId, string[]> = {
  local: LOCAL_TOWNS.map(([t]) => t),
  nearby: NEARBY_TOWNS.map(([t]) => t),
  extended: [...EXTENDED_TOWNS.map(([t]) => t), 'Manhattan'],
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
  if (EXTENDED_PREFIXES.includes(zip.slice(0, 3))) return 'extended'
  return null
}
