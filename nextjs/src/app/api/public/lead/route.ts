import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { guardPublicForm } from '@/lib/ingest/guard'
import { ingestLead, resolveOrgId } from '@/lib/ingest/store'

/**
 * Lead capture for the site's own forms: the booking inquiry on the marketing
 * pages, /order and /invite.
 *
 * Takes no API key — see the note in ../newsletter/route.ts.
 */

const str = (v: unknown, max: number): string | null =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null

/** `source` arrives from the browser, so keep it to a tag-shaped token. */
const sourceTag = (v: unknown): string =>
  (typeof v === 'string' ? v.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') : '').slice(0, 40) ||
  'web_form'

export async function POST(request: Request) {
  const blocked = guardPublicForm(request)
  if (blocked) return blocked

  try {
    const body = await request.json()

    // /invite sends a single `name`; /order and the inquiry form send the
    // parts separately. Accept both.
    let firstName = str(body.firstName, 100)
    let lastName = str(body.lastName, 100)
    const fullName = str(body.name, 200)
    if (!firstName && fullName) {
      const parts = fullName.split(/\s+/)
      firstName = parts[0]
      lastName = lastName ?? (parts.slice(1).join(' ') || null)
    }

    const email = str(body.email ?? body.emailAddress, 254)
    const phone = str(body.phone, 50)
    const description = str(body.description, 5000)

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'An email address or phone number is required' },
        { status: 400 },
      )
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const orgId = await resolveOrgId(supabase, process.env.SITE_API_KEY)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 500 })
    }

    await ingestLead(supabase, orgId, {
      firstName,
      lastName,
      email,
      phone,
      description,
      source: sourceTag(body.source),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[public.lead]', err)
    return NextResponse.json({ error: 'Could not submit your enquiry' }, { status: 500 })
  }
}
