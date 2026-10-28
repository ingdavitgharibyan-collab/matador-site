/** Yerevan is UTC+4 all year (no DST). */
const OFFSET_MIN = 4 * 60

export type Hours = { open: string; close: string; closed: boolean }[]
export type Closure = { from: string; to: string; note: string }
export type OrderingRules = {
  hours: Hours
  closures: Closure[]
  paused: boolean
  pauseNote: string
  lastOrderMinutes: number
}

export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

const toMin = (t: string) => {
  if (!TIME_RE.test(t)) return null
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/** Monday = 0 … Sunday = 6, in Yerevan time. */
export function yerevanNow(date = new Date()) {
  const local = new Date(date.getTime() + OFFSET_MIN * 60_000)
  const day = (local.getUTCDay() + 6) % 7
  const iso = local.toISOString().slice(0, 10)
  return { day, minutes: local.getUTCHours() * 60 + local.getUTCMinutes(), iso }
}

/** A date-only value from the admin (stored as a timestamp) as the Yerevan calendar day. */
export const yerevanDate = (value: string) => {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '' : yerevanNow(d).iso
}

type Shift = { day: number; open: number; close: number; allDay: boolean }

/** A day's shift in minutes; close may be past midnight (close < open) and open === close means 24 h. */
function shift(hours: Hours, day: number): Shift | null {
  const h = hours[day]
  if (!h || h.closed) return null
  const open = toMin(h.open)
  const close = toMin(h.close)
  if (open === null || close === null) return null
  return { day, open, close, allDay: open === close }
}

export type Status =
  | { open: true; until: string; allDay: boolean; shiftDay: number; minutesLeft: number }
  | { open: false; nextDay: number; at: string; today: boolean; closureNote?: string }

function closureOn(iso: string, closures: Closure[]) {
  return closures.find((c) => c.from && c.to && iso >= c.from && iso <= c.to)
}

export function statusAt(hours: Hours, date = new Date(), closures: Closure[] = []): Status | null {
  if (hours.length !== 7) return null
  const { day, minutes, iso } = yerevanNow(date)
  const closure = closureOn(iso, closures)

  if (!closure) {
    // still inside yesterday's shift that runs past midnight
    const y = shift(hours, (day + 6) % 7)
    const yIso = yerevanNow(new Date(date.getTime() - 86_400_000)).iso
    if (y && !y.allDay && y.close < y.open && minutes < y.close && !closureOn(yIso, closures)) {
      return { open: true, until: hours[y.day].close, allDay: false, shiftDay: y.day, minutesLeft: y.close - minutes }
    }
    const t = shift(hours, day)
    if (t) {
      if (t.allDay) return { open: true, until: hours[day].close, allDay: true, shiftDay: day, minutesLeft: 24 * 60 - minutes + t.close }
      const overnight = t.close < t.open
      if (minutes >= t.open && (overnight || minutes < t.close)) {
        const left = overnight ? 24 * 60 - minutes + t.close : t.close - minutes
        return { open: true, until: hours[day].close, allDay: false, shiftDay: day, minutesLeft: left }
      }
      if (minutes < t.open) return { open: false, nextDay: day, at: hours[day].open, today: true }
    }
  }
  for (let i = 1; i <= 14; i++) {
    const d = (day + i) % 7
    const dIso = yerevanNow(new Date(date.getTime() + i * 86_400_000)).iso
    if (shift(hours, d) && !closureOn(dIso, closures)) {
      return { open: false, nextDay: d, at: hours[d].open, today: false, closureNote: closure?.note }
    }
  }
  return closure ? { open: false, nextDay: day, at: '', today: false, closureNote: closure.note } : null
}

export type OrderGate =
  | { ok: true; status: Status | null }
  | { ok: false; reason: 'closed' | 'last' | 'paused'; status: Status | null }

/** Can a delivery/pickup order be sent right now? */
export function canOrder(rules: OrderingRules, date = new Date()): OrderGate {
  const status = statusAt(rules.hours, date, rules.closures)
  if (rules.paused) return { ok: false, reason: 'paused', status }
  if (!status) return { ok: true, status } // hours not configured: never block
  if (!status.open) return { ok: false, reason: 'closed', status }
  if (!status.allDay && status.minutesLeft <= rules.lastOrderMinutes) return { ok: false, reason: 'last', status }
  return { ok: true, status }
}

/** Orders are numbered per business day: from 06:00 to 06:00 Yerevan time (a night shift stays one day). */
export function businessDayStart(now = new Date()) {
  const local = new Date(now.getTime() + OFFSET_MIN * 60_000)
  if (local.getUTCHours() < 6) local.setUTCDate(local.getUTCDate() - 1)
  local.setUTCHours(6, 0, 0, 0)
  return new Date(local.getTime() - OFFSET_MIN * 60_000)
}
