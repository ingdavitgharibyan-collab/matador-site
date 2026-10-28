import type { Payload } from 'payload'

import { businessDayStart, yerevanNow } from './hours'

export const EVENTS = ['view', 'menu', 'add', 'ticket', 'send_wa', 'send_tg', 'call', 'table', 'partner', 'filter', 'search'] as const
export type MetricEvent = (typeof EVENTS)[number]

const pending = new Map<string, Record<string, number>>()
let timer: ReturnType<typeof setInterval> | null = null

export const businessDay = (d = new Date()) => yerevanNow(businessDayStart(d)).iso

/** Count in memory; written to the database once a minute (one SQLite instance, so no race). */
export function count(payload: Payload, event: MetricEvent, lang: string) {
  const day = businessDay()
  const c = pending.get(day) ?? {}
  c[event] = (c[event] ?? 0) + 1
  c[`${event}:${lang}`] = (c[`${event}:${lang}`] ?? 0) + 1
  pending.set(day, c)
  if (!timer) {
    timer = setInterval(() => void flush(payload), 60_000)
    timer.unref?.()
  }
}

export async function flush(payload: Payload) {
  for (const [day, add] of [...pending]) {
    pending.delete(day)
    const { docs } = await payload.find({ collection: 'metrics', where: { day: { equals: day } }, limit: 1, depth: 0, overrideAccess: true })
    const counts = { ...((docs[0]?.counts as Record<string, number>) ?? {}) }
    for (const [k, v] of Object.entries(add)) counts[k] = (counts[k] ?? 0) + v
    if (docs[0]) await payload.update({ collection: 'metrics', id: docs[0].id, data: { counts }, overrideAccess: true })
    else await payload.create({ collection: 'metrics', data: { day, counts }, overrideAccess: true })
  }
}
