'use server'

import config from '@payload-config'
import { createHash, randomBytes } from 'node:crypto'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { getMenu, getSettings } from '@/lib/data'
import { businessDayStart, canOrder, yerevanNow } from '@/lib/hours'
import { getDict, hasLocale } from '@/lib/i18n'
import { normalizePhone, orderMessage } from '@/lib/order'
import { type LineInput, type Mode, priceLines, quote } from '@/lib/pricing'
import { notifyNew } from '@/lib/telegram'

export type PlaceOrderInput = {
  lang: string
  lines: LineInput[]
  mode: Mode
  table?: string
  zoneId?: string
  payment: string
  name: string
  phone: string
  address?: string
  flat?: string
  note?: string
  channel: 'whatsapp' | 'telegram'
  /** honeypot: a field people never see */
  website?: string
  /** ms the ticket was open before sending */
  elapsed?: number
}
export type PlaceOrderResult =
  | { ok: true; ref: string; token: string; total: number; message: string }
  | { ok: false; error: 'closed' | 'paused' | 'last' | 'min' | 'invalid' | 'empty' | 'rate' | 'spam' }

/*
 * End-to-end tests run against a production build at an arbitrary hour: MATADOR_E2E=1 fixes the server clock
 * (MATADOR_E2E_NOW) and lifts the per-IP/phone limits. Never set it on a real server.
 */
const E2E = process.env.MATADOR_E2E === '1'
const serverNow = () => (E2E && process.env.MATADOR_E2E_NOW ? new Date(process.env.MATADOR_E2E_NOW) : new Date())

// one instance (SQLite deploy): in-memory limits are enough; a reverse-proxy limit is still recommended
const hits = new Map<string, number[]>()
function limited(key: string, max: number, windowMs: number) {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 10_000) hits.clear()
  return recent.length > max
}

/**
 * The order is recorded before any chat opens: prices, fees and rules are recomputed here from the database,
 * so what the kitchen sees cannot be edited by the guest, and nothing is lost if the chat is never sent.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (!hasLocale(input.lang)) return { ok: false, error: 'invalid' }
  if (input.website || (!E2E && (input.elapsed ?? 0) < 1500)) return { ok: false, error: 'spam' }

  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'local'
  const phone = normalizePhone(input.phone ?? '')
  if (!phone || !input.name?.trim()) return { ok: false, error: 'invalid' }
  if (!E2E && (limited(`ip:${ip}`, 6, 10 * 60_000) || limited(`ph:${phone}`, 4, 10 * 60_000))) return { ok: false, error: 'rate' }

  const lang = input.lang
  const [menu, settings] = await Promise.all([getMenu(lang), getSettings(lang)])
  const byId = new Map(menu.flatMap((c) => c.dishes).map((d) => [d.id, d]))
  const lines = priceLines(Array.isArray(input.lines) ? input.lines.slice(0, 50) : [], byId)
  if (!lines.length) return { ok: false, error: 'empty' }

  const mode: Mode = ['delivery', 'pickup', 'table'].includes(input.mode) ? input.mode : 'delivery'
  if (mode === 'table' && !/^\d{1,3}$/.test(input.table ?? '')) return { ok: false, error: 'invalid' }
  if (mode === 'delivery' && (input.address ?? '').trim().length < 4) return { ok: false, error: 'invalid' }

  const gate = canOrder({
    hours: settings.hours,
    closures: settings.closures,
    paused: settings.paused,
    pauseNote: settings.pauseNote,
    lastOrderMinutes: settings.lastOrderMinutes,
  }, serverNow())
  if (!gate.ok) return { ok: false, error: gate.reason }

  const subtotal = lines.reduce((s, l) => s + l.qty * l.unit, 0)
  const q = quote(subtotal, mode, settings, input.zoneId)
  if (q.belowMin) return { ok: false, error: 'min' }
  const payment = settings.paymentMethods.includes(input.payment) ? input.payment : settings.paymentMethods[0]

  const payload = await getPayload({ config })
  const start = businessDayStart()
  const today = await payload.count({ collection: 'orders', where: { createdAt: { greater_than_equal: start.toISOString() } } })
  const { iso } = yerevanNow(start)
  const ref = `M-${iso.slice(8, 10)}${iso.slice(5, 7)}-${String(today.totalDocs + 1).padStart(3, '0')}`
  const token = randomBytes(12).toString('base64url')
  const t = getDict(lang)
  const zone = mode === 'delivery' && q.zone ? `${q.zone.name}, ${q.zone.etaMin}–${q.zone.etaMax}′` : undefined
  const clean = (s?: string, n = 200) => (s ?? '').trim().replace(/\s+/g, ' ').slice(0, n)

  const order = await payload.create({
    collection: 'orders',
    overrideAccess: true,
    data: {
      ref,
      token,
      status: 'new',
      mode,
      table: mode === 'table' ? input.table : undefined,
      zone,
      payment,
      name: clean(input.name, 60),
      phone,
      address: mode === 'delivery' ? clean(input.address) : undefined,
      flat: mode === 'delivery' ? clean(input.flat, 80) : undefined,
      note: clean(input.note, 500),
      lines: lines.map((l) => ({ qty: l.qty, label: l.label, unit: l.unit, dish: l.id, opts: l.opts })),
      subtotal,
      fee: q.fee,
      total: q.total,
      channel: input.channel,
      lang,
      ipHash: createHash('sha256').update(ip).digest('hex').slice(0, 16),
    },
  })

  // the kitchen hears about it at once; a Telegram outage never loses the order
  try {
    const messageId = await notifyNew(order)
    if (messageId) await payload.update({ collection: 'orders', id: order.id, data: { kitchenMessageId: messageId }, overrideAccess: true })
  } catch (e) {
    payload.logger.error({ err: e }, 'telegram notify failed')
  }

  const message = orderMessage(
    {
      ref,
      lines: lines.map((l) => ({ name: l.label, qty: l.qty, price: l.unit })),
      mode,
      table: input.table,
      zone,
      fee: q.fee,
      payment,
      name: clean(input.name, 60),
      phone,
      address: clean(input.address),
      flat: clean(input.flat, 80),
      note: clean(input.note, 500),
    },
    t,
  )
  return { ok: true, ref, token, total: q.total, message }
}
