/**
 * GET /api/public/occasion-cards
 *
 * The enclosure cards the shop can offer. Read by the static shop pages so
 * the dropdown and the checkout route can never disagree about what is in
 * the card drawer.
 *
 * Public and read-only — it lists nothing that isn't printed on the front
 * of a card the customer will be handed anyway.
 */
import { NextResponse } from 'next/server'
import { OCCASION_CARDS } from '@/lib/occasion-cards'

export async function GET() {
  return NextResponse.json(
    { cards: OCCASION_CARDS },
    {
      headers: {
        // Changes only when the printed stock changes.
        'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    },
  )
}
