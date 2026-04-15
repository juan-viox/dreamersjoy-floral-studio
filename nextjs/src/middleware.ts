import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** Paths that never require authentication */
const publicPaths = [
  '/login', '/signup', '/auth/callback', '/portal-login',
  '/order', '/delivery', '/invite',
  // Public marketing pages (multi-page site)
  '/shop', '/mothers-day', '/studio-series', '/subscriptions',
  '/gallery', '/about',
  '/inquire', '/our-process',
  // Legacy paths kept for the 301 redirect handler below
  '/contact', '/booking',
  '/sitemap.xml', '/robots.txt',
]

/** Permanent (301) redirects for merged/renamed pages */
const redirectMap: Record<string, string> = {
  '/contact': '/inquire',
  '/booking': '/inquire',
}

/** CRM route prefixes — require authentication */
const crmPaths = [
  '/dashboard', '/contacts', '/companies', '/deals', '/leads',
  '/activities', '/automations', '/calendar', '/emails',
  '/invoices', '/products', '/reports', '/settings', '/sites', '/tasks',
  '/portal',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 0. Allow the cinematic site root and its static assets ──
  if (pathname === '/' || pathname.startsWith('/cinematic')) {
    return NextResponse.next()
  }

  // ── 0.5. 301 redirects for merged/renamed pages ──
  // Match exact path; trailing slash tolerated.
  const normalizedForRedirect = pathname.replace(/\/$/, '') || '/'
  if (redirectMap[normalizedForRedirect]) {
    const url = request.nextUrl.clone()
    url.pathname = redirectMap[normalizedForRedirect]
    return NextResponse.redirect(url, 301)
  }

  // ── 1. Always allow public paths ──
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next({ request })
  }

  // ── 2. Always allow ingest API routes (API-key auth in route handlers) ──
  if (pathname.startsWith('/api/v1/ingest')) {
    return NextResponse.next()
  }

  // ── 3. Always allow public API routes ──
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // ── 4. Create Supabase client that handles cookie refresh ──
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── 5. Portal routes: require auth, redirect to portal-login ──
  if (pathname.startsWith('/portal')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/portal-login'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // ── 6. CRM routes: require auth, redirect to /login if missing ──
  const isCrmRoute = crmPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))
  if (isCrmRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // ── 7. Unknown public path → serve branded 404 (rewrite, not redirect) ──
  const url = request.nextUrl.clone()
  url.pathname = '/cinematic/404.html'
  return NextResponse.rewrite(url, { status: 404 })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
