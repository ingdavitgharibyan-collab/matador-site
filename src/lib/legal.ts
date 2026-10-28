import type { SiteSettings } from './data'
import type { Locale } from './i18n'

/*
 * Plain-language privacy notice and ordering terms, filled from Settings. A starting text written for how this
 * site really works (what it stores, where, for how long) — have it reviewed by a lawyer before launch.
 */
type Doc = { title: string; lead: string; sections: { h: string; p: string[] }[] }

const who = (s: SiteSettings, fallback: string) =>
  [s.legalName || fallback, s.taxId ? `ՀՎՀՀ ${s.taxId}` : '', s.address].filter(Boolean).join(', ')

export function privacy(lang: Locale, s: SiteSettings): Doc {
  const email = s.privacyEmail || s.phone
  const days = s.retentionDays
  if (lang === 'ru')
    return {
      title: 'Политика конфиденциальности',
      lead: 'Коротко: мы берём только то, что нужно, чтобы приготовить и доставить ваш заказ, и через некоторое время удаляем.',
      sections: [
        { h: 'Кто отвечает за данные', p: [`${who(s, 'Матадор')}. Связь: ${email}.`] },
        {
          h: 'Что мы получаем',
          p: [
            'Когда вы отправляете заказ: имя, телефон, адрес доставки (при доставке), комментарий, состав и сумму заказа, способ оплаты.',
            'Для защиты от поддельных заказов мы храним необратимый отпечаток IP-адреса (не сам адрес).',
            'Статистика посещений собирается без cookies и без личных данных: только общие счётчики (сколько открыли меню, сколько заказов).',
          ],
        },
        {
          h: 'Зачем',
          p: [
            'Чтобы принять, приготовить и доставить заказ и связаться с вами по нему. Основание — ваше согласие при отправке и выполнение заказа (Закон РА «О защите персональных данных»).',
          ],
        },
        {
          h: 'Кто ещё видит',
          p: [
            'Наши сотрудники, принимающие заказ. Если вы отправляете заказ через WhatsApp или Telegram, сообщение проходит через эти сервисы по их правилам.',
            'Сайт работает на нашем сервере; данные не продаются и не передаются для рекламы.',
          ],
        },
        {
          h: 'Как долго',
          p: [`Имя, телефон и адрес в заказе автоматически стираются через ${days} дней; остаются только обезличенные цифры (сумма, блюда).`],
        },
        {
          h: 'Ваш браузер',
          p: [
            'Чтобы не вводить заново, браузер помнит ваш билет (корзину), имя, телефон и адрес — только на вашем устройстве (localStorage). Очистить можно в настройках браузера.',
          ],
        },
        { h: 'Ваши права', p: [`Узнать, исправить или удалить ваши данные: напишите или позвоните — ${email}. Ответим в течение 10 рабочих дней.`] },
      ],
    }
  if (lang === 'en')
    return {
      title: 'Privacy notice',
      lead: 'In short: we take only what we need to cook and deliver your order, and we delete it after a while.',
      sections: [
        { h: 'Who is responsible', p: [`${who(s, 'Matador')}. Contact: ${email}.`] },
        {
          h: 'What we receive',
          p: [
            'When you send an order: your name, phone, delivery address (for delivery), note, the dishes and total, and the payment method.',
            'To stop fake orders we keep a one-way fingerprint of your IP address (not the address itself).',
            'Visit statistics are counted without cookies and without personal data: only totals (how many opened the menu, how many ordered).',
          ],
        },
        {
          h: 'Why',
          p: ['To take, cook and deliver your order and to contact you about it. The basis is your consent when sending and the performance of the order (RA Law on Protection of Personal Data).'],
        },
        {
          h: 'Who else sees it',
          p: [
            'Our staff who handle the order. If you send the order by WhatsApp or Telegram, the message passes through those services under their own rules.',
            'The site runs on our own server; data is never sold or used for advertising.',
          ],
        },
        { h: 'How long', p: [`Names, phones and addresses in orders are erased automatically after ${days} days; only anonymous numbers (totals, dishes) remain.`] },
        {
          h: 'Your browser',
          p: ['So you do not have to type it again, your browser remembers your ticket, name, phone and address — only on your device (localStorage). Clear it in the browser settings.'],
        },
        { h: 'Your rights', p: [`To see, correct or delete your data, write or call: ${email}. We answer within 10 working days.`] },
      ],
    }
  return {
    title: 'Գաղտնիության քաղաքականություն',
    lead: 'Կարճ ասած՝ վերցնում ենք միայն այն, ինչ պետք է ձեր պատվերը պատրաստելու և հասցնելու համար, և որոշ ժամանակ անց ջնջում ենք։',
    sections: [
      { h: 'Ով է պատասխանատու', p: [`${who(s, 'Մատադոր')}։ Կապ՝ ${email}։`] },
      {
        h: 'Ինչ ենք ստանում',
        p: [
          'Պատվեր ուղարկելիս՝ անունը, հեռախոսը, առաքման հասցեն (առաքման դեպքում), մեկնաբանությունը, պատվերի կազմը և գումարը, վճարման եղանակը։',
          'Կեղծ պատվերներից պաշտպանվելու համար պահում ենք IP հասցեի անշրջելի դրոշմը (ոչ թե հասցեն)։',
          'Այցելությունների վիճակագրությունը հաշվվում է առանց cookie-ների և առանց անձնական տվյալների՝ միայն ընդհանուր թվեր։',
        ],
      },
      {
        h: 'Ինչու',
        p: ['Պատվերն ընդունելու, պատրաստելու, հասցնելու և դրա վերաբերյալ ձեզ հետ կապվելու համար։ Հիմքը՝ ուղարկելիս ձեր համաձայնությունը և պատվերի կատարումը («Անձնական տվյալների պաշտպանության մասին» ՀՀ օրենք)։'],
      },
      {
        h: 'Ով է էլի տեսնում',
        p: [
          'Պատվերը սպասարկող մեր աշխատակիցները։ Եթե պատվերն ուղարկում եք WhatsApp-ով կամ Telegram-ով, հաղորդագրությունն անցնում է այդ ծառայություններով՝ նրանց կանոններով։',
          'Կայքն աշխատում է մեր սերվերում, տվյալները չեն վաճառվում և չեն օգտագործվում գովազդի համար։',
        ],
      },
      { h: 'Որքան ժամանակ', p: [`Պատվերներում անունը, հեռախոսը և հասցեն ավտոմատ ջնջվում են ${days} օր հետո, մնում են միայն անանուն թվեր (գումար, ուտեստներ)։`] },
      {
        h: 'Ձեր բրաուզերը',
        p: ['Որպեսզի կրկին չլրացնեք, բրաուզերը հիշում է ձեր տոմսը, անունը, հեռախոսը և հասցեն՝ միայն ձեր սարքում (localStorage)։ Կարող եք մաքրել բրաուզերի կարգավորումներում։'],
      },
      { h: 'Ձեր իրավունքները', p: [`Ձեր տվյալները տեսնելու, ուղղելու կամ ջնջելու համար գրեք կամ զանգահարեք՝ ${email}։ Կպատասխանենք 10 աշխատանքային օրվա ընթացքում։`] },
    ],
  }
}

