import type { Metadata, Viewport } from 'next'
import { Noto_Sans, Noto_Sans_Armenian } from 'next/font/google'
import { notFound } from 'next/navigation'

import { CartProvider } from '@/components/cart'
import { getMenu } from '@/lib/data'
import { getDict, hasLocale, locales } from '@/lib/i18n'
import { siteUrl } from '@/lib/url'
import '../site.css'

const latin = Noto_Sans({ subsets: ['latin', 'cyrillic'], axes: ['wdth'], variable: '--font-latin', display: 'swap' })
const armenian = Noto_Sans_Armenian({ subsets: ['armenian'], axes: ['wdth'], variable: '--font-armenian', display: 'swap' })

const OG_LOCALE = { hy: 'hy_AM', ru: 'ru_RU', en: 'en_US' } as const

export const generateStaticParams = () => locales.map((lang) => ({ lang }))
export const viewport: Viewport = { themeColor: '#120d0b' }

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const t = getDict(lang)
  return {
    metadataBase: new URL(siteUrl()),
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: { hy: '/hy', ru: '/ru', en: '/en', 'x-default': '/hy' },
    },
    openGraph: {
      type: 'website',
      title: t.meta.title,
      description: t.meta.description,
      url: `/${lang}`,
      siteName: 'Matador',
      locale: OG_LOCALE[lang],
      alternateLocale: locales.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
      images: [{ url: '/brand/og.jpg', width: 1200, height: 630, alt: 'Matador' }],
    },
  }
}

export default async function SiteLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const menu = await getMenu(lang)
  return (
    <html lang={lang} className={`${latin.variable} ${armenian.variable}`}>
      <body>
        <CartProvider dishes={menu.flatMap((c) => c.dishes)}>{children}</CartProvider>
      </body>
    </html>
  )
}
