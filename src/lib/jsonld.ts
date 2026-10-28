import type { MenuCategory, SiteSettings } from './data'
import type { Dict, Locale } from './i18n'
import { siteUrl } from './url'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const PAY_EN: Record<string, string> = {
  cash: 'Cash',
  card_courier: 'Credit Card',
  idram: 'Idram',
  telcell: 'Telcell',
  transfer: 'Bank transfer',
}

/**
 * schema.org Restaurant + Menu + FAQPage: what search engines and AI assistants read to answer "where", "when",
 * "how much", "how to pay", "what's on the menu". Built from the same data the page shows.
 */
export function jsonLd(lang: Locale, menu: MenuCategory[], s: SiteSettings, t: Dict, faq: { q: string; a: string }[]) {
  const base = siteUrl()
  const url = `${base}/${lang}`
  const restaurant = {
    '@type': 'FastFoodRestaurant',
    '@id': `${base}/#restaurant`,
    name: 'Matador',
    alternateName: ['Մատադոր', 'Матадор'],
    description: t.meta.description,
    url,
    image: `${base}/brand/logo.webp`,
    logo: `${base}/brand/bull.webp`,
    telephone: s.phone,
    servesCuisine: ['Fast food', 'Shawarma', 'Burgers', 'Barbecue', 'Armenian'],
    priceRange: '֏֏',
    currenciesAccepted: 'AMD',
    paymentAccepted: s.paymentMethods.map((m) => PAY_EN[m] ?? m).join(', '),
    address: { '@type': 'PostalAddress', streetAddress: s.address, addressLocality: 'Ashtarak', addressRegion: 'Aragatsotn', addressCountry: 'AM' },
    geo: { '@type': 'GeoCoordinates', latitude: s.lat, longitude: s.lng },
    hasMap: s.googleMapsUrl || `https://www.google.com/maps?q=${s.lat},${s.lng}`,
    areaServed: s.zones.map((z) => ({ '@type': 'Place', name: z.name })),
    openingHoursSpecification: s.hours
      .map((h, i) => (h.closed ? null : { '@type': 'OpeningHoursSpecification', dayOfWeek: DAYS[i], opens: h.open, closes: h.close }))
      .filter(Boolean),
    specialOpeningHoursSpecification: s.closures.map((c) => ({
      '@type': 'OpeningHoursSpecification',
      validFrom: c.from,
      validThrough: c.to,
      opens: '00:00',
      closes: '00:00',
    })),
    sameAs: [s.instagram, s.facebook, s.telegram ? `https://t.me/${s.telegram}` : '', s.googleMapsUrl, s.yandexMapsUrl, s.twoGisUrl].filter(Boolean),
    acceptsReservations: false,
    potentialAction: {
      '@type': 'OrderAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${url}#menu`, inLanguage: lang, actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'] },
      deliveryMethod: ['http://purl.org/goodrelations/v1#DeliveryModeOwnFleet', 'http://purl.org/goodrelations/v1#DeliveryModePickUp'],
    },
    hasMenu: {
      '@type': 'Menu',
      url: `${url}/menu`,
      inLanguage: lang,
      hasMenuSection: menu.map((c) => ({
        '@type': 'MenuSection',
        name: c.name,
        hasMenuItem: c.dishes.map((d) => ({
          '@type': 'MenuItem',
          name: d.name,
          description: d.description,
          ...(d.photo ? { image: `${base}${d.photo.url}` } : {}),
          ...(d.vegetarian ? { suitableForDiet: 'https://schema.org/VegetarianDiet' } : {}),
          offers: {
            '@type': 'Offer',
            price: d.price,
            priceCurrency: 'AMD',
            availability: d.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
        })),
      })),
    },
  }
  const faqPage = {
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [restaurant, faqPage] }).replace(/</g, '\\u003c')
}