export function terms(lang: Locale, s: SiteSettings, payLabels: Record<string, string>): Doc {
  const zones = s.zones.map((z) => `${z.name} — ${z.fee} ֏, ${z.etaMin}–${z.etaMax}′, min ${z.minOrder} ֏${z.freeFrom ? `, free from ${z.freeFrom} ֏` : ''}`)
  const pay = s.paymentMethods.map((m) => payLabels[m] ?? m).join(', ')
  if (lang === 'ru')
    return {
      title: 'Условия заказа и доставки',
      lead: 'Как работает заказ на сайте.',
      sections: [
        { h: 'Заказ', p: ['Заказ принят, когда мы подтвердили его в WhatsApp, Telegram или по телефону. Номер заказа и статус видны на странице заказа.'] },
        { h: 'Цены', p: ['Цены в драмах, включают налоги. Действует цена на момент отправки заказа.'] },
        { h: 'Доставка', p: ['Районы, стоимость, минимальный заказ и примерное время:', ...zones, 'Время ориентировочное и зависит от загрузки кухни и дорог.'] },
        { h: 'Оплата', p: [`Способы: ${pay}. Чек выдаётся при оплате.`] },
        { h: 'Отмена', p: ['Отменить или изменить заказ можно звонком до начала приготовления.'] },
        { h: 'Аллергены', p: ['Состав и аллергены указаны у каждого блюда. Мы готовим на одной кухне, следы других продуктов возможны — при сильной аллергии позвоните нам.'] },
      ],
    }
  if (lang === 'en')
    return {
      title: 'Ordering and delivery terms',
      lead: 'How ordering on this site works.',
      sections: [
        { h: 'Your order', p: ['An order is accepted once we confirm it by WhatsApp, Telegram or phone. The order number and status are on your order page.'] },
        { h: 'Prices', p: ['Prices are in Armenian dram and include taxes. The price when you send the order applies.'] },
        { h: 'Delivery', p: ['Areas, fee, minimum order and typical time:', ...zones, 'Times are estimates and depend on the kitchen and the traffic.'] },
        { h: 'Payment', p: [`Accepted: ${pay}. A fiscal receipt is issued on payment.`] },
        { h: 'Cancelling', p: ['Call us to cancel or change an order before cooking starts.'] },
        { h: 'Allergens', p: ['Ingredients and allergens are listed with each dish. One kitchen cooks everything, so traces are possible — with a serious allergy, please call us.'] },
      ],
    }
  return {
    title: 'Պատվերի և առաքման պայմաններ',
    lead: 'Ինչպես է աշխատում պատվերը կայքում։',
    sections: [
      { h: 'Պատվեր', p: ['Պատվերն ընդունված է, երբ այն հաստատում ենք WhatsApp-ով, Telegram-ով կամ զանգով։ Պատվերի համարը և կարգավիճակը երևում են պատվերի էջում։'] },
      { h: 'Գներ', p: ['Գները դրամով են, ներառում են հարկերը։ Գործում է պատվերն ուղարկելու պահի գինը։'] },
      { h: 'Առաքում', p: ['Թաղամասեր, արժեք, նվազագույն պատվեր և մոտավոր ժամանակ՝', ...zones, 'Ժամանակը մոտավոր է և կախված է խոհանոցի ծանրաբեռնվածությունից ու ճանապարհներից։'] },
      { h: 'Վճարում', p: [`Եղանակներ՝ ${pay}։ Վճարելիս տրվում է ՀԴՄ կտրոն։`] },
      { h: 'Չեղարկում', p: ['Պատվերը չեղարկել կամ փոխել կարող եք զանգով՝ մինչև պատրաստելը սկսելը։'] },
      { h: 'Ալերգեններ', p: ['Բաղադրությունը և ալերգենները նշված են յուրաքանչյուր ուտեստի մոտ։ Ամեն ինչ պատրաստվում է մեկ խոհանոցում, հնարավոր են այլ մթերքների հետքեր. ուժեղ ալերգիայի դեպքում զանգահարեք մեզ։'] },
    ],
  }
}
