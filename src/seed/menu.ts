/*
 * SAMPLE CONTENT — dish names, prices, weights, address, phone and hours are placeholders so the
 * design can be judged at full density. Confirm or replace each one in /admin before launch.
 */
type L = { hy: string; ru: string; en: string }

export const categories: { slug: string; name: L; tagline: L }[] = [
  {
    slug: 'shawarma',
    name: { hy: 'Շաուրմա', ru: 'Шаурма', en: 'Shawarma' },
    tagline: { hy: 'Լավաշի մեջ', ru: 'В лаваше', en: 'In lavash' },
  },
  {
    slug: 'kebab',
    name: { hy: 'Քյաբաբ', ru: 'Кебаб', en: 'Kebab' },
    tagline: { hy: 'Շամփուրի վրա, ածուխով', ru: 'На шампуре, на углях', en: 'On the skewer, over charcoal' },
  },
  {
    slug: 'bbq',
    name: { hy: 'BBQ', ru: 'BBQ', en: 'BBQ' },
    tagline: { hy: 'Փոքր կտորներով, ածուխի վրա', ru: 'Небольшими кусочками на углях', en: 'Bite-size pieces over charcoal' },
  },
  {
    slug: 'burgers',
    name: { hy: 'Բուրգերներ', ru: 'Бургеры', en: 'Burgers' },
    tagline: { hy: 'Հավով կամ Angus', ru: 'С курицей или Angus', en: 'Chicken or Angus' },
  },
  {
    slug: 'drinks',
    name: { hy: 'Ըմպելիքներ', ru: 'Напитки', en: 'Drinks' },
    tagline: { hy: 'Սառը', ru: 'Холодные', en: 'Cold' },
  },
]

type Dish = {
  category: string
  name: L
  description: L
  ingredients: L
  price: number
  weight: string
  art: 'shawarma' | 'plate' | 'burger' | 'skewer' | 'ribs' | 'fries' | 'salad' | 'drink' | 'sauce'
  spicy?: boolean
  signature?: boolean
}

/*
 * The working menu (owner's list, 29.10.2026): names, groups and prices. Descriptions, ingredients, weights and
 * the drinks' names are still SAMPLE — portion weights stay empty until the cooked portion is confirmed.
 */
