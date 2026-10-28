import type { Payload } from 'payload'

import { businessDayStart } from '../../lib/hours'

const T = {
  hy: { title: 'Այսօր', orders: 'պատվեր', revenue: 'գումար', waiting: 'սպասում են հաստատման', open: 'Բացել նորերը', top: 'Ամենաշատը' },
  ru: { title: 'Сегодня', orders: 'заказов', revenue: 'сумма', waiting: 'ждут подтверждения', open: 'Открыть новые', top: 'Чаще всего' },
  en: { title: 'Today', orders: 'orders', revenue: 'revenue', waiting: 'waiting to be accepted', open: 'Open new orders', top: 'Top dishes' },
}

/** First thing the owner sees in the admin: today's orders, money, what waits, what sells. */
export async function TodayPanel({ payload, i18n }: { payload: Payload; i18n?: { language?: string } }) {
  const t = T[(i18n?.language as keyof typeof T) ?? 'hy'] ?? T.hy
  const start = businessDayStart().toISOString()
  const { docs } = await payload.find({
    collection: 'orders',
    where: { createdAt: { greater_than_equal: start } },
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })
  const live = docs.filter((o) => o.status !== 'cancelled' && o.status !== 'rejected')
  const sum = live.reduce((s, o) => s + (o.total ?? 0), 0)
  const waiting = docs.filter((o) => o.status === 'new').length
  const counts = new Map<string, number>()
  for (const o of live) for (const l of o.lines ?? []) counts.set((l.label ?? '').split(' (')[0], (counts.get((l.label ?? '').split(' (')[0]) ?? 0) + (l.qty ?? 0))
  const top = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 3)
  const amd = (n: number) => `${new Intl.NumberFormat('ru-RU').format(n)} ֏`
  return (
    <div style={{ display: 'grid', gap: 12, marginBottom: 32, padding: 20, border: '1px solid var(--theme-elevation-150)' }}>
      <h2 style={{ margin: 0 }}>{t.title}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, fontSize: 18 }}>
        <span>
          <strong>{live.length}</strong> {t.orders}
        </span>
        <span>
          <strong>{amd(sum)}</strong> {t.revenue}
        </span>
        <span style={{ color: waiting ? 'var(--theme-error-500)' : undefined }}>
          <strong>{waiting}</strong> {t.waiting}
        </span>
      </div>
      {top.length > 0 && (
        <p style={{ margin: 0 }}>
          {t.top}: {top.map(([n, q]) => `${n} × ${q}`).join(', ')}
        </p>
      )}
      {waiting > 0 && (
        <a href="/admin/collections/orders?where[status][equals]=new" className="btn btn--style-primary btn--size-small" style={{ justifySelf: 'start' }}>
          {t.open}
        </a>
      )}
    </div>
  )
}
