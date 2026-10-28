import { type NextRequest, NextResponse } from 'next/server'

const locales = ['hy', 'ru', 'en']
const ownTop = new Set(['admin', 'api', 'health', 'telegram', 'm', '_next'])

/** Browser language by q-value, falling back to Armenian. */
function pickLocale(accept: string) {
  const ranked = accept
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';')
      const q = Number(params.find((p) => p.trim().startsWith('q='))?.split('=')[1] ?? 1)
      return { lang: tag.slice(0, 2).toLowerCase(), q: Number.isFinite(q) ? q : 0 }
    })
    .filter((x) => locales.includes(x.lang) && x.q > 0)
    .sort((a, b) => b.q - a.q)
  return ranked[0]?.lang ?? 'hy'
}

/*
 * Admin login throttle: per IP, in memory. One instance only (SQLite deploy); a reverse proxy limit is still
 * recommended. Payload's own lockout (per account) stays on, but a stranger can no longer lock the owner out
 * from one address.
 */
const LOGIN_WINDOW_MS = 10 * 60_000
const LOGIN_MAX = 10
const attempts = new Map<string, number[]>()
function loginLimited(ip: string) {
  const now = Date.now()
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < LOGIN_WINDOW_MS)
  recent.push(now)
  attempts.set(ip, recent)
  if (attempts.size > 5000) attempts.clear()
  return recent.length > LOGIN_MAX
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. one canonical host in production: www/apex/preview aliases redirect, so cookies, CSRF and SEO agree
  const canonical = process.env.NEXT_PUBLIC_SERVER_URL
  if (process.env.NODE_ENV === 'production' && canonical && !canonical.includes('localhost')) {
    const want = new URL(canonical)
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? ''
    if (host && host !== want.host && !host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
      return NextResponse.redirect(new URL(pathname + request.nextUrl.search, want.origin), 308)
    }
  }

  // 2. admin login throttle
  if (pathname === '/api/users/login' && request.method === 'POST') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'local'
    if (loginLimited(ip)) {
      return NextResponse.json({ errors: [{ message: 'Too many login attempts. Try again in 10 minutes.' }] }, { status: 429 })
    }
    return NextResponse.next()
  }

  const first = pathname.split('/')[1] ?? ''
  // public files (/brand/logo.webp, /icon.png, /sitemap.xml) are served as they are
  const isFile = (pathname.split('/').pop() ?? '').includes('.')
  if (ownTop.has(first) || isFile) return NextResponse.next()
  if (locales.includes(first)) return NextResponse.next()

  // 3. /HY → /hy; anything else without a language (/, /menu, printed links) → the visitor's language
  const url = request.nextUrl.clone()
  if (locales.includes(first.toLowerCase())) {
    url.pathname = '/' + first.toLowerCase() + pathname.slice(first.length + 1)
  } else {
    url.pathname = `/${pickLocale(request.headers.get('accept-language') ?? '')}`
  }
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
