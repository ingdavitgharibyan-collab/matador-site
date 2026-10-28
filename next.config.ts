import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import { PHASE_PRODUCTION_BUILD } from 'next/constants'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
const HTTPS = SERVER_URL.startsWith('https://')

/*
 * The public origin is compiled into canonical/hreflang/sitemap/JSON-LD/QR and Payload's serverURL.
 * A production build with a missing or local origin ships broken SEO, broken printed QR codes and an admin
 * that cannot save, silently. Refuse it unless explicitly building for local testing (npm run build:local).
 */
function assertPublicOrigin() {
  if (process.env.MATADOR_ALLOW_LOCAL_BUILD === '1') return
  if (!/^https:\/\/[^/]+$/.test(SERVER_URL) || /localhost|127\.0\.0\.1/.test(SERVER_URL)) {
    throw new Error(
      `NEXT_PUBLIC_SERVER_URL must be the public https origin without a trailing slash (got "${SERVER_URL}"). ` +
        'For a local production test run `npm run build:local`.',
    )
  }
}

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  'frame-src https://maps.google.com https://www.google.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ')

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/brand/**' }],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'Content-Security-Policy', value: CSP },
          ...(HTTPS ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }] : []),
        ],
      },
      { source: '/brand/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }] },
    ]
  },
}

export default function config(phase: string) {
  if (phase === PHASE_PRODUCTION_BUILD) assertPublicOrigin()
  return withPayload(nextConfig, { devBundleServerPackages: false })
}