// hy: the meat's genitive ("հավի միս"); ru: nominative and genitive
type M = { hy: string; ru: string; ruOf: string; en: string }
const MEAT: Record<string, M> = {
  chicken: { hy: 'հավի', ru: 'курица', ruOf: 'курицы', en: 'chicken' },
  pork: { hy: 'խոզի', ru: 'свинина', ruOf: 'свинины', en: 'pork' },
  angus: { hy: 'Angus տավարի', ru: 'говядина Angus', ruOf: 'говядины Angus', en: 'Angus beef' },
  turkey: { hy: 'հնդկահավի', ru: 'индейка', ruOf: 'индейки', en: 'turkey' },
  lamb: { hy: 'գառան', ru: 'баранина', ruOf: 'баранины', en: 'lamb' },
}
type Meat = 'chicken' | 'pork' | 'angus' | 'turkey' | 'lamb'
const NAMES: Record<string, Record<Meat, L>> = {
  shawarma: {
    chicken: { hy: 'Հավի շաուրմա', ru: 'Шаурма с курицей', en: 'Chicken shawarma' },
    pork: { hy: 'Խոզի շաուրմա', ru: 'Шаурма со свининой', en: 'Pork shawarma' },
    angus: { hy: 'Angus շաուրմա', ru: 'Шаурма Angus', en: 'Angus shawarma' },
    turkey: { hy: '', ru: '', en: '' },
    lamb: { hy: '', ru: '', en: '' },
  },
  kebab: {
    chicken: { hy: 'Հավի քյաբաբ', ru: 'Кебаб из курицы', en: 'Chicken kebab' },
    turkey: { hy: 'Հնդկահավի քյաբաբ', ru: 'Кебаб из индейки', en: 'Turkey kebab' },
    angus: { hy: 'Angus քյաբաբ', ru: 'Кебаб Angus', en: 'Angus kebab' },
    lamb: { hy: 'Գառան քյաբաբ', ru: 'Кебаб из баранины', en: 'Lamb kebab' },
    pork: { hy: '', ru: '', en: '' },
  },
  bbq: {
    chicken: { hy: 'Հավի BBQ', ru: 'BBQ из курицы', en: 'Chicken BBQ' },
    pork: { hy: 'Խոզի BBQ', ru: 'BBQ из свинины', en: 'Pork BBQ' },
    angus: { hy: 'Angus BBQ', ru: 'BBQ Angus', en: 'Angus BBQ' },
    lamb: { hy: 'Գառան BBQ', ru: 'BBQ из баранины', en: 'Lamb BBQ' },
    turkey: { hy: '', ru: '', en: '' },
  },
  burgers: {
    chicken: { hy: 'Հավի բուրգեր', ru: 'Бургер с курицей', en: 'Chicken burger' },
    angus: { hy: 'Angus բուրգեր', ru: 'Бургер Angus', en: 'Angus burger' },
    pork: { hy: '', ru: '', en: '' },
    turkey: { hy: '', ru: '', en: '' },
    lamb: { hy: '', ru: '', en: '' },
  },
}
const TEXT: Record<string, { description: (m: M) => L; ingredients: (m: M) => L; art: Dish['art'] }> = {
  shawarma: {
    description: (m) => ({
      hy: `Թարմ ${m.hy} միս շամփուրից, բանջարեղեն և սոուս՝ լավաշի մեջ։`,
      ru: `Свежая ${m.ru} с вертела, овощи и соус в лаваше.`,
      en: `Fresh ${m.en} off the spit, vegetables and sauce in lavash.`,
    }),
    ingredients: (m) => ({ hy: `${m.hy} միս, լոլիկ, վարունգ, կաղամբ, սոուս, լավաշ`, ru: `${m.ru}, помидор, огурец, капуста, соус, лаваш`, en: `${m.en}, tomato, cucumber, cabbage, sauce, lavash` }),
    art: 'shawarma',
  },
  kebab: {
    description: (m) => ({
      hy: `Աղացած ${m.hy} միս սոխով և համեմունքներով, շամփուրի վրա, լավաշով։`,
      ru: `Рубленая ${m.ru} с луком и специями на шампуре, с лавашом.`,
      en: `Minced ${m.en} with onion and spices on the skewer, with lavash.`,
    }),
    ingredients: (m) => ({ hy: `${m.hy} միս, սոխ, համեմունքներ, կանաչի, լավաշ`, ru: `${m.ru}, лук, специи, зелень, лаваш`, en: `${m.en}, onion, spices, herbs, lavash` }),
    art: 'skewer',
  },
  bbq: {
    description: (m) => ({
      hy: `${cap(m.hy)} միս՝ փոքր կտորներով ածուխի վրա, սոխով, կանաչիով և սոուսով։`,
      ru: `${cap(m.ru)} небольшими кусочками на углях, с луком, зеленью и соусом.`,
      en: `${cap(m.en)} in bite-size pieces over charcoal, with onion, herbs and sauce.`,
    }),
    ingredients: (m) => ({ hy: `${m.hy} միս, սոխ, կանաչի, սոուս, լավաշ`, ru: `${m.ru}, лук, зелень, соус, лаваш`, en: `${m.en}, onion, herbs, sauce, lavash` }),
    art: 'plate',
  },
  burgers: {
    description: (m) => ({
      hy: `${cap(m.hy)} կոտլետ, թարմ բանջարեղեն և սոուս՝ բուլկու մեջ։`,
      ru: `Котлета из ${m.ruOf}, свежие овощи и соус в булочке.`,
      en: `${cap(m.en)} patty, fresh vegetables and sauce in a bun.`,
    }),
    ingredients: (m) => ({ hy: `${m.hy} միս, բուլկի, լոլիկ, սալաթ, սոուս`, ru: `${m.ru}, булочка, помидор, салат, соус`, en: `${m.en}, bun, tomato, lettuce, sauce` }),
    art: 'burger',
  },
}
const cap = (x: string) => x[0].toUpperCase() + x.slice(1)
const item = (category: string, meat: keyof typeof NAMES.shawarma, price: number, signature = false): Dish => ({
  category,
  name: NAMES[category][meat],
  description: TEXT[category].description(MEAT[meat]),
  ingredients: TEXT[category].ingredients(MEAT[meat]),
  price,
  weight: '',
  art: TEXT[category].art,
  ...(signature ? { signature } : {}),
})

