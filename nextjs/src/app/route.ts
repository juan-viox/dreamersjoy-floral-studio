import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

/**
 * Route handler that serves the cinematic DreamersJoy Floral Studio
 * static site at the root URL /.
 *
 * The static HTML lives in public/cinematic/index.html with its assets
 * (frames, images) alongside it. A <base href="/cinematic/"> tag in
 * the HTML ensures all relative asset paths resolve correctly.
 */
export async function GET() {
  const html = readFileSync(
    join(process.cwd(), 'public', 'cinematic', 'index.html'),
    'utf-8'
  )
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
