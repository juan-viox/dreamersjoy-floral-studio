import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  return NextResponse.rewrite(new URL('/cinematic/index.html', url.origin))
}
