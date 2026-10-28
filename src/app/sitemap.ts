import config from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import { siteUrl } from '@/lib/url'

export const revalidate = 3600

/** Every language version of each public page, dated by the last menu or settings change. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const payload = await getPayload({ config })
  const [dish, settings] = await Promise.all([
    payload.find({ collection: 'dishes', sort: '-updatedAt', limit: 1, depth: 0 }),
    payload.findGlobal({ slug: 'settings', depth: 0 }),
  ])
  const lastModified = new Date(
    Math.max(new Date(dish.docs[0]?.updatedAt ?? 0).getTime(), new Date(settings.updatedAt ?? 0).getTime()) || Date.now(),
  )
  const pages: [string, number][] = [
    ['', 1],
    ['/menu', 0.9],
    ['/terms', 0.3],
    ['/privacy', 0.3],
  ]
  return pages.flatMap(([path, priority]) =>
    (['hy', 'ru', 'en'] as const).map((l) => ({
      url: `${base}/${l}${path}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: l === 'hy' ? priority : priority * 0.9,
      alternates: { languages: { hy: `${base}/hy${path}`, ru: `${base}/ru${path}`, en: `${base}/en${path}` } },
    })),
  )
}