export const dishes: Dish[] = [
  item('shawarma', 'chicken', 1200, true),
  item('shawarma', 'pork', 1400),
  item('shawarma', 'angus', 2200),
  item('kebab', 'chicken', 1100),
  item('kebab', 'turkey', 1200),
  item('kebab', 'angus', 2600),
  item('kebab', 'lamb', 1900),
  item('bbq', 'chicken', 1200),
  item('bbq', 'pork', 1900),
  item('bbq', 'angus', 2800),
  item('bbq', 'lamb', 2000),
  item('burgers', 'chicken', 1500),
  item('burgers', 'angus', 2500, true),
  // drinks: the working price is an average of 500 ֏; the drinks themselves are SAMPLE
  {
    category: 'drinks',
    name: { hy: 'Թան', ru: 'Тан', en: 'Tan' },
    description: { hy: 'Սառը, թեթև աղի։', ru: 'Холодный, слегка солёный.', en: 'Tan: a cold, lightly salted Armenian yogurt drink.' },
    ingredients: { hy: 'մածուն, ջուր, աղ', ru: 'мацун, вода, соль', en: 'matsun, water, salt' },
    price: 500,
    weight: '0.5 L',
    art: 'drink',
  },
  {
    category: 'drinks',
    name: { hy: 'Կոլա', ru: 'Кола', en: 'Cola' },
    description: { hy: 'Սառը։', ru: 'Холодная.', en: 'Cold.' },
    ingredients: { hy: 'կոլա', ru: 'кола', en: 'cola' },
    price: 500,
    weight: '0.33 L',
    art: 'drink',
  },
  {
    category: 'drinks',
    name: { hy: 'Ջուր', ru: 'Вода', en: 'Water' },
    description: { hy: 'Գազավորված կամ առանց գազի։', ru: 'С газом или без.', en: 'Sparkling or still.' },
    ingredients: { hy: 'ջուր', ru: 'вода', en: 'water' },
    price: 500,
    weight: '0.5 L',
    art: 'drink',
  },
]

export const settings = {
  phone: '+374 99 000000',
  whatsapp: '37499000000',
  telegram: 'matador_am',
  instagram: 'https://instagram.com/',
  facebook: 'https://facebook.com/',
  address: {
    hy: 'Աշտարակ (հասցեն՝ նմուշ)',
    ru: 'Аштарак (адрес — образец)',
    en: 'Ashtarak (sample address)',
  },
  lat: 40.299,
  lng: 44.362,
  hours: Array.from({ length: 7 }, () => ({ open: '10:00', close: '00:00', closed: false })),
  deliveryFee: 500,
  freeDeliveryFrom: 10000,
  partners: [
    // SAMPLE store pages: replace with Matador's real listing on each service
    { name: 'Yandex Eats', url: 'https://eda.yandex.am/r/matador' },
    { name: 'Wolt', url: 'https://wolt.com/hy/arm/yerevan/restaurant/matador' },
    { name: 'Glovo', url: 'https://glovoapp.com/am/en/yerevan/matador' },
    { name: 'Menu.am', url: 'https://www.menu.am/en/yerevan/delivery/restaurant/matador' },
  ],
  paymentMethods: ['cash', 'card_courier'] as ('cash' | 'card_courier')[],
  lastOrderMinutes: 30,
}

