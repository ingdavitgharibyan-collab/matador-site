import { type NextRequest, NextResponse } from 'next/server'

const locales = ['hy', 'ru', 'en']

/** Visitors without a language in the URL go to the closest one their browser asks for. */
export function proxy(request: NextRequest) {
  const accept = request.headers.get('accept-language') ?? ''
  const wanted = accept
    .split(',')
    .map((p) => p.split(';')[0].trim().slice(0, 2).toLowerCase())
    .find((l) => locales.includes(l))
  const url = request.nextUrl.clone()
  url.pathname = `/${wanted ?? 'hy'}${request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  // only bare paths: not the site's locales, the admin, the API, Next internals or files with an extension
  matcher: ['/((?!hy(?:/|$)|ru(?:/|$)|en(?:/|$)|admin|api|_next|.*\\..*).*)'],
}
