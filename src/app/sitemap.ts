import type { MetadataRoute } from 'next'

import { siteUrl } from '@/lib/url'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  const languages = { hy: `${base}/hy`, ru: `${base}/ru`, en: `${base}/en` }
  return (['hy', 'ru', 'en'] as const).map((l) => ({
    url: `${base}/${l}`,
    changeFrequency: 'weekly',
    priority: l === 'hy' ? 1 : 0.8,
    alternates: { languages },
  }))
}
