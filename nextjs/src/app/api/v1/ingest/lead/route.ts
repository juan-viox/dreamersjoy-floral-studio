import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ingestLead, resolveOrgId } from '@/lib/ingest/store'

/**
 * Server-to-server lead ingest, authenticated with x-api-key.
 *
 * Used by the Stripe webhook and any external integration. The site's own
 * browser forms do NOT call this — they use /api/public/lead, which needs no
 * secret. Do not reintroduce a client-side caller here: it would mean shipping
 * SITE_API_KEY to the browser.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders })
}

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('x-api-key')
    const expected = process.env.SITE_API_KEY
    if (!expected || !apiKey || apiKey !== expected) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401, headers: corsHeaders })
    }

    const supabase = createAdminClient()
    const body = await request.json()

    const orgId = await resolveOrgId(supabase, apiKey)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 500, headers: corsHeaders })
    }

    const { contactId } = await ingestLead(supabase, orgId, {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.emailAddress || body.email || null,
      phone: body.phone,
      description: body.description,
      source: body.source,
    })

    return NextResponse.json({ success: true, contactId }, { headers: corsHeaders })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500, headers: corsHeaders },
    )
  }
}
