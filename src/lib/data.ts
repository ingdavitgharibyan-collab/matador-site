import 'server-only'
import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { type Closure, type Hours, yerevanDate } from './hours'
import type { Locale } from './i18n'

export type { Hours }

export type MenuDish = {
  id: string
  name: string
  description: string
  ingredients: string
  price: number
  weight: string
  spicy: boolean
  signature: boolean
  available: boolean
  art: string
  photo: { url: string; alt: string } | null
  category: string
  containsPork: boolean
  vegetarian: boolean
  allergens: string[]
  optionGroups: OptionGroup[]
}
export type OptionGroup = {
  id: string
  name: string
  multi: boolean
  required: boolean
  options: { id: string; name: string; price: number }[]
}
export type DeliveryZone = { id: string; name: string; fee: number; minOrder: number; freeFrom: number | null; etaMin: number; etaMax: number }
export type MenuCategory = { slug: string; name: string; tagline: string; dishes: MenuDish[] }
export type SiteSettings = {
  phone: string
  whatsapp: string
  telegram: string
  instagram: string
  facebook: string
  address: string
  lat: number
  lng: number
  hours: Hours
  closures: Closure[]
  paused: boolean
  pauseNote: string
  lastOrderMinutes: number
  paymentMethods: string[]
  deliveryFee: number
  freeDeliveryFrom: number | null
  zones: DeliveryZone[]
  partners: { name: string; url: string }[]
}

const payload = cache(() => getPayload({ config }))

/**
 * Payload stores upload URLs as absolute (serverURL + path). next/image only accepts local paths, so keep
 * the path: the file is served by this same app whatever host the visitor used.
 */
const localPath = (u?: string | null) => {
  if (!u) return null
  if (u.startsWith('/')) return u
  try {
    return new URL(u).pathname
  } catch {
    return null
  }
}

export const getMenu = cache(async (locale: Locale): Promise<MenuCategory[]> => {
  const p = await payload()
  const [cats, dishes] = await Promise.all([
    p.find({ collection: 'categories', locale, sort: 'order', limit: 100, depth: 0 }),
    p.find({ collection: 'dishes', locale, sort: 'order', limit: 500, depth: 1 }),
  ])
  return cats.docs
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      tagline: c.tagline ?? '',
      dishes: dishes.docs
        .filter((d) => (typeof d.category === 'object' ? d.category?.id : d.category) === c.id)
        .map((d) => {
          const photo = d.photo && typeof d.photo === 'object' ? d.photo : null
          const photoUrl = localPath(photo?.sizes?.card?.url || photo?.url)
          return {
            id: String(d.id),
            name: d.name,
            description: d.description ?? '',
            ingredients: d.ingredients ?? '',
            price: d.price,
            weight: d.weight ?? '',
            spicy: Boolean(d.spicy),
            signature: Boolean(d.signature),
            available: d.available !== false,
            art: d.art ?? 'burger',
            photo: photoUrl ? { url: photoUrl, alt: photo?.alt ?? d.name } : null,
            category: c.slug,
            containsPork: Boolean(d.containsPork),
            vegetarian: Boolean(d.vegetarian),
            allergens: (d.allergens ?? []) as string[],
            optionGroups: (d.optionGroups ?? [])
              .map((g) => ({
                id: String(g.id),
                name: g.name,
                multi: Boolean(g.multi),
                required: Boolean(g.required),
                options: (g.options ?? []).map((o) => ({ id: String(o.id), name: o.name, price: o.price ?? 0 })),
              }))
              .filter((g) => g.options.length > 0),
          }
        }),
    }))
    .filter((c) => c.dishes.length > 0)
})

export const getSettings = cache(async (locale: Locale): Promise<SiteSettings> => {
  const p = await payload()
  const s = await p.findGlobal({ slug: 'settings', locale, depth: 0 })
  return {
    phone: s.phone ?? '',
    whatsapp: s.whatsapp ?? '',
    telegram: s.telegram ?? '',
    instagram: s.instagram ?? '',
    facebook: s.facebook ?? '',
    address: s.address ?? '',
    lat: s.lat ?? 40.1792,
    lng: s.lng ?? 44.5133,
    hours: (s.hours ?? []).map((h) => ({ open: h.open ?? '11:00', close: h.close ?? '02:00', closed: Boolean(h.closed) })),
    closures: (s.closures ?? []).map((c) => ({ from: yerevanDate(c.from), to: yerevanDate(c.to), note: c.note ?? '' })),
    paused: Boolean(s.ordersPaused),
    pauseNote: s.pauseNote ?? '',
    lastOrderMinutes: s.lastOrderMinutes ?? 30,
    paymentMethods: s.paymentMethods?.length ? s.paymentMethods : ['cash'],
    zones: (s.deliveryZones ?? []).map((z) => ({
      id: String(z.id),
      name: z.name,
      fee: z.fee ?? 0,
      minOrder: z.minOrder ?? 0,
      freeFrom: z.freeFrom ?? null,
      etaMin: z.etaMin ?? 30,
      etaMax: z.etaMax ?? 45,
    })),
    deliveryFee: s.deliveryFee ?? 0,
    freeDeliveryFrom: s.freeDeliveryFrom ?? null,
    partners: (s.partners ?? []).map((x) => ({ name: x.name, url: x.url })),
  }
})
