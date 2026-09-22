/**
 * Who gets told when somebody is waiting on the studio.
 *
 * Every alert goes to more than one mailbox on purpose. The failure this fixes
 * was not a missing feature — it was a single address nobody happened to be
 * reading. One inbox is one point of failure, and in September 2026 that cost
 * a real customer a real anniversary.
 *
 * Deliberately NOT `hello@`. That is the studio's public, order-facing address;
 * an alert sent there is an alert sent to the same place the problem started.
 */

/** Sarah's studio address — the address the alert is really for. */
const PRIMARY = 'sarah@dreamersjoystudio.com'

/**
 * Her personal mailbox, as a backstop for the days she has not opened the
 * studio one. Redundant by design: if it ever stops being redundant, it is the
 * only thing standing between an enquiry and another eight weeks of silence.
 */
const BACKSTOP = 'sdejesus7@gmail.com'

/** Split a comma-separated env var into clean, unique addresses. */
function parse(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * The full alert distribution list.
 *
 * LEAD_NOTIFICATION_EMAIL and LEAD_NOTIFICATION_CC both accept comma-separated
 * lists and both fall back to a sensible default, so the studio keeps getting
 * alerts even if neither is ever set in Vercel.
 */
export function alertRecipients(): string[] {
  const to = parse(process.env.LEAD_NOTIFICATION_EMAIL)
  const cc = parse(process.env.LEAD_NOTIFICATION_CC)

  const all = [...(to.length ? to : [PRIMARY]), ...(cc.length ? cc : [BACKSTOP])]

  // Case-insensitive de-dupe; addresses that differ only in case are the same
  // mailbox, and Resend would otherwise send the same alert twice.
  const seen = new Set<string>()
  return all.filter((address) => {
    const key = address.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
