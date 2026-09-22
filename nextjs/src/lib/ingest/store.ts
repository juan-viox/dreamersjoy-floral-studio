/**
 * Shared ingest persistence.
 *
 * Two kinds of caller land here:
 *
 *   1. /api/v1/ingest/*   — server-to-server, authenticated with x-api-key.
 *   2. /api/public/*      — the site's own forms, authenticated by origin.
 *
 * Both write the same rows, so the logic lives here rather than being
 * duplicated (and drifting) across four route handlers.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * The studio this deployment belongs to. Overridable per-deployment, but it
 * must always name a real `organizations.slug` — never a positional guess.
 */
const SITE_ORG_SLUG = (process.env.SITE_ORG_SLUG ?? 'dreamersjoy').trim()

/**
 * Resolve the organization a write belongs to.
 *
 * Prefers the site registered against `apiKey`, then falls back to looking up
 * SITE_ORG_SLUG by name.
 *
 * It deliberately does NOT fall back to "the first organization in the table".
 * This database holds more than one org, and `select().limit(1)` without an
 * ORDER BY returns whichever row Postgres feels like — in practice the VioX AI
 * org, not the studio. That turned every key mismatch into a silent
 * misfiling: the visitor saw a thank-you, the lead landed in a different
 * company's CRM, and nobody found out. Returning null instead makes the
 * caller fail loudly, which is recoverable; filing leads to a stranger is not.
 */
export async function resolveOrgId(
  supabase: SupabaseClient,
  apiKey: string | null | undefined,
): Promise<string | null> {
  if (apiKey) {
    const { data } = await supabase
      .from('cinematic_sites')
      .select('organization_id')
      .eq('api_key', apiKey.trim())
      .maybeSingle()
    if (data?.organization_id) return data.organization_id
    console.error('[ingest] SITE_API_KEY did not match any cinematic_sites row')
  }

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', SITE_ORG_SLUG)
    .maybeSingle()

  if (!org?.id) {
    console.error(`[ingest] no organization with slug "${SITE_ORG_SLUG}"`)
    return null
  }
  return org.id
}

export type LeadInput = {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phone?: string | null
  description?: string | null
  /** e.g. "web_form", "invitation_request", "stripe_order". */
  source?: string | null
  /**
   * Deal value in whole currency units. An enquiry has none yet; a paid order
   * does, and leaving it at zero is what made the revenue chart read $0
   * however much the studio actually sold.
   */
  amount?: number | null
  /**
   * True for money already taken — a completed Stripe checkout. The deal then
   * opens in the "won" stage instead of the first one, because a paid order
   * is not a lead to be worked; it is revenue.
   */
  won?: boolean
}

/** Whole currency units, never negative, never NaN. */
function cleanAmount(value: unknown): number {
  const n = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : 0
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0
}

/** Upsert the contact, then open a deal in the right stage. */
export async function ingestLead(
  supabase: SupabaseClient,
  orgId: string,
  input: LeadInput,
): Promise<{ contactId: string }> {
  const { firstName, lastName, email, phone, description } = input
  const source = input.source?.trim() || 'web_form'

  const contactFields = {
    organization_id: orgId,
    first_name: firstName || 'Unknown',
    last_name: lastName || '',
    phone: phone || null,
    source,
    notes: description || null,
  }

  let contactId: string
  if (email) {
    const { data: existing } = await supabase
      .from('contacts')
      .select('id')
      .eq('email', email)
      .eq('organization_id', orgId)
      .single()

    if (existing) {
      contactId = existing.id
      await supabase
        .from('contacts')
        .update({
          first_name: firstName || undefined,
          last_name: lastName || undefined,
          phone: phone || undefined,
        })
        .eq('id', contactId)
    } else {
      const { data: created } = await supabase
        .from('contacts')
        .insert({ ...contactFields, email })
        .select('id')
        .single()
      contactId = created!.id
    }
  } else {
    const { data: created } = await supabase
      .from('contacts')
      .insert(contactFields)
      .select('id')
      .single()
    contactId = created!.id
  }

  const amount = cleanAmount(input.amount)
  const won = input.won === true

  // A paid order belongs in the won stage; anything else starts at the front
  // of the pipeline. Fall back to the first stage if the org has no won stage
  // configured, so an order still lands somewhere visible.
  let stageId: string | null = null
  if (won) {
    const { data: wonStage } = await supabase
      .from('deal_stages')
      .select('id')
      .eq('organization_id', orgId)
      .eq('is_won', true)
      .order('sort_order')
      .limit(1)
      .maybeSingle()
    stageId = wonStage?.id ?? null
    if (!stageId) console.error('[ingest] no won stage configured — filing the order as a lead')
  }

  if (!stageId) {
    const { data: firstStage } = await supabase
      .from('deal_stages')
      .select('id')
      .eq('organization_id', orgId)
      .order('sort_order')
      .limit(1)
      .maybeSingle()
    stageId = firstStage?.id ?? null
  }

  if (stageId) {
    const who = `${firstName || ''} ${lastName || ''}`.trim()
    await supabase.from('deals').insert({
      organization_id: orgId,
      contact_id: contactId,
      stage_id: stageId,
      title: won ? `Order: ${who}`.trim() : `Lead: ${who}`.trim(),
      amount,
      notes: description || null,
    })
  }

  return { contactId }
}

/** Upsert the contact and make sure it carries the `newsletter` tag. */
export async function ingestNewsletter(
  supabase: SupabaseClient,
  orgId: string,
  input: { email: string; firstName?: string | null },
): Promise<{ contactId: string }> {
  const { email, firstName } = input

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
    const { data: created } = await supabase
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
    contactId = created!.id
  }

  let { data: tag } = await supabase
    .from('tags')
    .select('id')
    .eq('name', 'newsletter')
    .eq('organization_id', orgId)
    .single()

  if (!tag) {
    const { data: created } = await supabase
      .from('tags')
      .insert({ organization_id: orgId, name: 'newsletter', color: '#fdcb6e' })
      .select('id')
      .single()
    tag = created
  }

  if (tag) {
    const { data: alreadyTagged } = await supabase
      .from('entity_tags')
      .select('id')
      .eq('tag_id', tag.id)
      .eq('entity_type', 'contact')
      .eq('entity_id', contactId)
      .single()

    if (!alreadyTagged) {
      await supabase.from('entity_tags').insert({
        tag_id: tag.id,
        entity_type: 'contact',
        entity_id: contactId,
      })
    }
  }

  return { contactId }
}
