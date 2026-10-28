import type { Hours } from './data'

/** Yerevan is UTC+4 all year (no DST). */
const OFFSET_MIN = 4 * 60

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/** Monday = 0 … Sunday = 6, in Yerevan time. */
export function yerevanNow(date = new Date()) {
  const local = new Date(date.getTime() + OFFSET_MIN * 60_000)
  const day = (local.getUTCDay() + 6) % 7
  return { day, minutes: local.getUTCHours() * 60 + local.getUTCMinutes() }
}

export type Status =
  | { open: true; until: string }
  | { open: false; nextDay: number; at: string; today: boolean }

export function statusAt(hours: Hours, date = new Date()): Status | null {
  if (hours.length !== 7) return null
  const { day, minutes } = yerevanNow(date)
  // still inside yesterday's shift that runs past midnight
  const y = hours[(day + 6) % 7]
  if (!y.closed && toMin(y.close) < toMin(y.open) && minutes < toMin(y.close)) return { open: true, until: y.close }
  const t = hours[day]
  if (!t.closed) {
    const o = toMin(t.open)
    const c = toMin(t.close)
    const overnight = c <= o
    if (minutes >= o && (overnight || minutes < c)) return { open: true, until: t.close }
    if (minutes < o) return { open: false, nextDay: day, at: t.open, today: true }
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7
    if (!hours[d].closed) return { open: false, nextDay: d, at: hours[d].open, today: false }
  }
  return null
}
