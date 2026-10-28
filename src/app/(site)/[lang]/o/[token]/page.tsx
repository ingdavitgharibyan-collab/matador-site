import config from '@payload-config'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { AutoRefresh } from '@/components/AutoRefresh'
import { fill, formatPrice, getDict, hasLocale } from '@/lib/i18n'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { robots: { index: false, follow: false } }

const STEPS = ['new', 'accepted', 'cooking', 'ready', 'delivered'] as const

/** The guest's own order: number, live status, dishes. Reachable only by its random token. */
export default async function OrderPage({ params }: PageProps<'/[lang]/o/[token]'>) {
  const { lang, token } = await params
  if (!hasLocale(lang) || !/^[\w-]{12,40}$/.test(token)) notFound()
  const t = getDict(lang)
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'orders', where: { token: { equals: token } }, limit: 1, depth: 0, overrideAccess: true })
  const o = docs[0]
  if (!o) notFound()
  const step = o.status === 'out' ? 3 : STEPS.indexOf(o.status as (typeof STEPS)[number])
  const final = o.status === 'cancelled' || o.status === 'rejected'

  return (
    <main className="order">
      <AutoRefresh seconds={20} stop={final || o.status === 'delivered'} />
      <div className="order__card">
        <h1 className="display order__title">{fill(t.order.title, { ref: o.ref })}</h1>
        <p className="order__status" role="status" data-final={final}>
          {t.order.status[o.status] ?? o.status}
        </p>
        {!final && (
          <ol className="order__steps" aria-label={t.order.lead}>
            {STEPS.map((s, i) => (
              <li key={s} data-done={i <= step} aria-current={i === step ? 'step' : undefined}>
                {s === 'ready' && o.mode === 'delivery' ? t.order.status.out : t.order.status[s]}
              </li>
            ))}
          </ol>
        )}
        <ul className="order__lines">
          {(o.lines ?? []).map((l, i) => (
            <li key={i}>
              {l.qty} × {l.label}
            </li>
          ))}
        </ul>
        <p className="order__total">
          {t.ticket.total}: {formatPrice(o.total)}
        </p>
        <p className="ticket__fine">{t.order.lead}</p>
        <a className="btn btn--ink" href={`/${lang}`}>
          {t.qr.back}
        </a>
      </div>
    </main>
  )
}
