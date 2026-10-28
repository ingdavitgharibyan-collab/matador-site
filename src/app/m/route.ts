import config from '@payload-config'
import { getPayload } from 'payload'

import { hasLocale } from '@/lib/i18n'
import { count, EVENTS, type MetricEvent } from '@/lib/metrics'

export const dynamic = 'force-dynamic'
const BOT = /bot|crawl|spider|slurp|preview|lighthouse|headless/i

/** Anonymous funnel counter (sendBeacon). Stores nothing about the visitor: not the IP, not a cookie. */
export async function POST(req: Request) {
  try {
    if (BOT.test(req.headers.get('user-agent') ?? '')) return new Response(null, { status: 204 })
    const body = JSON.parse(await req.text())
    const e = String(body?.e) as MetricEvent
    const l = String(body?.l)
    if (EVENTS.includes(e) && hasLocale(l)) count(await getPayload({ config }), e, l)
  } catch {}
  return new Response(null, { status: 204 })
}