/* SAMPLE choices, diet flags and allergens per dish (keyed by the English name) — confirm with the kitchen. */
type Opt = { name: L; price?: number }
type Group = { name: L; multi?: boolean; required?: boolean; options: Opt[] }
const sauce: Group = {
  name: { hy: 'Սոուս', ru: 'Соус', en: 'Sauce' },
  required: true,
  options: [
    { name: { hy: 'Սխտորով', ru: 'Чесночный', en: 'Garlic' } },
    { name: { hy: 'Թահինի', ru: 'Тахини', en: 'Tahini' } },
    { name: { hy: 'Կծու կարմիր', ru: 'Острый красный', en: 'Hot red' } },
  ],
}
const without = (items: L[]): Group => ({
  name: { hy: 'Առանց', ru: 'Без', en: 'Without' },
  multi: true,
  options: items.map((name) => ({ name })),
})
const ONION = { hy: 'սոխի', ru: 'лука', en: 'onion' }
const PICKLES = { hy: 'թթու վարունգի', ru: 'огурчиков', en: 'pickles' }
const TOMATO = { hy: 'լոլիկի', ru: 'помидора', en: 'tomato' }

export const dishExtras: Record<
  string,
  { containsPork?: boolean; vegetarian?: boolean; allergens?: string[]; optionGroups?: Group[] }
> = {
  'Chicken shawarma': { allergens: ['gluten', 'egg'], optionGroups: [sauce, without([ONION, PICKLES, TOMATO])] },
  'Pork shawarma': { containsPork: true, allergens: ['gluten', 'egg'], optionGroups: [sauce, without([ONION, PICKLES, TOMATO])] },
  'Angus shawarma': { allergens: ['gluten', 'egg'], optionGroups: [sauce, without([ONION, PICKLES, TOMATO])] },
  'Chicken kebab': { allergens: ['gluten'], optionGroups: [without([ONION])] },
  'Turkey kebab': { allergens: ['gluten'], optionGroups: [without([ONION])] },
  'Angus kebab': { allergens: ['gluten'], optionGroups: [without([ONION])] },
  'Lamb kebab': { allergens: ['gluten'], optionGroups: [without([ONION])] },
  'Chicken BBQ': { allergens: ['gluten'], optionGroups: [without([ONION])] },
  'Pork BBQ': { containsPork: true, allergens: ['gluten'], optionGroups: [without([ONION])] },
  'Angus BBQ': { allergens: ['gluten'], optionGroups: [without([ONION])] },
  'Lamb BBQ': { allergens: ['gluten'], optionGroups: [without([ONION])] },
  'Chicken burger': { allergens: ['gluten', 'egg'], optionGroups: [without([ONION, PICKLES, TOMATO])] },
  'Angus burger': { allergens: ['gluten', 'egg'], optionGroups: [without([ONION, PICKLES, TOMATO])] },
  Tan: { vegetarian: true, allergens: ['milk'] },
  Cola: { vegetarian: true },
  Water: { vegetarian: true, optionGroups: [{ name: { hy: 'Տեսակ', ru: 'Вид', en: 'Kind' }, required: true, options: [{ name: { hy: 'Առանց գազի', ru: 'Без газа', en: 'Still' } }, { name: { hy: 'Գազավորված', ru: 'С газом', en: 'Sparkling' } }] }] },
}

export const deliveryZones = [
  { name: { hy: 'Աշտարակ', ru: 'Аштарак', en: 'Ashtarak' }, fee: 500, minOrder: 3000, freeFrom: 10000, etaMin: 25, etaMax: 40 },
  {
    name: { hy: 'Մուղնի, Օշական, Փարպի', ru: 'Мугни, Ошакан, Парпи', en: 'Mughni, Oshakan, Parpi' },
    fee: 900,
    minOrder: 5000,
    freeFrom: 15000,
    etaMin: 45,
    etaMax: 65,
  },
]
