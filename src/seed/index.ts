import type { Payload } from 'payload'

import { categories, dishes, settings } from './menu'

/**
 * First boot only: fills an empty database with the sample menu and contacts so the site renders
 * at full density. Everything here is sample content to be confirmed and edited in /admin.
 */
export async function seedIfEmpty(payload: Payload) {
  const existing = await payload.count({ collection: 'categories' })
  if (existing.totalDocs > 0) return

  payload.logger.info('Seeding the sample Matador menu…')
  const ids: Record<string, number | string> = {}

  for (const [order, c] of categories.entries()) {
    const doc = await payload.create({
      collection: 'categories',
      locale: 'hy',
      data: { slug: c.slug, name: c.name.hy, tagline: c.tagline.hy, order },
    })
    for (const locale of ['ru', 'en'] as const) {
      await payload.update({
        collection: 'categories',
        id: doc.id,
        locale,
        data: { name: c.name[locale], tagline: c.tagline[locale] },
      })
    }
    ids[c.slug] = doc.id
  }

  for (const [order, d] of dishes.entries()) {
    const doc = await payload.create({
      collection: 'dishes',
      locale: 'hy',
      data: {
        name: d.name.hy,
        description: d.description.hy,
        ingredients: d.ingredients.hy,
        category: ids[d.category] as number,
        price: d.price,
        weight: d.weight,
        spicy: d.spicy ?? false,
        signature: d.signature ?? false,
        available: true,
        art: d.art,
        order,
      },
    })
    for (const locale of ['ru', 'en'] as const) {
      await payload.update({
        collection: 'dishes',
        id: doc.id,
        locale,
        data: { name: d.name[locale], description: d.description[locale], ingredients: d.ingredients[locale] },
      })
    }
  }

  await payload.updateGlobal({ slug: 'settings', locale: 'hy', data: { ...settings, address: settings.address.hy } })
  for (const locale of ['ru', 'en'] as const) {
    await payload.updateGlobal({ slug: 'settings', locale, data: { address: settings.address[locale] } })
  }

  const users = await payload.count({ collection: 'users' })
  if (users.totalDocs === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    await payload.create({
      collection: 'users',
      data: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
    })
  }
  payload.logger.info('Seed done.')
}
