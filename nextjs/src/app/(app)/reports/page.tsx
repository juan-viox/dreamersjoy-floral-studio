import { createServerSupabaseClient } from '@/lib/supabase/server'
import ReportsClient from './ReportsClient'

interface StageRow {
  id: string
  name: string
  color: string
  sort_order: number
  is_won: boolean
  is_lost: boolean
}

interface DealRow {
  id: string
  title: string
  amount: number
  probability?: number
  stage_id: string
  created_at: string
  updated_at: string
  close_date?: string
  closed_at?: string
}

interface ProfileRow {
  id: string
  full_name: string | null
}

interface DealCompanyRow {
  company_id: string
}

export default async function ReportsPage() {
  const supabase = await createServerSupabaseClient()

  // Fetch all raw data for reports
  const [
    dealsRes,
    contactsRes,
    activitiesRes,
    stagesRes,
    profilesRes,
  ] = await Promise.all([
    supabase
      .from('deals')
      .select('id, title, amount, probability, stage_id, created_at, updated_at, close_date, closed_at'),
    supabase
      .from('contacts')
      .select('id, source, created_at'),
    supabase
      .from('activities')
      .select('id, type, user_id, created_at, status'),
    supabase
      .from('deal_stages')
      .select('id, name, color, sort_order, is_won, is_lost')
      .order('sort_order'),
    supabase
      .from('profiles')
      .select('id, full_name'),
  ])

  // Fetch companies with deal counts
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')

  const { data: dealCompanies } = await supabase
    .from('deals')
    .select('company_id')
    .not('company_id', 'is', null)

  const companyDealCounts: Record<string, number> = {}
  ;((dealCompanies ?? []) as DealCompanyRow[]).forEach((d) => {
    const cid = d.company_id
    companyDealCounts[cid] = (companyDealCounts[cid] || 0) + 1
  })

  // Compute deal status from stage is_won/is_lost flags
  const stages = (stagesRes.data ?? []) as StageRow[]
  const wonStageIds = new Set(stages.filter((s) => s.is_won).map((s) => s.id))
  const lostStageIds = new Set(stages.filter((s) => s.is_lost).map((s) => s.id))

  const dealsWithStatus = ((dealsRes.data ?? []) as DealRow[]).map((d) => ({
    ...d,
    status: wonStageIds.has(d.stage_id) ? 'won'
      : lostStageIds.has(d.stage_id) ? 'lost'
      : 'open',
  }))

  // Transform profiles → teamMembers format
  const teamMembers = ((profilesRes.data ?? []) as ProfileRow[]).map((p) => ({
    id: p.id,
    name: p.full_name || 'Unknown',
  }))

  // Transform companies → topCompanies format (sorted by deal count, top 10)
  const topCompanies = ((companies ?? []) as { id: string; name: string }[])
    .map(c => ({
      name: c.name,
      deals: companyDealCounts[c.id] || 0,
    }))
    .filter(c => c.deals > 0)
    .sort((a, b) => b.deals - a.deals)
    .slice(0, 10)

  return (
    <ReportsClient
      deals={dealsWithStatus}
      contacts={contactsRes.data ?? []}
      activities={activitiesRes.data ?? []}
      stages={stages}
      teamMembers={teamMembers}
      topCompanies={topCompanies}
    />
  )
}
