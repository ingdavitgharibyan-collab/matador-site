import type { Field, GlobalConfig } from 'payload'

import { isOwnerField, manager } from '../access/roles'
import { L, lockFields } from '../fields/labels'
import { revalidateAfterChange } from '../hooks/revalidate'
import { TIME_RE } from '../lib/hours'

const time = (value: unknown) =>
  typeof value === 'string' && TIME_RE.test(value) ? true : 'HH:MM, 24 ժամ / 24 ч / 24-hour (11:00, 02:00)'

export const PAYMENT_METHODS = ['cash', 'card_courier', 'idram', 'telcell', 'transfer'] as const
const AMD = L('֏', '֏', '֏')
const MIN = L('րոպե', 'мин', 'min')

const fields: Field[] = [
  {
    type: 'tabs',
    tabs: [
      {
        label: L('Կոնտակտներ', 'Контакты', 'Contacts'),
        fields: [
          {
            name: 'phone',
            label: L('Հեռախոս', 'Телефон', 'Phone'),
            type: 'text',
            required: true,
            admin: { description: '+374 …' },
          },
          {
            name: 'whatsapp',
            label: 'WhatsApp',
            type: 'text',
            admin: { description: L('Միայն թվեր, օրինակ՝ 37499123456', 'Только цифры, например 37499123456', 'Digits only, e.g. 37499123456') },
            validate: (v: unknown) => !v || /^\d{8,15}$/.test(String(v)) || 'Digits only, 8–15 (37499123456)',
          },
          {
            name: 'telegram',
            label: 'Telegram',
            type: 'text',
            admin: { description: L('Username առանց @', 'Username без @', 'Username without @') },
            validate: (v: unknown) => !v || /^[A-Za-z0-9_]{5,32}$/.test(String(v)) || 'Telegram username: 5–32 letters, digits, _',
          },
          { name: 'instagram', label: 'Instagram', type: 'text' },
          { name: 'facebook', label: 'Facebook', type: 'text' },
          { name: 'address', label: L('Հասցե', 'Адрес', 'Address'), type: 'text', localized: true, required: true },
          {
            type: 'row',
            fields: [
              {
                name: 'lat',
                label: L('Լայնություն (lat)', 'Широта (lat)', 'Latitude'),
                type: 'number',
                required: true,
                admin: { description: L('Google Maps-ում աջ սեղմեք կետի վրա, պատճենեք առաջին թիվը', 'В Google Maps правый клик по точке, первое число', 'Right-click the spot in Google Maps, first number') },
              },
              { name: 'lng', label: L('Երկայնություն (lng)', 'Долгота (lng)', 'Longitude'), type: 'number', required: true },
            ],
          },
        ],
      },
      {
        label: L('Ժամեր', 'Часы', 'Hours'),
        fields: [
          {
            name: 'hours',
            label: L('Աշխատանքային ժամեր', 'Часы работы', 'Opening hours'),
            type: 'array',
            minRows: 7,
            maxRows: 7,
            admin: {
              isSortable: false,
              components: { RowLabel: '/components/admin/DayRowLabel#DayRowLabel' },
              description: L(
                'Կեսգիշերից հետո փակվելը նորմալ է (11:00 → 02:00)։ Նույն ժամը բացման և փակման համար՝ 24 ժամ։',
                'Закрытие после полуночи — нормально (11:00 → 02:00). Одинаковое время открытия и закрытия — круглосуточно.',
                'Closing after midnight is fine (11:00 → 02:00). Same open and close time = open 24 h.',
              ),
            },
            fields: [
              {
                type: 'row',
                fields: [
                  { name: 'open', label: L('Բացվում է', 'Открытие', 'Opens'), type: 'text', defaultValue: '11:00', validate: time },
                  { name: 'close', label: L('Փակվում է', 'Закрытие', 'Closes'), type: 'text', defaultValue: '02:00', validate: time },
                  { name: 'closed', label: L('Փակ է ամբողջ օրը', 'Выходной', 'Closed all day'), type: 'checkbox', defaultValue: false },
                ],
              },
            ],
          },
          {
            name: 'closures',
            label: L('Տոն օրեր և փակումներ', 'Праздники и закрытия', 'Holidays and closures'),
            type: 'array',
            admin: {
              description: L(
                'Այս օրերին կայքը ցույց է տալիս «փակ ենք» և պատվեր չի ընդունում։',
                'В эти дни сайт показывает «закрыто» и не принимает заказы.',
                'On these days the site shows "closed" and takes no orders.',
              ),
            },
            fields: [
              {
                type: 'row',
                fields: [
                  { name: 'from', label: L('Սկսած', 'С', 'From'), type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
                  { name: 'to', label: L('Մինչև', 'По', 'To'), type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
                ],
              },
              { name: 'note', label: L('Հաղորդագրություն հյուրերին', 'Сообщение гостям', 'Note for guests'), type: 'text', localized: true },
            ],
          },
        ],
      },
      {
        label: L('Պատվերներ', 'Заказы', 'Ordering'),
        fields: [
          {
            type: 'row',
            fields: [
              {
                name: 'ordersPaused',
                label: L('Դադարեցնել պատվերները', 'Приостановить заказы', 'Pause orders'),
                type: 'checkbox',
                defaultValue: false,
                admin: { description: L('Խոհանոցը ծանրաբեռնված է կամ վթար։ Զանգը մնում է։', 'Кухня перегружена или сбой. Звонки остаются.', 'Kitchen overloaded or an outage. Calls stay possible.') },
              },
              {
                name: 'lastOrderMinutes',
                label: L('Վերջին պատվերը փակվելուց … րոպե առաջ', 'Последний заказ за … мин до закрытия', 'Last order … min before closing'),
                type: 'number',
                defaultValue: 30,
                min: 0,
                max: 180,
              },
            ],
          },
          { name: 'pauseNote', label: L('Դադարի պատճառը (ըստ ցանկության)', 'Причина паузы (необязательно)', 'Pause reason (optional)'), type: 'text', localized: true },
          {
            name: 'paymentMethods',
            label: L('Վճարման եղանակներ', 'Способы оплаты', 'Payment methods'),
            type: 'select',
            hasMany: true,
            defaultValue: ['cash', 'card_courier'],
            options: [
              { label: L('Կանխիկ', 'Наличные', 'Cash'), value: 'cash' },
              { label: L('Քարտով առաքիչին', 'Картой курьеру', 'Card to the courier'), value: 'card_courier' },
              { label: 'Idram', value: 'idram' },
              { label: 'Telcell', value: 'telcell' },
              { label: L('Բանկային փոխանցում', 'Банковский перевод', 'Bank transfer'), value: 'transfer' },
            ],
          },
          {
            name: 'deliveryZones',
            label: L('Առաքման զոնաներ', 'Зоны доставки', 'Delivery zones'),
            type: 'array',
            admin: {
              description: L(
                'Հյուրը ընտրում է զոնան, և տեսնում գինը, նվազագույն պատվերը և ժամանակը։',
                'Гость выбирает зону и видит цену, минимальный заказ и время.',
                'The guest picks a zone and sees its fee, minimum order and time.',
              ),
            },
            fields: [
              { name: 'name', label: L('Անուն', 'Название', 'Name'), type: 'text', localized: true, required: true },
              {
                type: 'row',
                fields: [
                  { name: 'fee', label: L('Առաքում, ֏', 'Доставка, ֏', 'Fee, ֏'), type: 'number', defaultValue: 500, min: 0 },
                  { name: 'minOrder', label: L('Նվազագույն պատվեր, ֏', 'Минимальный заказ, ֏', 'Minimum order, ֏'), type: 'number', defaultValue: 0, min: 0 },
                  { name: 'freeFrom', label: L('Անվճար սկսած, ֏', 'Бесплатно от, ֏', 'Free from, ֏'), type: 'number', min: 0 },
                ],
              },
              {
                type: 'row',
                fields: [
                  { name: 'etaMin', label: L('Ժամանակ՝ սկսած', 'Время от', 'Time from'), type: 'number', defaultValue: 30, min: 0, admin: { description: MIN } },
                  { name: 'etaMax', label: L('Ժամանակ՝ մինչև', 'Время до', 'Time to'), type: 'number', defaultValue: 45, min: 0, admin: { description: MIN } },
                ],
              },
            ],
          },
          {
            name: 'deliveryFee',
            label: L('Առաքում (եթե զոնաներ չկան), ֏', 'Доставка (если нет зон), ֏', 'Fee without zones, ֏'),
            type: 'number',
            defaultValue: 0,
            admin: { description: AMD },
          },
          { name: 'freeDeliveryFrom', label: L('Անվճար սկսած (եթե զոնաներ չկան)', 'Бесплатно от (если нет зон)', 'Free from (without zones)'), type: 'number' },
          {
            name: 'partners',
            label: L('Առաքման ծառայություններ', 'Службы доставки', 'Delivery services'),
            type: 'array',
            admin: {
              description: L(
                'Տեղադրեք Մատադորի էջի հղումը տվյալ ծառայությունում, ոչ թե գլխավոր էջը',
                'Ссылка на страницу Матадора в сервисе, а не на главную',
                "Paste Matador's own page on the service, not its home page",
              ),
            },
            fields: [
              { name: 'name', label: L('Անուն', 'Название', 'Name'), type: 'text', required: true },
              {
                name: 'url',
                label: L('Հղում', 'Ссылка', 'Link'),
                type: 'text',
                required: true,
                validate: (v: unknown) => {
                  try {
                    const u = new URL(String(v))
                    return (u.protocol === 'https:' && u.pathname.replace(/\/$/, '').split('/').length > 2) || 'Full https link to the Matador page'
                  } catch {
                    return 'Full https link to the Matador page'
                  }
                },
              },
            ],
          },
        ],
      },
      {
        label: L('Իրավական և քարտեզներ', 'Юридическое и карты', 'Legal & listings'),
        fields: [
          {
            type: 'row',
            fields: [
              { name: 'legalName', label: L('Իրավաբանական անվանում', 'Юридическое название', 'Legal name'), type: 'text' },
              { name: 'taxId', label: L('ՀՎՀՀ', 'ИНН (ՀՎՀՀ)', 'Tax ID (ՀՎՀՀ)'), type: 'text' },
              {
                name: 'privacyEmail',
                label: L('Էլ. փոստ՝ տվյալների հարցերի համար', 'E-mail для вопросов о данных', 'E-mail for data requests'),
                type: 'email',
              },
            ],
          },
          {
            name: 'retentionDays',
            label: L('Պատվերներում անձնական տվյալները պահել (օր)', 'Хранить личные данные в заказах (дней)', 'Keep personal data in orders (days)'),
            type: 'number',
            defaultValue: 180,
            min: 30,
            max: 1095,
            admin: {
              description: L(
                'Դրանից հետո անունը, հեռախոսը և հասցեն ավտոմատ ջնջվում են, մնում են միայն թվերը։',
                'После этого имя, телефон и адрес удаляются автоматически, остаются только цифры.',
                'After this the name, phone and address are erased automatically; only the numbers stay.',
              ),
            },
          },
          { name: 'googleReviewUrl', label: L('Google review-ի հղում', 'Ссылка на отзыв в Google', 'Google review link'), type: 'text' },
          {
            type: 'row',
            fields: [
              { name: 'googleMapsUrl', label: 'Google Maps', type: 'text' },
              { name: 'yandexMapsUrl', label: 'Yandex Maps', type: 'text' },
              { name: 'twoGisUrl', label: '2GIS', type: 'text' },
            ],
          },
        ],
      },
    ],
  },
]

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: L('Կարգավորումներ', 'Настройки', 'Settings'),
  hooks: { afterChange: [revalidateAfterChange] },
  // managers handle the day (hours, holidays, pause); contacts, money and delivery terms stay with the owner
  access: { read: () => true, update: manager },
  versions: { max: 20 },
  fields: lockFields(fields, isOwnerField, ['hours', 'closures', 'ordersPaused', 'pauseNote', 'lastOrderMinutes']),
}
