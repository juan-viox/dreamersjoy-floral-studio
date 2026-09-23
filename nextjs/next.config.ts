import type { NextConfig } from "next";

/**
 * Marketing slugs that map directly to a static HTML file under
 * /public/cinematic. Listing them here lets Next.js / Vercel serve
 * them straight from the CDN as static assets — zero server execution
 * per request, fastest TTFB, best for SEO.
 */
const STATIC_MARKETING_PAGES = [
  'shop',
  'fall-edit',
  'subscriptions',
  'our-process',
  'studio-series',
  'gallery',
  'about',
  'inquire',
  'journal',
];

const nextConfig: NextConfig = {
  /**
   * Static rewrites: marketing URLs serve the pre-built HTML directly
   * from the CDN. e.g. /shop → /cinematic/shop.html (no /api/, no
   * server fetch, just a CDN-cached file).
   *
   * 'beforeFiles' runs before Next.js looks at the file system, so
   * it bypasses any per-request route handler that might exist.
   */
  async rewrites() {
    return {
      beforeFiles: [
        ...STATIC_MARKETING_PAGES.map((slug) => ({
          source: `/${slug}`,
          destination: `/cinematic/${slug}.html`,
        })),
        // Journal posts: /journal/<slug> -> /cinematic/journal/<slug>.html
        { source: '/journal/:slug', destination: '/cinematic/journal/:slug.html' },
      ],
      afterFiles: [],
      fallback: [],
    };
  },

  /**
   * Retired seasonal slugs keep their inbound links alive.
   */
  async redirects() {
    return [
      { source: '/mothers-day', destination: '/fall-edit', permanent: true },
    ];
  },

  /**
   * Cache-Control for the static marketing site.
   *
   * The pages, style.css and script.js are served under FIXED filenames —
   * there is no content hash — so every deploy changes what lives at a URL
   * someone's browser and the CDN already hold a copy of.
   *
   * These three used to carry stale-while-revalidate=604800. That is an
   * instruction to keep serving the OLD file for up to a week after it
   * changed, refreshing quietly in the background. It also lets the three
   * drift out of step: a visitor could be handed fresh HTML and script.js
   * beside a stylesheet from days earlier, which renders as a page that is
   * subtly, inexplicably wrong. Fine for assets whose URL changes when they
   * do. Wrong for these.
   *
   * So: still cached at the edge, so pages stay fast, but never knowingly
   * stale for more than a minute past expiry. Images keep the long immutable
   * cache — a photograph at a given filename really does not change.
   */
  async headers() {
    // Cached hard at the CDN, revalidated against ETag, and allowed to serve
    // stale only for the moment it takes to fetch the new copy.
    const MUTABLE = 'public, max-age=0, s-maxage=3600, stale-while-revalidate=60';

    return [
      {
        source: '/cinematic/:slug*.html',
        headers: [{ key: 'Cache-Control', value: MUTABLE }],
      },
      {
        // Journal posts live a directory deeper, where the :slug*.html
        // pattern above does not reliably reach them.
        source: '/cinematic/journal/:slug.html',
        headers: [{ key: 'Cache-Control', value: MUTABLE }],
      },
      {
        source: '/cinematic/style.css',
        headers: [{ key: 'Cache-Control', value: MUTABLE }],
      },
      {
        source: '/cinematic/script.js',
        headers: [{ key: 'Cache-Control', value: MUTABLE }],
      },
      {
        source: '/cinematic/assets/images/:image*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, immutable' },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          { key: 'Content-Type', value: 'application/xml; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400' },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400' },
        ],
      },
    ];
  },
};

export default nextConfig;
