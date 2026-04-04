import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const filePath = join(process.cwd(), 'public', 'cinematic', 'index.html')

  if (!existsSync(filePath)) {
    return NextResponse.redirect(new URL('/login', 'https://dreamersjoystudio.com'))
  }

  const html = readFileSync(filePath, 'utf-8')
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
