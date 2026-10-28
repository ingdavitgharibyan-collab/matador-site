/*
 * SAMPLE CONTENT — dish names, prices, weights, address, phone and hours are placeholders so the
 * design can be judged at full density. Confirm or replace each one in /admin before launch.
 */
type L = { hy: string; ru: string; en: string }

export const categories: { slug: string; name: L; tagline: L }[] = [
  {
    slug: 'shawarma',
    name: { hy: 'Շաուրմա', ru: 'Шаурма', en: 'Shawarma' },
    tagline: { hy: 'Լավաշով կամ պիտայով', ru: 'В лаваше или в пите', en: 'In lavash or pita' },
  },
  {
    slug: 'burgers',
    name: { hy: 'Angus բուրգերներ', ru: 'Бургеры Angus', en: 'Angus burgers' },
    tagline: { hy: 'Կոտլետ 100% Angus տավարից', ru: 'Котлета из 100% говядины Angus', en: 'Patties of 100% Angus beef' },
  },
  {
    slug: 'bbq',
    name: { hy: 'Խորոված և BBQ', ru: 'Хоровац и BBQ', en: 'Khorovats & BBQ' },
    tagline: { hy: 'Ածուխի վրա', ru: 'На углях', en: 'Over charcoal' },
  },
  {
    slug: 'sides',
    name: { hy: 'Կարտոֆիլ և աղցաններ', ru: 'Гарниры и салаты', en: 'Sides & salads' },
    tagline: { hy: 'Եվ բոլոր սոուսները', ru: 'И все соусы', en: 'And every sauce' },
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

export const dishes: Dish[] = [
  {
    category: 'shawarma',
    name: { hy: 'Հավով շաուրմա', ru: 'Шаурма с курицей', en: 'Chicken shawarma' },
    description: {
      hy: 'Հավի ազդր շամփուրից, թարմ բանջարեղեն և սխտորով սոուս՝ բարակ լավաշի մեջ։',
      ru: 'Куриное бедро с вертела, свежие овощи и чесночный соус в тонком лаваше.',
      en: 'Chicken thigh off the spit, fresh vegetables and garlic sauce in thin lavash.',
    },
    ingredients: {
      hy: 'հավի ազդր, լոլիկ, վարունգ, կաղամբ, թթու վարունգ, սխտորով սոուս, լավաշ',
      ru: 'куриное бедро, помидор, огурец, капуста, маринованный огурец, чесночный соус, лаваш',
      en: 'chicken thigh, tomato, cucumber, cabbage, pickles, garlic sauce, lavash',
    },
    price: 1500,
    weight: '350 g',
    art: 'shawarma',
  },
  {
    category: 'shawarma',
    name: { hy: 'Տավարով շաուրմա', ru: 'Шаурма с говядиной', en: 'Beef shawarma' },
    description: {
      hy: 'Տավարի միս շամփուրից, կարմիր սոխ, մաղադանոս և թահինի։',
      ru: 'Говядина с вертела, красный лук, петрушка и тахини.',
      en: 'Beef off the spit, red onion, parsley and tahini.',
    },
    ingredients: {
      hy: 'տավարի միս, կարմիր սոխ, մաղադանոս, լոլիկ, թահինի, լավաշ',
      ru: 'говядина, красный лук, петрушка, помидор, тахини, лаваш',
      en: 'beef, red onion, parsley, tomato, tahini, lavash',
    },
    price: 1900,
    weight: '380 g',
    art: 'shawarma',
  },
  {
    category: 'shawarma',
    name: { hy: 'Մատադոր XL', ru: 'Матадор XL', en: 'Matador XL' },
    description: {
      hy: 'Կրկնակի միս՝ հավ և տավար, չեդեր, հալապենյո և մեր կծու կարմիր սոուսը։',
      ru: 'Двойное мясо — курица и говядина, чеддер, халапеньо и наш острый красный соус.',
      en: 'Double meat, chicken and beef, cheddar, jalapeño and our hot red sauce.',
    },
    ingredients: {
      hy: 'հավ, տավար, չեդեր, հալապենյո, լոլիկ, կաղամբ, կարմիր սոուս, լավաշ',
      ru: 'курица, говядина, чеддер, халапеньо, помидор, капуста, красный соус, лаваш',
      en: 'chicken, beef, cheddar, jalapeño, tomato, cabbage, red sauce, lavash',
    },
    price: 2600,
    weight: '550 g',
    art: 'shawarma',
    spicy: true,
    signature: true,
  },
  {
    category: 'shawarma',
    name: { hy: 'Շաուրմա ափսեով', ru: 'Шаурма на тарелке', en: 'Shawarma plate' },
    description: {
      hy: 'Միսը՝ առանձին, ֆրի կարտոֆիլով, աղցանով, պիտայով և երեք սոուսով։',
      ru: 'Мясо отдельно, с картофелем фри, салатом, питой и тремя соусами.',
      en: 'The meat served open, with fries, salad, pita and three sauces.',
    },
    ingredients: {
      hy: 'հավ կամ տավար, ֆրի, աղցան, պիտա, սխտորով սոուս, թահինի, կարմիր սոուս',
      ru: 'курица или говядина, фри, салат, пита, чесночный соус, тахини, красный соус',
      en: 'chicken or beef, fries, salad, pita, garlic sauce, tahini, red sauce',
    },
    price: 2900,
    weight: '500 g',
    art: 'plate',
  },
  {
    category: 'burgers',
    name: { hy: 'Դասական Angus', ru: 'Классический Angus', en: 'Classic Angus' },
    description: {
      hy: '180 գ Angus կոտլետ, չեդեր, թթու վարունգ, սոխ և տան սոուսը բրիոշ բուլկիով։',
      ru: '180 г котлеты Angus, чеддер, огурчики, лук и фирменный соус на булочке бриошь.',
      en: '180 g Angus patty, cheddar, pickles, onion and house sauce on a brioche bun.',
    },
    ingredients: {
      hy: 'Angus տավար, չեդեր, թթու վարունգ, սոխ, սալաթ, տան սոուս, բրիոշ',
      ru: 'говядина Angus, чеддер, огурчики, лук, салат, фирменный соус, бриошь',
      en: 'Angus beef, cheddar, pickles, onion, lettuce, house sauce, brioche',
    },
    price: 3200,
    weight: '320 g',
    art: 'burger',
  },
  {
    category: 'burgers',
    name: { hy: 'Կրկնակի չիզ', ru: 'Двойной чиз', en: 'Double cheese' },
    description: {
      hy: 'Երկու բարակ Angus կոտլետ, երկու շերտ չեդեր, մանանեխ և կետչուպ։',
      ru: 'Две тонкие котлеты Angus, два слоя чеддера, горчица и кетчуп.',
      en: 'Two thin Angus patties, two slices of cheddar, mustard and ketchup.',
    },
    ingredients: {
      hy: 'Angus տավար, չեդեր, մանանեխ, կետչուպ, սոխ, բրիոշ',
      ru: 'говядина Angus, чеддер, горчица, кетчуп, лук, бриошь',
      en: 'Angus beef, cheddar, mustard, ketchup, onion, brioche',
    },
    price: 3600,
    weight: '360 g',
    art: 'burger',
  },
  {
    category: 'burgers',
    name: { hy: 'Տորո', ru: 'Торо', en: 'Toro' },
    description: {
      hy: 'Կծու բուրգեր՝ հալապենյո, պեպպեր ջեք պանիր և չիպոտլե մայոնեզ։',
      ru: 'Острый бургер: халапеньо, сыр пеппер джек и майонез чипотле.',
      en: 'The hot one: jalapeño, pepper jack and chipotle mayo.',
    },
    ingredients: {
      hy: 'Angus տավար, պեպպեր ջեք, հալապենյո, չիպոտլե մայոնեզ, կարմիր սոխ, բրիոշ',
      ru: 'говядина Angus, пеппер джек, халапеньо, майонез чипотле, красный лук, бриошь',
      en: 'Angus beef, pepper jack, jalapeño, chipotle mayo, red onion, brioche',
    },
    price: 3700,
    weight: '340 g',
    art: 'burger',
    spicy: true,
  },
  {
    category: 'burgers',
    name: { hy: 'Մատադոր Դաբլ', ru: 'Матадор Дабл', en: 'Matador Double' },
    description: {
      hy: 'Երկու Angus կոտլետ, բեկոն, կարամելացված սոխ, չեդեր և BBQ սոուս։',
      ru: 'Две котлеты Angus, бекон, карамелизированный лук, чеддер и соус BBQ.',
      en: 'Two Angus patties, bacon, caramelised onion, cheddar and BBQ sauce.',
    },
    ingredients: {
      hy: 'Angus տավար ×2, բեկոն, չեդեր, կարամելացված սոխ, BBQ սոուս, բրիոշ',
      ru: 'говядина Angus ×2, бекон, чеддер, карамелизированный лук, соус BBQ, бриошь',
      en: 'Angus beef ×2, bacon, cheddar, caramelised onion, BBQ sauce, brioche',
    },
    price: 4900,
    weight: '520 g',
    art: 'burger',
    signature: true,
  },
  {
    category: 'bbq',
    name: { hy: 'Խոզի խորոված', ru: 'Хоровац из свинины', en: 'Pork khorovats' },
    description: {
      hy: 'Խոզի վիզ ածուխի վրա, սոխով և սումախով, լավաշի վրա։',
      ru: 'Свиная шея на углях, с луком и сумахом, на лаваше.',
      en: 'Pork neck over charcoal with onion and sumac, served on lavash.',
    },
    ingredients: {
      hy: 'խոզի վիզ, սոխ, սումախ, կանաչի, լավաշ',
      ru: 'свиная шея, лук, сумах, зелень, лаваш',
      en: 'pork neck, onion, sumac, herbs, lavash',
    },
    price: 4200,
    weight: '300 g',
    art: 'skewer',
  },
  {
    category: 'bbq',
    name: { hy: 'Գառան չալաղաջ', ru: 'Чалагач из баранины', en: 'Lamb chops' },
    description: {
      hy: 'Գառան կողիկներ ածուխի վրա, թարմ ուրցով։',
      ru: 'Бараньи рёбрышки на углях со свежим чабрецом.',
      en: 'Lamb ribs over charcoal with fresh thyme.',
    },
    ingredients: {
      hy: 'գառան կողիկ, ուրց, սոխ, լավաշ',
      ru: 'бараньи рёбрышки, чабрец, лук, лаваш',
      en: 'lamb ribs, thyme, onion, lavash',
    },
    price: 5500,
    weight: '350 g',
    art: 'ribs',
  },
  {
    category: 'bbq',
    name: { hy: 'Հավի խորոված', ru: 'Хоровац из курицы', en: 'Chicken khorovats' },
    description: {
      hy: 'Հավի ազդր մածունով մարինադում, ածուխի վրա։',
      ru: 'Куриное бедро в маринаде на мацуне, на углях.',
      en: 'Chicken thigh marinated in matsun, over charcoal.',
    },
    ingredients: {
      hy: 'հավի ազդր, մածուն, սխտոր, պղպեղ, լավաշ',
      ru: 'куриное бедро, мацун, чеснок, перец, лаваш',
      en: 'chicken thigh, matsun, garlic, pepper, lavash',
    },
    price: 3200,
    weight: '300 g',
    art: 'skewer',
  },
  {
    category: 'bbq',
    name: { hy: 'Լյուլա քաբաբ', ru: 'Люля-кебаб', en: 'Lula kebab' },
    description: {
      hy: 'Տավարի և գառան աղացած միս, սոխ և համեմունքներ, շամփուրի վրա։',
      ru: 'Фарш из говядины и баранины с луком и специями, на шампуре.',
      en: 'Minced beef and lamb with onion and spices, on the skewer.',
    },
    ingredients: {
      hy: 'տավար, գառ, սոխ, համեմունքներ, լավաշ',
      ru: 'говядина, баранина, лук, специи, лаваш',
      en: 'beef, lamb, onion, spices, lavash',
    },
    price: 2600,
    weight: '250 g',
    art: 'skewer',
  },
  {
    category: 'bbq',
    name: { hy: 'BBQ կողիկներ', ru: 'Рёбра BBQ', en: 'BBQ ribs' },
    description: {
      hy: 'Խոզի կողիկներ՝ դանդաղ պատրաստված և BBQ գլեյզով ածուխի վրա։',
      ru: 'Свиные рёбра, томлёные и покрытые глазурью BBQ на углях.',
      en: 'Pork ribs, slow-cooked and glazed with BBQ sauce over charcoal.',
    },
    ingredients: {
      hy: 'խոզի կողիկ, BBQ սոուս, մեղր, պապրիկա, ֆրի',
      ru: 'свиные рёбра, соус BBQ, мёд, паприка, фри',
      en: 'pork ribs, BBQ sauce, honey, paprika, fries',
    },
    price: 5900,
    weight: '600 g',
    art: 'ribs',
    signature: true,
  },
  {
    category: 'sides',
    name: { hy: 'Ֆրի կարտոֆիլ', ru: 'Картофель фри', en: 'French fries' },
    description: { hy: 'Աղով և պապրիկայով։', ru: 'С солью и паприкой.', en: 'With salt and paprika.' },
    ingredients: { hy: 'կարտոֆիլ, աղ, պապրիկա', ru: 'картофель, соль, паприка', en: 'potato, salt, paprika' },
    price: 900,
    weight: '150 g',
    art: 'fries',
  },
  {
    category: 'sides',
    name: { hy: 'Գյուղական կարտոֆիլ', ru: 'Картофель по-деревенски', en: 'Country potatoes' },
    description: {
      hy: 'Կեղևով կարտոֆիլ, սխտոր և սամիթ։',
      ru: 'Картофель в кожуре, чеснок и укроп.',
      en: 'Skin-on potato wedges, garlic and dill.',
    },
    ingredients: { hy: 'կարտոֆիլ, սխտոր, սամիթ', ru: 'картофель, чеснок, укроп', en: 'potato, garlic, dill' },
    price: 1100,
    weight: '200 g',
    art: 'fries',
  },
  {
    category: 'sides',
    name: { hy: 'Ամառային աղցան', ru: 'Летний салат', en: 'Summer salad' },
    description: {
      hy: 'Լոլիկ, վարունգ, կարմիր սոխ և կանաչի՝ ձիթապտղի յուղով։',
      ru: 'Помидор, огурец, красный лук и зелень с оливковым маслом.',
      en: 'Tomato, cucumber, red onion and herbs with olive oil.',
    },
    ingredients: {
      hy: 'լոլիկ, վարունգ, կարմիր սոխ, կանաչի, ձիթապտղի յուղ',
      ru: 'помидор, огурец, красный лук, зелень, оливковое масло',
      en: 'tomato, cucumber, red onion, herbs, olive oil',
    },
    price: 1400,
    weight: '250 g',
    art: 'salad',
  },
  {
    category: 'sides',
    name: { hy: 'Սոուս', ru: 'Соус', en: 'Sauce' },
    description: {
      hy: 'Սխտորով, BBQ, չիպոտլե կամ պանրով, ընտրեք պատվերի մեկնաբանության մեջ։',
      ru: 'Чесночный, BBQ, чипотле или сырный — укажите в комментарии к заказу.',
      en: 'Garlic, BBQ, chipotle or cheese — name it in the order note.',
    },
    ingredients: { hy: 'սխտոր, BBQ, չիպոտլե, պանիր', ru: 'чеснок, BBQ, чипотле, сыр', en: 'garlic, BBQ, chipotle, cheese' },
    price: 300,
    weight: '50 g',
    art: 'sauce',
  },
  {
    category: 'drinks',
    name: { hy: 'Թան', ru: 'Тан', en: 'Tan' },
    description: { hy: 'Սառը, թեթև աղի։', ru: 'Холодный, слегка солёный.', en: 'Cold and lightly salted yogurt drink.' },
    ingredients: { hy: 'մածուն, ջուր, աղ', ru: 'мацун, вода, соль', en: 'matsun, water, salt' },
    price: 600,
    weight: '0.5 L',
    art: 'drink',
  },
  {
    category: 'drinks',
    name: { hy: 'Տնական լիմոնադ', ru: 'Домашний лимонад', en: 'House lemonade' },
    description: {
      hy: 'Կիտրոն, թարխուն կամ նուռ։',
      ru: 'Лимон, тархун или гранат.',
      en: 'Lemon, tarragon or pomegranate.',
    },
    ingredients: { hy: 'կիտրոն, թարխուն, նուռ, շաքար', ru: 'лимон, тархун, гранат, сахар', en: 'lemon, tarragon, pomegranate, sugar' },
    price: 1200,
    weight: '0.5 L',
    art: 'drink',
  },
  {
    category: 'drinks',
    name: { hy: 'Կոլա', ru: 'Кола', en: 'Cola' },
    description: { hy: 'Ապակե շշով։', ru: 'В стеклянной бутылке.', en: 'In a glass bottle.' },
    ingredients: { hy: 'կոլա', ru: 'кола', en: 'cola' },
    price: 700,
    weight: '0.33 L',
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
    hy: 'Երևան, Աբովյան փ. 1 (նմուշ)',
    ru: 'Ереван, ул. Абовяна 1 (образец)',
    en: 'Yerevan, 1 Abovyan St (sample)',
  },
  lat: 40.1792,
  lng: 44.5133,
  hours: Array.from({ length: 7 }, (_, i) => ({ open: '11:00', close: i >= 4 ? '03:00' : '02:00', closed: false })),
  deliveryFee: 500,
  freeDeliveryFrom: 10000,
  partners: [
    { name: 'Yandex Eats', url: 'https://eda.yandex.am/' },
    { name: 'Wolt', url: 'https://wolt.com/hy/arm/yerevan' },
    { name: 'Glovo', url: 'https://glovoapp.com/am/en/yerevan/' },
    { name: 'Menu.am', url: 'https://www.menu.am/' },
  ],
}
