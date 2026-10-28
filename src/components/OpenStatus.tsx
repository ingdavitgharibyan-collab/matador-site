'use client'

import { useEffect, useState } from 'react'

import type { Hours } from '@/lib/data'
import { statusAt } from '@/lib/hours'
import { type Dict, fill } from '@/lib/i18n'

/** Live: re-reads the clock every minute, in Yerevan time. */
export function OpenStatus({ hours, t }: { hours: Hours; t: Dict }) {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the clock only exists on the client
    setNow(new Date())
    const i = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(i)
  }, [])
  const s = now ? statusAt(hours, now) : null
  if (!s) return <p className="status" aria-hidden="true">&nbsp;</p>
  const text = s.open
    ? fill(t.status.openUntil, { t: s.until })
    : s.today
      ? fill(t.status.opensAt, { t: s.at })
      : fill(t.status.opensDay, { d: t.days[s.nextDay].toLowerCase(), t: s.at })
  return (
    <p className="status" data-open={s.open} role="status">
      <span className="status__ember" aria-hidden="true" />
      {text}
    </p>
  )
}
