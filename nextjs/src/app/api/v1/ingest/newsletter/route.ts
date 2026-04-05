import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders })
}

async function getOrgIdFromApiKey(supabase: any, apiKey: string): Promise<string | null> {
  const { data } = await supabase
    .from('cinematic_sites')
    .select('organization_id')
    .eq('api_key', apiKey)
    .single()
  return data?.organization_id ?? null
}

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey || apiKey !== process.env.SITE_API_KEY) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401, headers: corsHeaders })
    }

    const supabase = createAdminClient()
    const body = await request.json()
    const { email, firstName } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400, headers: corsHeaders })
    }

    // Get org ID
    let orgId = await getOrgIdFromApiKey(supabase, apiKey)
    if (!orgId) {
      const { data: org } = await supabase.from('organizations').select('id').limit(1).single()
      orgId = org?.id ?? null
    }
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 500, headers: corsHeaders })
    }

    // Upsert contact
    const { data: existing } = await supabase
      .from('contacts')
      .select('id')
      .eq('email', email)
      .eq('organization_id', orgId)
      .single()

    let contactId: string
    if (existing) {
      contactId = existing.id
      if (firstName) {
        await supabase.from('contacts').update({ first_name: firstName }).eq('id', contactId)
      }
    } else {
      const { data: newContact } = await supabase
        .from('contacts')
        .insert({
          organization_id: orgId,
          first_name: firstName || email.split('@')[0],
          last_name: '',
          email,
          source: 'newsletter',
        })
        .select('id')
        .single()
      contactId = newContact!.id
    }

    // Add newsletter tag
    let { data: tag } = await supabase
      .from('tags')
      .select('id')
      .eq('name', 'newsletter')
      .eq('organization_id', orgId)
      .single()

    if (!tag) {
      const { data: newTag } = await supabase
        .from('tags')
        .insert({ organization_id: orgId, name: 'newsletter', color: '#fdcb6e' })
        .select('id')
        .single()
      tag = newTag
    }

    if (tag) {
      const { data: existingTag } = await supabase
        .from('entity_tags')
        .select('id')
        .eq('tag_id', tag.id)
        .eq('entity_type', 'contact')
        .eq('entity_id', contactId)
        .single()

      if (!existingTag) {
        await supabase.from('entity_tags').insert({
          tag_id: tag.id,
          entity_type: 'contact',
          entity_id: contactId,
        })
      }
    }

    return NextResponse.json({ success: true, contactId }, { headers: corsHeaders })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders })
  }
}
