import { type Dict, fill, formatPrice } from './i18n'
import { yerevanNow } from './hours'

/**
 * Armenian mobile/landline numbers in any common spelling → "+374 XX XXXXXX".
 * 091123456 · 91123456 · 37491123456 · +374 91 123456 · 00374… — anything else is rejected.
 * Foreign numbers are accepted only in full international form (+ and 10–15 digits).
 */
export function normalizePhone(input: string): string | null {
  const raw = input.trim()
  if (!raw || /[^\d\s()+-]/.test(raw)) return null
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('00')) d = d.slice(2)
  if (d.startsWith('374') && d.length === 11) d = d.slice(3)
  else if (d.startsWith('0') && d.length === 9) d = d.slice(1)
  else if (raw.startsWith('+') && !d.startsWith('374')) return d.length >= 10 && d.length <= 15 ? `+${d}` : null
  if (d.length !== 8 || /^(\d)\1{7}$/.test(d) || d.startsWith('0')) return null
  return `+374 ${d.slice(0, 2)} ${d.slice(2)}`
}

/** Short human reference the kitchen can say on the phone: M-DDMM-HHMM (Yerevan time). */
export function orderRef(date = new Date()) {
  const { iso, minutes } = yerevanNow(date)
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0')
  const mm = String(minutes % 60).padStart(2, '0')
  return `M-${iso.slice(8, 10)}${iso.slice(5, 7)}-${hh}${mm}`
}

export type OrderDraft = {
  ref: string
  lines: { name: string; qty: number; price: number }[]
  mode: 'delivery' | 'pickup' | 'table'
  table?: string
  zone?: string
  fee: number
  discount?: number
  promo?: string
  payment: string
  name: string
  phone: string
  address: string
  flat?: string
  note: string
}

export const orderTotals = (o: Pick<OrderDraft, 'lines' | 'fee' | 'discount'>) => {
  const subtotal = o.lines.reduce((s, l) => s + l.qty * l.price, 0)
  return { subtotal, total: subtotal - (o.discount ?? 0) + o.fee }
}

/** The message the guest sends: one block per topic, no stray blank lines, the note on one line. */
export function orderMessage(o: OrderDraft, t: Dict) {
  const { subtotal, total } = orderTotals(o)
  const tk = t.ticket
  const blocks = [
    [`${tk.msgHello}`, `${tk.orderRef} ${o.ref}`, ...(o.mode === 'table' && o.table ? [fill(tk.modeTable, { n: o.table })] : [])],
    o.lines.map((l) => `• ${l.qty} × ${l.name} — ${formatPrice(l.qty * l.price)}`),
    [
      `${tk.subtotal}: ${formatPrice(subtotal)}`,
      ...(o.discount ? [`${tk.discount}${o.promo ? ` (${o.promo})` : ''}: −${formatPrice(o.discount)}`] : []),
      o.mode === 'delivery'
        ? `${tk.delivery}${o.zone ? ` (${o.zone})` : ''}: ${o.fee ? formatPrice(o.fee) : tk.free}`
        : o.mode === 'pickup'
          ? `${tk.mode}: ${tk.modePickup}`
          : `${tk.mode}: ${fill(tk.modeTable, { n: o.table ?? '' })}`,
      `${tk.total}: ${formatPrice(total)}`,
      `${tk.payment}: ${tk.pay[o.payment] ?? o.payment}`,
    ],
    [
      `${tk.name}: ${o.name.trim()}`,
      `${tk.phone}: ${o.phone}`,
      ...(o.mode === 'delivery'
        ? [
            `${tk.address}: ${[o.address, o.flat ?? ''].map((x) => x.trim().replace(/\s+/g, ' ')).filter(Boolean).join(', ')}`,
          ]
        : []),
      ...(o.note.trim() ? [`${tk.note}: ${o.note.trim().replace(/\s+/g, ' ')}`] : []),
    ],
  ]
  return blocks.map((b) => b.join('\n')).join('\n\n')
}
