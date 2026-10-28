import type { Payload } from 'payload'

import { businessDayStart } from './hours'

/*
 * Kitchen bot. Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (the kitchen group), TELEGRAM_WEBHOOK_SECRET,
 * KITCHEN_LOCALE (hy | ru | en, default hy). Without a token everything here is a no-op: orders are still saved.
 * Plain text only (no parse_mode), so guest-typed text can never break the message.
 */

type Lang = 'hy' | 'ru' | 'en'
type OrderDoc = {
  id: number | string
  ref: string
  status: string
  mode: string
  table?: string | null
  zone?: string | null
  name?: string | null
  phone?: string | null
  address?: string | null
  flat?: string | null
  note?: string | null
  payment?: string | null
  lines?: { qty?: number | null; label?: string | null; unit?: number | null }[] | null
  subtotal?: number | null
  fee?: number | null
  discount?: number | null
  promo?: string | null
  total: number
  createdAt?: string
  kitchenMessageId?: string | null
}

const K: Record<Lang, Record<string, string>> = {
  hy: {
    delivery: 'ԱՌԱՔՈՒՄ', pickup: 'ԿՎԵՐՑՆԻ ԻՆՔԸ', table: 'ՍԵՂԱՆ', dishes: 'Ուտեստներ', fee: 'Առաքում', total: 'ԸՆԴԱՄԵՆԸ',
    pay: 'Վճարում', note: 'Մեկնաբանություն', status: 'Կարգավիճակ',
    new: 'Նոր', accepted: 'Ընդունված', cooking: 'Պատրաստվում է', ready: 'Պատրաստ է', out: 'Ճանապարհին', delivered: 'Հանձնված', cancelled: 'Չեղարկված', rejected: 'Մերժված',
    a_accept: '✓ Ընդունել', a_reject: '✕ Մերժել', a_ready: 'Պատրաստ է', a_out: 'Ճանապարհին', a_done: 'Հանձնված',
    paused: 'Պատվերները դադարեցված են։ /resume՝ վերսկսելու համար։', resumed: 'Պատվերները նորից ընդունվում են։',
    stopPick: 'Ո՞ր ուտեստն է վերջացել։', backPick: 'Ո՞ր ուտեստն է նորից կա։', none: 'Չկա։', stopped: 'Հանված է մենյուից', back: 'Վերադարձված է մենյու',
    today: 'Այսօր', orders: 'պատվեր', help: '/pause [պատճառ] · /resume · /stop · /back · /today',
    cash: 'Կանխիկ', card_courier: 'Քարտով առաքիչին', idram: 'Idram', telcell: 'Telcell', transfer: 'Փոխանցում',
  },
  ru: {
    delivery: 'ДОСТАВКА', pickup: 'САМОВЫВОЗ', table: 'СТОЛ', dishes: 'Блюда', fee: 'Доставка', total: 'ИТОГО',
    pay: 'Оплата', note: 'Комментарий', status: 'Статус',
    new: 'Новый', accepted: 'Принят', cooking: 'Готовится', ready: 'Готов', out: 'В пути', delivered: 'Выдан', cancelled: 'Отменён', rejected: 'Отклонён',
    a_accept: '✓ Принять', a_reject: '✕ Отклонить', a_ready: 'Готов', a_out: 'В пути', a_done: 'Выдан',
    paused: 'Заказы приостановлены. /resume — возобновить.', resumed: 'Заказы снова принимаются.',
    stopPick: 'Что закончилось?', backPick: 'Что снова есть?', none: 'Нет.', stopped: 'Убрано из меню', back: 'Возвращено в меню',
    today: 'Сегодня', orders: 'заказов', help: '/pause [причина] · /resume · /stop · /back · /today',
    cash: 'Наличные', card_courier: 'Картой курьеру', idram: 'Idram', telcell: 'Telcell', transfer: 'Перевод',
  },
  en: {
    delivery: 'DELIVERY', pickup: 'PICKUP', table: 'TABLE', dishes: 'Dishes', fee: 'Delivery', total: 'TOTAL',
    pay: 'Payment', note: 'Note', status: 'Status',
    new: 'New', accepted: 'Accepted', cooking: 'Cooking', ready: 'Ready', out: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled', rejected: 'Rejected',
    a_accept: '✓ Accept', a_reject: '✕ Reject', a_ready: 'Ready', a_out: 'Out', a_done: 'Delivered',
    paused: 'Orders paused. /resume to take orders again.', resumed: 'Taking orders again.',
    stopPick: 'What ran out?', backPick: 'What is back?', none: 'None.', stopped: 'Removed from the menu', back: 'Back on the menu',
    today: 'Today', orders: 'orders', help: '/pause [reason] · /resume · /stop · /back · /today',
    cash: 'Cash', card_courier: 'Card to the courier', idram: 'Idram', telcell: 'Telcell', transfer: 'Transfer',
  },
}

