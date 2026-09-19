import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { guardPublicForm } from '@/lib/ingest/guard'
import { ingestNewsletter, resolveOrgId } from '@/lib/ingest/store'

/**
 * Newsletter sign-up for the site's own footer form.
 *
 * Takes no API key: the caller is a browser, so it has no way to hold a secret.
 * Authenticated by origin instead (see lib/ingest/guard). Deliberately no CORS
 * headers — this is same-origin only.
 */
export async function POST(request: Request) {
  const blocked = guardPublicForm(request)
  if (blocked) return blocked

  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const firstName = typeof body.firstName === 'string' ? body.firstName.trim().slice(0, 100) : null

    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const orgId = await resolveOrgId(supabase, process.env.SITE_API_KEY)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 500 })
    }

    await ingestNewsletter(supabase, orgId, { email, firstName })

    // Nothing about the CRM's internals goes back to the browser.
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[public.newsletter]', err)
    return NextResponse.json({ error: 'Could not complete sign-up' }, { status: 500 })
  }
}
