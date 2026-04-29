import type { NextConfig } from "next";

/**
 * Marketing slugs that map directly to a static HTML file under
 * /public/cinematic. Listing them here lets Next.js / Vercel serve
 * them straight from the CDN as static assets — zero server execution
 * per request, fastest TTFB, best for SEO.
 */
const STATIC_MARKETING_PAGES = [
  'shop',
  'mothers-day',
  'subscriptions',
  'our-process',
  'studio-series',
  'gallery',
  'about',
  'inquire',
];

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Prevent pages that use browser APIs from being prerendered at build time
    missingSuspenseWithCSRBailout: false,
  },

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
      beforeFiles: STATIC_MARKETING_PAGES.map((slug) => ({
        source: `/${slug}`,
        destination: `/cinematic/${slug}.html`,
      })),
      afterFiles: [],
      fallback: [],
    };
  },

  /**
   * Send Cache-Control headers that match Vercel's edge cache so the
   * static HTML is held aggressively at the CDN tier (revalidates with
   * If-None-Match / ETag, never blocks the user).
   */
  async headers() {
    return [
      {
        source: '/cinematic/:slug*.html',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/cinematic/style.css',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/cinematic/script.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800' },
        ],
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
