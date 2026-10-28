import type { MenuCategory, SiteSettings } from './data'
import { type Dict, fill, formatPrice, type Locale } from './i18n'

/*
 * Questions people (and AI assistants) ask about a street kitchen, answered only from the live settings and
 * menu — so an answer can never drift from what the site actually does.
 */
const Q = {
  hy: {
    where: 'Որտե՞ղ եք առաքում և որքա՞ն արժե',
    pay: 'Ինչպե՞ս կարող եմ վճարել',
    hours: 'Մինչև ժամը քանի՞սն եք պատվեր ընդունում',
    diet: 'Կա՞ն ուտեստներ առանց խոզի մսի կամ բուսակերային',
    table: 'Կարո՞ղ եմ պատվիրել սեղանից',
    zone: '{n}՝ {fee}, {a}–{b} րոպե, նվազագույնը {min}',
    free: ', անվճար {p}-ից',
    hoursA: 'Ամեն օր, ըստ ժամանակացույցի. {h}։ Առցանց պատվերներն ընդունում ենք մինչև փակվելուց {m} րոպե առաջ, հետո՝ զանգով։',
    noPork: 'Առանց խոզի մսի են մենյուի {n} ուտեստ, օրինակ՝ {list}։',
    veg: 'Բուսակերային՝ {list}։',
    tableA: 'Այո։ Սկանավորեք սեղանի QR կոդը, ընտրեք ուտեստները և ուղարկեք. պատվերը կգա ձեր սեղանին՝ առանց առաքման վճարի։',
    pickup: 'Կարող եք նաև վերցնել ինքներդ՝ {a}։',
  },
  ru: {
    where: 'Куда вы доставляете и сколько это стоит?',
    pay: 'Как можно оплатить?',
    hours: 'До какого времени принимаете заказы?',
    diet: 'Есть блюда без свинины или вегетарианские?',
    table: 'Можно заказать прямо со стола?',
    zone: '{n}: {fee}, {a}–{b} мин, минимум {min}',
    free: ', бесплатно от {p}',
    hoursA: 'Каждый день по графику: {h}. Онлайн-заказы принимаем до {m} минут до закрытия, дальше — по телефону.',
    noPork: 'Без свинины {n} блюд меню, например: {list}.',
    veg: 'Вегетарианские: {list}.',
    tableA: 'Да. Отсканируйте QR-код на столе, выберите блюда и отправьте — заказ принесут к вашему столу, без платы за доставку.',
    pickup: 'Можно забрать самим: {a}.',
  },
  en: {
    where: 'Where do you deliver and what does it cost?',
    pay: 'How can I pay?',
    hours: 'Until what time do you take orders?',
    diet: 'Are there pork-free or vegetarian dishes?',
    table: 'Can I order from my table?',
    zone: '{n}: {fee}, {a}–{b} min, minimum {min}',
    free: ', free from {p}',
    hoursA: 'Every day, on this schedule: {h}. Online orders close {m} minutes before closing; after that, call us.',
    noPork: '{n} dishes on the menu have no pork, for example: {list}.',
    veg: 'Vegetarian: {list}.',
    tableA: 'Yes. Scan the QR code on your table, pick your dishes and send: the order comes to your table, with no delivery fee.',
    pickup: 'You can also pick it up yourself: {a}.',
  },
}

export function faq(lang: Locale, s: SiteSettings, menu: MenuCategory[], t: Dict) {
  const q = Q[lang]
  const dishes = menu.flatMap((c) => c.dishes).filter((d) => d.available)
  const noPork = dishes.filter((d) => !d.containsPork)
  const veg = dishes.filter((d) => d.vegetarian)
  const hours = s.hours
    .map((h, i) => `${t.days[i]} ${h.closed ? t.visit.closed : h.open === h.close ? '24/7' : `${h.open}–${h.close}`}`)
    .join(', ')
  const zones = s.zones.map(
    (z) =>
      fill(q.zone, { n: z.name, fee: z.fee ? formatPrice(z.fee) : t.ticket.free, a: z.etaMin, b: z.etaMax, min: formatPrice(z.minOrder) }) +
      (z.freeFrom ? fill(q.free, { p: formatPrice(z.freeFrom) }) : ''),
  )
  return [
    { q: q.where, a: [...zones, fill(q.pickup, { a: s.address })].join('. ') + '.' },
    { q: q.pay, a: s.paymentMethods.map((m) => t.ticket.pay[m] ?? m).join(', ') + '.' },
    { q: q.hours, a: fill(q.hoursA, { h: hours, m: s.lastOrderMinutes }) },
    {
      q: q.diet,
      a: [
        fill(q.noPork, { n: noPork.length, list: noPork.slice(0, 4).map((d) => d.name).join(', ') }),
        veg.length ? fill(q.veg, { list: veg.map((d) => d.name).join(', ') }) : '',
      ]
        .filter(Boolean)
        .join(' '),
    },
    { q: q.table, a: q.tableA },
  ]
}
