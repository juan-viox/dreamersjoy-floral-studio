import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ingestNewsletter, resolveOrgId } from '@/lib/ingest/store'

/**
 * Server-to-server newsletter ingest, authenticated with x-api-key.
 *
 * The site's own footer form uses /api/public/newsletter instead, which needs
 * no secret. See the note in ../lead/route.ts.
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
    const { email, firstName } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400, headers: corsHeaders })
    }

    const orgId = await resolveOrgId(supabase, apiKey)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 500, headers: corsHeaders })
    }

    const { contactId } = await ingestNewsletter(supabase, orgId, { email, firstName })

    return NextResponse.json({ success: true, contactId }, { headers: corsHeaders })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500, headers: corsHeaders },
    )
  }
}
