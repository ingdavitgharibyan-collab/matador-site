import type { Payload } from 'payload'

/** Erase guest details from orders older than the retention period (Settings → Legal); totals and dishes stay. */
export async function anonymizeOldOrders(payload: Payload) {
  const s = await payload.findGlobal({ slug: 'settings', depth: 0 })
  const days = s.retentionDays ?? 180
  const before = new Date(Date.now() - days * 86_400_000).toISOString()
  const res = await payload.update({
    collection: 'orders',
    where: { and: [{ createdAt: { less_than: before } }, { phone: { not_equals: '' } }] },
    data: { name: '', phone: '', address: '', flat: '', note: '', ipHash: '' },
    overrideAccess: true,
    depth: 0,
  })
  if (res.docs.length) payload.logger.info(`Retention: erased guest details from ${res.docs.length} orders older than ${days} days`)
}

/** Once at start, then daily. One instance (SQLite deploy), so a timer is enough. */
export function scheduleRetention(payload: Payload) {
  const run = () => anonymizeOldOrders(payload).catch((e) => payload.logger.error({ err: e }, 'retention failed'))
  void run()
  const timer = setInterval(run, 24 * 3600_000)
  timer.unref?.()
}
