'use client'

import { useEffect, useState } from 'react'

import { type Closure, type Hours, statusAt } from '@/lib/hours'
import { type Dict, fill } from '@/lib/i18n'

/** Re-reads the clock every minute, in Yerevan time. Renders nothing on the server (the time is unknown there). */
function useNow() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the clock only exists on the client
    setNow(new Date())
    const i = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(i)
  }, [])
  return now
}

type Props = { hours: Hours; closures: Closure[]; paused?: boolean; t: Dict }

export function statusText(s: ReturnType<typeof statusAt>, t: Dict) {
  if (!s) return ''
  if (s.open) return fill(t.status.openUntil, { t: s.until })
  if (!s.at) return fill(t.status.closedNote, { n: s.closureNote ? `. ${s.closureNote}` : '' })
  const base = s.today ? fill(t.status.opensAt, { t: s.at }) : fill(t.status.opensDay, { d: t.days[s.nextDay].toLowerCase(), t: s.at })
  return s.closureNote ? `${s.closureNote}. ${base}` : base
}

export function OpenStatus({ hours, closures, paused, t, children }: Props & { children?: React.ReactNode }) {
  const now = useNow()
  const s = now ? statusAt(hours, now, closures) : null
  if (!s) return <p className="status">&nbsp;{children}</p>
  return (
    <p className="status" data-open={s.open && !paused}>
      <span className="status__ember" aria-hidden="true" />
      <span>
        {paused && s.open ? t.status.paused : statusText(s, t)}
        {children}
      </span>
    </p>
  )
}

/** Weekly hours; "today" is the day of the shift in progress (01:30 on Saturday still belongs to Friday). */
export function HoursTable({ hours, closures, t }: Omit<Props, 'paused'>) {
  const now = useNow()
  const s = now ? statusAt(hours, now, closures) : null
  const today = s && s.open ? s.shiftDay : now ? (new Date(now.getTime() + 4 * 3600_000).getUTCDay() + 6) % 7 : -1
  return (
    <div className="hours">
      {hours.map((h, i) => (
        <div key={i} data-today={i === today}>
          <span>
            {t.days[i]}
            {i === today && <span className="sr-only"> ({t.visit.today})</span>}
          </span>
          <span>{h.closed ? t.visit.closed : h.open === h.close ? '24/7' : `${h.open}–${h.close}`}</span>
        </div>
      ))}
    </div>
  )
}
