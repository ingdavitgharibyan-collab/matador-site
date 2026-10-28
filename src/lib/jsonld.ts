import type { MenuCategory, SiteSettings } from './data'
import type { Dict, Locale } from './i18n'
import { siteUrl } from './url'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/** schema.org Restaurant + Menu, so search engines can show hours, address and dishes. */
export function jsonLd(lang: Locale, menu: MenuCategory[], s: SiteSettings, t: Dict) {
  const url = `${siteUrl()}/${lang}`
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${siteUrl()}/#restaurant`,
    name: 'Matador',
    description: t.meta.description,
    url,
    image: `${siteUrl()}/brand/logo.webp`,
    logo: `${siteUrl()}/brand/bull.webp`,
    telephone: s.phone,
    servesCuisine: ['Shawarma', 'Burgers', 'Barbecue', 'Armenian'],
    priceRange: '֏֏',
    currenciesAccepted: 'AMD',
    address: { '@type': 'PostalAddress', streetAddress: s.address, addressLocality: 'Yerevan', addressCountry: 'AM' },
    geo: { '@type': 'GeoCoordinates', latitude: s.lat, longitude: s.lng },
    openingHoursSpecification: s.hours
      .map((h, i) => (h.closed ? null : { '@type': 'OpeningHoursSpecification', dayOfWeek: DAYS[i], opens: h.open, closes: h.close }))
      .filter(Boolean),
    sameAs: [s.instagram, s.facebook].filter(Boolean),
    acceptsReservations: false,
    hasMenu: {
      '@type': 'Menu',
      url: `${url}#menu`,
      inLanguage: lang,
      hasMenuSection: menu.map((c) => ({
        '@type': 'MenuSection',
        name: c.name,
        hasMenuItem: c.dishes.map((d) => ({
          '@type': 'MenuItem',
          name: d.name,
          description: d.description,
          offers: { '@type': 'Offer', price: d.price, priceCurrency: 'AMD', availability: d.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
        })),
      })),
    },
  }
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