const cfg = () => ({
  token: process.env.TELEGRAM_BOT_TOKEN ?? '',
  chat: process.env.TELEGRAM_CHAT_ID ?? '',
  api: (process.env.TELEGRAM_API ?? 'https://api.telegram.org').replace(/\/$/, ''),
  lang: (['hy', 'ru', 'en'].includes(process.env.KITCHEN_LOCALE ?? '') ? process.env.KITCHEN_LOCALE : 'hy') as Lang,
})
export const telegramEnabled = () => Boolean(cfg().token && cfg().chat)

async function call(method: string, body: unknown) {
  const { token, api } = cfg()
  const res = await fetch(`${api}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  })
  return (await res.json()) as { ok: boolean; result?: { message_id?: number } }
}

const amd = (n?: number | null) => `${new Intl.NumberFormat('ru-RU').format(n ?? 0).replace(/\s/g, ' ')} ֏`

/** What the kitchen reads: number and mode first, the dishes with their choices, the money, then the guest. */
export function kitchenText(o: OrderDoc, lang: Lang = cfg().lang) {
  const k = K[lang]
  const time = o.createdAt ? new Date(new Date(o.createdAt).getTime() + 4 * 3600_000).toISOString().slice(11, 16) : ''
  const head = `${o.ref} · ${o.mode === 'table' ? `${k.table} ${o.table ?? ''}` : k[o.mode] ?? o.mode}${time ? ` · ${time}` : ''}`
  const who = [o.name, o.phone].filter(Boolean).join(' · ')
  const where = o.mode === 'delivery' ? [o.zone, o.address, o.flat].filter(Boolean).join(', ') : ''
  const lines = (o.lines ?? []).map((l) => `${l.qty}× ${l.label}`)
  const money = [
    `${k.dishes} ${amd(o.subtotal)}${o.discount ? ` · −${amd(o.discount)}${o.promo ? ` (${o.promo})` : ''}` : ''}${o.fee ? ` · ${k.fee} ${amd(o.fee)}` : ''}`,
    `${k.total} ${amd(o.total)}`,
    o.payment ? `${k.pay}: ${k[o.payment] ?? o.payment}` : '',
  ].filter(Boolean)
  return [
    head,
    who,
    where,
    '──────────',
    ...lines,
    '──────────',
    ...money,
    o.note ? `${k.note}: ${o.note}` : '',
    `${k.status}: ${k[o.status] ?? o.status}`,
  ]
    .filter((x) => x !== '')
    .join('\n')
}

export function kitchenKeyboard(o: Pick<OrderDoc, 'id' | 'status' | 'mode'>, lang: Lang = cfg().lang) {
  const k = K[lang]
  const b = (text: string, status: string) => ({ text, callback_data: `s:${o.id}:${status}` })
  if (o.status === 'new') return [[b(k.a_accept, 'accepted'), b(k.a_reject, 'rejected')]]
  if (o.status === 'accepted' || o.status === 'cooking')
    return [[b(k.a_ready, 'ready'), ...(o.mode === 'delivery' ? [b(k.a_out, 'out')] : [])]]
  if (o.status === 'ready' || o.status === 'out') return [[b(k.a_done, 'delivered')]]
  return []
}

/** New order → kitchen group. Returns the message id to edit later, or null. */
export async function notifyNew(o: OrderDoc) {
  if (!telegramEnabled()) return null
  const r = await call('sendMessage', { chat_id: cfg().chat, text: kitchenText(o), reply_markup: { inline_keyboard: kitchenKeyboard(o) } })
  return r.ok && r.result?.message_id ? String(r.result.message_id) : null
}

/** Status changed (in the admin or from the bot) → the same kitchen message shows it. */
export async function notifyStatus(o: OrderDoc) {
  if (!telegramEnabled() || !o.kitchenMessageId) return
  await call('editMessageText', {
    chat_id: cfg().chat,
    message_id: Number(o.kitchenMessageId),
    text: kitchenText(o),
    reply_markup: { inline_keyboard: kitchenKeyboard(o) },
  })
}

type Update = {
  callback_query?: { id: string; data?: string; message?: { chat?: { id?: number | string } } }
  message?: { text?: string; chat?: { id?: number | string } }
}

/** Webhook updates from the kitchen group: status buttons, stop-list and pause commands. Other chats are ignored. */
export async function handleUpdate(u: Update, payload: Payload) {
  const { chat, lang } = cfg()
  const k = K[lang]
  const cq = u.callback_query
  if (cq) {
    if (String(cq.message?.chat?.id) !== String(chat)) return
    const [kind, id, value] = (cq.data ?? '').split(':')
    let answer = ''
    if (kind === 's' && id && value) {
      // the collection hook logs the change and edits the kitchen message
      await payload.update({ collection: 'orders', id, data: { status: value as never }, overrideAccess: true })
      answer = k[value] ?? value
    }
    if (kind === 'a' && id) {
      const available = value === '1'
      const d = await payload.update({ collection: 'dishes', id, data: { available }, overrideAccess: true, locale: lang })
      answer = `${available ? k.back : k.stopped}: ${d.name}`
    }
    await call('answerCallbackQuery', { callback_query_id: cq.id, text: answer })
    return
  }
  const m = u.message
  if (!m?.text || String(m.chat?.id) !== String(chat)) return
  const [cmd, ...rest] = m.text.trim().split(/\s+/)
  const say = (text: string, extra: object = {}) => call('sendMessage', { chat_id: chat, text, ...extra })
  const command = cmd.replace(/@.*$/, '').toLowerCase()
  if (command === '/pause') {
    await payload.updateGlobal({ slug: 'settings', data: { ordersPaused: true, pauseNote: rest.join(' ') }, overrideAccess: true, locale: lang })
    await say(k.paused)
  } else if (command === '/resume') {
    await payload.updateGlobal({ slug: 'settings', data: { ordersPaused: false, pauseNote: '' }, overrideAccess: true, locale: lang })
    await say(k.resumed)
  } else if (command === '/stop' || command === '/back') {
    const stop = command === '/stop'
    const dishes = await payload.find({ collection: 'dishes', where: { available: { equals: !stop } }, limit: 100, locale: lang, depth: 0 })
    const rows = dishes.docs.map((d) => [{ text: d.name, callback_data: `a:${d.id}:${stop ? 0 : 1}` }])
    await say(rows.length ? (stop ? k.stopPick : k.backPick) : k.none, rows.length ? { reply_markup: { inline_keyboard: rows } } : {})
  } else if (command === '/today') {
    const start = businessDayStart()
    const orders = await payload.find({
      collection: 'orders',
      where: { and: [{ createdAt: { greater_than_equal: start.toISOString() } }, { status: { not_in: ['cancelled', 'rejected'] } }] },
      limit: 1000,
      depth: 0,
    })
    const sum = orders.docs.reduce((s, o) => s + (o.total ?? 0), 0)
    await say(`${k.today}: ${orders.totalDocs} ${k.orders}, ${amd(sum)}`)
  } else if (command === '/start' || command === '/help') {
    await say(k.help)
  }
}
