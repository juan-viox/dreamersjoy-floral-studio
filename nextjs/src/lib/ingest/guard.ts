/**
 * Request guard for the site's own public forms.
 *
 * These endpoints are called from the browser, so they cannot carry a secret:
 * anything the page can send, a reader of the page can send too. Instead of a
 * key, they check that the request came from a page we serve, and rate-limit
 * per IP.
 */

/** The host the request was actually addressed to, proxies accounted for. */
function requestHost(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-host')
  if (forwarded) return forwarded.split(',')[0].trim().toLowerCase()

  const host = request.headers.get('host')
  if (host) return host.trim().toLowerCase()

  try {
    return new URL(request.url).host.toLowerCase()
  } catch {
    return null
  }
}

/**
 * True when the request originates from a page on this same deployment.
 *
 * Browsers send `Origin` on every POST, so a missing header means the caller
 * is not a browser form and is rejected. Comparing against the request's own
 * host (rather than a hardcoded domain) means production, Vercel previews and
 * localhost all work without configuration.
 *
 * `ALLOWED_FORM_ORIGINS` — comma-separated, e.g. "https://dreamersjoystudio.com"
 * — adds extra origins if the site is ever embedded elsewhere.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return false

  let originHost: string
  try {
    originHost = new URL(origin).host.toLowerCase()
  } catch {
    return false
  }

  if (originHost === requestHost(request)) return true

  const extra = (process.env.ALLOWED_FORM_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)

  return extra.some((allowed) => {
    try {
      return new URL(allowed).host.toLowerCase() === originHost
    } catch {
      return allowed.toLowerCase() === originHost
    }
  })
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5

/**
 * Per-IP sliding window.
 *
 * In-memory, so it is per serverless instance rather than global: a determined
 * attacker spread across instances gets more than MAX_PER_WINDOW through. It is
 * a speed bump against casual form spam, not a guarantee. If real abuse shows
 * up, move this to Supabase or Vercel KV so the count is shared.
 */
const hits = new Map<string, number[]>()

export function rateLimit(key: string): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS)

  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent)
    return false
  }

  recent.push(now)
  hits.set(key, recent)

  // Opportunistic cleanup so the map cannot grow without bound.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k)
    }
  }

  return true
}

/** Shared gate: returns a Response to send back, or null to proceed. */
export function guardPublicForm(request: Request): Response | null {
  if (!isSameOrigin(request)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (!rateLimit(clientIp(request))) {
    return Response.json(
      { error: 'Too many submissions. Please try again shortly.' },
      { status: 429 },
    )
  }
  return null
}
