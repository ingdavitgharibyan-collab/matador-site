import type { Payload } from 'payload'

export type Promo = { code: string; kind: 'percent' | 'fixed' | 'free_delivery'; value: number; minOrder: number }
export type PromoCheck = { ok: true; promo: Promo; id: number | string } | { ok: false; error: 'unknown' | 'min'; minOrder?: number }

/** A code is good when active, in its dates, under its use limit and the order reaches its minimum. */
export async function findPromo(payload: Payload, raw: string, subtotal: number, now = new Date()): Promise<PromoCheck> {
  const code = raw.trim().toUpperCase()
  if (!/^[A-Z0-9-]{3,24}$/.test(code)) return { ok: false, error: 'unknown' }
  const { docs } = await payload.find({ collection: 'promo-codes', where: { code: { equals: code } }, limit: 1, depth: 0, overrideAccess: true })
  const p = docs[0]
  if (!p || !p.active) return { ok: false, error: 'unknown' }
  if (p.validFrom && new Date(p.validFrom) > now) return { ok: false, error: 'unknown' }
  if (p.validTo && new Date(new Date(p.validTo).getTime() + 86_400_000) < now) return { ok: false, error: 'unknown' }
  if (p.maxUses && (p.uses ?? 0) >= p.maxUses) return { ok: false, error: 'unknown' }
  if (p.minOrder && subtotal < p.minOrder) return { ok: false, error: 'min', minOrder: p.minOrder }
  return { ok: true, id: p.id, promo: { code: p.code, kind: p.kind, value: p.value ?? 0, minOrder: p.minOrder ?? 0 } }
}

/** Discount in AMD on the dishes (free delivery is applied to the fee instead). */
export const promoDiscount = (p: Promo | null | undefined, subtotal: number) =>
  !p ? 0 : p.kind === 'percent' ? Math.round((subtotal * Math.min(100, p.value)) / 100) : p.kind === 'fixed' ? Math.min(subtotal, p.value) : 0
