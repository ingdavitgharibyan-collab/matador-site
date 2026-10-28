import type { Payload } from 'payload'
import { expect, it } from 'vitest'

import { count, flush } from '@/lib/metrics'
import { quote } from '@/lib/pricing'
import { promoDiscount } from '@/lib/promo'

const settings = {
  zones: [{ id: 'z', name: 'Kentron', fee: 500, minOrder: 3000, freeFrom: 10000, etaMin: 30, etaMax: 45 }],
  deliveryFee: 0,
  freeDeliveryFrom: null,
}

it('promo: percent and fixed discounts, free delivery, minimum counted before the discount', () => {
  expect(promoDiscount({ code: 'A', kind: 'percent', value: 10, minOrder: 0 }, 4200)).toBe(420)
  expect(promoDiscount({ code: 'B', kind: 'fixed', value: 5000, minOrder: 0 }, 4200)).toBe(4200)
  expect(quote(4200, 'delivery', settings, 'z', { code: 'A', kind: 'percent', value: 10, minOrder: 0 })).toMatchObject({ discount: 420, fee: 500, total: 4280 })
  expect(quote(4200, 'delivery', settings, 'z', { code: 'F', kind: 'free_delivery', value: 0, minOrder: 0 })).toMatchObject({ fee: 0, total: 4200 })
  expect(quote(3000, 'delivery', settings, 'z', { code: 'B', kind: 'fixed', value: 1000, minOrder: 0 }).belowMin).toBe(false)
})

it('metrics: counts per event and language are merged into one row per day', async () => {
  const rows: Record<string, { id: number; day: string; counts: Record<string, number> }> = {}
  const fake = {
    find: async ({ where }: { where: { day: { equals: string } } }) => ({ docs: rows[where.day.equals] ? [rows[where.day.equals]] : [] }),
    create: async ({ data }: { data: { day: string; counts: Record<string, number> } }) => (rows[data.day] = { id: 1, ...data }),
    update: async ({ data }: { data: { counts: Record<string, number> } }) => {
      const r = Object.values(rows)[0]
      r.counts = data.counts
      return r
    },
  } as unknown as Payload
  count(fake, 'view', 'hy')
  count(fake, 'view', 'ru')
  count(fake, 'add', 'hy')
  await flush(fake)
  count(fake, 'view', 'hy')
  await flush(fake)
  const day = Object.values(rows)[0]
  expect(day.counts).toMatchObject({ view: 3, 'view:hy': 2, 'view:ru': 1, add: 1 })
})
