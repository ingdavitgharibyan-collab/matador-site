import 'server-only'
import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Locale } from './i18n'

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
}
export type MenuCategory = { slug: string; name: string; tagline: string; dishes: MenuDish[] }
export type Hours = { open: string; close: string; closed: boolean }[]
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
  deliveryFee: number
  freeDeliveryFrom: number | null
  partners: { name: string; url: string }[]
}

const payload = cache(() => getPayload({ config }))

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
            photo: photo?.url ? { url: photo.sizes?.card?.url || photo.url, alt: photo.alt ?? d.name } : null,
            category: c.slug,
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
    deliveryFee: s.deliveryFee ?? 0,
    freeDeliveryFrom: s.freeDeliveryFrom ?? null,
    partners: (s.partners ?? []).map((x) => ({ name: x.name, url: x.url })),
  }
})
