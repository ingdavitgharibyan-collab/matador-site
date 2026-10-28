import type { MenuDish, SiteSettings } from './data'
import { lineLabel, unitPrice, validOpts } from './menu'

export type Mode = 'delivery' | 'pickup' | 'table'
export type LineInput = { id: string; qty: number; opts: string[] }
export type PricedLine = { id: string; qty: number; opts: string[]; label: string; unit: number; dish: MenuDish }

/** Lines as the kitchen will cook them: only existing, available dishes; valid choices; 1–99. */
export function priceLines(input: LineInput[], byId: Map<string, MenuDish>): PricedLine[] {
  return input.flatMap((l) => {
    const dish = byId.get(String(l.id))
    const qty = Math.floor(Number(l.qty))
    if (!dish?.available || !Number.isFinite(qty) || qty < 1) return []
    const opts = validOpts(dish, (l.opts ?? []).map(String))
    return [{ id: dish.id, qty: Math.min(99, qty), opts, label: lineLabel(dish, opts), unit: unitPrice(dish, opts), dish }]
  })
}

/** The same numbers in the ticket and on the server: subtotal, delivery fee, total, minimum order. */
export function quote(subtotal: number, mode: Mode, settings: Pick<SiteSettings, 'zones' | 'deliveryFee' | 'freeDeliveryFrom'>, zoneId?: string) {
  const zone = settings.zones.find((z) => z.id === zoneId) ?? settings.zones[0] ?? null
  const baseFee = zone ? zone.fee : settings.deliveryFee
  const freeFrom = zone ? zone.freeFrom : settings.freeDeliveryFrom
  const minOrder = mode === 'delivery' && zone ? zone.minOrder : 0
  const fee = mode !== 'delivery' || subtotal === 0 ? 0 : freeFrom && subtotal >= freeFrom ? 0 : baseFee
  return { zone, fee, freeFrom, minOrder, belowMin: minOrder > 0 && subtotal < minOrder, total: subtotal + fee }
}
