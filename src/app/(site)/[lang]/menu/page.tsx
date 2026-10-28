import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PrintButton } from '@/components/PrintButton'
import { getMenu } from '@/lib/data'
import { formatPrice, getDict, hasLocale } from '@/lib/i18n'

export const revalidate = 60

export async function generateMetadata({ params }: PageProps<'/[lang]/menu'>): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const t = getDict(lang)
  return {
    title: `${t.menu.title} · Matador`,
    description: t.meta.description,
    alternates: { canonical: `/${lang}/menu`, languages: { hy: '/hy/menu', ru: '/ru/menu', en: '/en/menu' } },
  }
}

/** The whole menu as one plain, printable page: for sharing, printing at the counter, and for crawlers. */
export default async function MenuPage({ params }: PageProps<'/[lang]/menu'>) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const t = getDict(lang)
  const menu = await getMenu(lang)
  return (
    <main className="legal print-menu">
      <article className="legal__card">
        <h1 className="display legal__title">{t.menu.title}</h1>
        {menu.map((c) => (
          <section key={c.slug}>
            <h2>{c.name}</h2>
            <ul className="print-menu__list">
              {c.dishes.map((d) => (
                <li key={d.id}>
                  <div className="print-menu__row">
                    <strong>{d.name}</strong>
                    <span>{formatPrice(d.price)}</span>
                  </div>
                  <p>
                    {[d.description, d.weight, d.spicy ? t.menu.spicy : '', d.containsPork ? t.menu.pork : '', d.vegetarian ? t.menu.veg : '']
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {d.allergens.length > 0 && (
                    <p className="ticket__fine">
                      {t.menu.allergens}: {d.allergens.map((a) => t.menu.allergen[a] ?? a).join(', ')}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
        <div className="qr__actions">
          <PrintButton label={t.qr.print} />
          <a className="btn btn--ghost" href={`/${lang}#menu`}>
            {t.hero.cta}
          </a>
        </div>
      </article>
    </main>
  )
}
