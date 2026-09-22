/**
 * Business-hours arithmetic, shared by the reminder sweep and the CRM banner.
 *
 * The studio promises a reply inside 48 business hours. Saturday and Sunday do
 * not count: an enquiry that lands on Friday evening should not be treated as
 * overdue on Sunday morning, and the promise made to customers is about
 * working days.
 *
 * Lives here rather than in the reminder sweep so the banner and the emails
 * can never disagree about whether something is late.
 */

const HOUR_MS = 3_600_000

/** Where the studio actually is, so "the weekend" means its weekend. */
const STUDIO_TZ = 'America/New_York'

/** Reused across calls — constructing the formatter is the expensive part. */
const weekdayInStudioTz = new Intl.DateTimeFormat('en-US', {
  timeZone: STUDIO_TZ,
  weekday: 'short',
})

function isWeekend(at: number): boolean {
  const day = weekdayInStudioTz.format(new Date(at))
  return day === 'Sat' || day === 'Sun'
}

/**
 * Hours since `since`, counting only Monday–Friday in the studio's timezone.
 *
 * Walked an hour at a time rather than computed in closed form: callers cap
 * the span at a couple of weeks, so this is a few hundred cheap steps at
 * worst, the rule stays legible to whoever reads it next, and going through
 * Intl means daylight saving is handled for free.
 */
export function businessHoursSince(since: string | Date): number {
  const start = (since instanceof Date ? since : new Date(since)).getTime()
  const now = Date.now()
  if (!Number.isFinite(start) || now <= start) return 0

  let hours = 0
  for (let at = start; at < now; at += HOUR_MS) {
    if (!isWeekend(at)) hours += 1
  }
  return hours
}

/** Business hours before the first nudge. */
export const FIRST_REMINDER_BUSINESS_HOURS = 24

/** Business hours before the final nudge — the studio's promise, in full. */
export const FINAL_REMINDER_BUSINESS_HOURS = 48
