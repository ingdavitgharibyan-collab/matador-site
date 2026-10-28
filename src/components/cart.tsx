'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import type { MenuDish } from '@/lib/data'
import { lineKey, lineLabel, unitPrice, validOpts } from '@/lib/menu'

export type Line = { key: string; id: string; qty: number; opts: string[] }
export type LastOrder = { lines: Line[]; at: number }

type Ctx = {
  lines: (Line & { dish: MenuDish; label: string; unit: number })[]
  /** dishes that were in the ticket but are not available today; shown once, then dropped */
  gone: string[]
  dismissGone: () => void
  count: number
  subtotal: number
  add: (id: string, qty?: number, opts?: string[]) => void
  set: (key: string, qty: number) => void
  clear: () => Line[]
  restore: (lines: Line[]) => void
  lastOrder: LastOrder | null
  rememberOrder: () => void
  isOpen: boolean
  open: () => void
  close: () => void
}

const CartContext = createContext<Ctx | null>(null)
const KEY = 'matador-ticket-v1'
const LAST_KEY = 'matador-last-order-v1'
export const MAX_QTY = 99

/**
 * Whatever is in storage (old versions, hand edits) becomes clean lines: string ids, integer 1–99, option ids as
 * strings, one line per dish + choices.
 */
export function sanitizeLines(input: unknown): Line[] {
  if (!Array.isArray(input)) return []
  const merged = new Map<string, Line>()
  for (const l of input) {
    if (!l || (typeof l.id !== 'string' && typeof l.id !== 'number')) continue
    const qty = Math.floor(Number(l.qty))
    if (!Number.isFinite(qty) || qty < 1) continue
    const id = String(l.id)
    const opts = Array.isArray(l.opts) ? l.opts.map(String) : []
    const key = lineKey(id, opts)
    const prev = merged.get(key)
    merged.set(key, { key, id, opts, qty: Math.min(MAX_QTY, (prev?.qty ?? 0) + qty) })
  }
  return [...merged.values()]
}

const read = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null')
  } catch {
    return null
  }
}
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function CartProvider({ dishes, children }: { dishes: MenuDish[]; children: React.ReactNode }) {
  const [raw, setRaw] = useState<Line[]>([])
  const [ready, setReady] = useState(false)
  const [gone, setGone] = useState<string[]>([])
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null)
  const [isOpen, setOpen] = useState(false)
  const byId = useMemo(() => new Map(dishes.map((d) => [d.id, d])), [dishes])

  useEffect(() => {
    const saved = sanitizeLines(read(KEY))
    const keep = saved.filter((l) => byId.get(l.id)?.available)
    const dropped = saved
      .filter((l) => !byId.get(l.id)?.available)
      .map((l) => byId.get(l.id)?.name)
      .filter(Boolean) as string[]
    const last = read(LAST_KEY)
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate from storage once */
    // child effects (the pre-hydration tap queue in Menu) may already have added lines: merge, don't overwrite
    setRaw((added) => sanitizeLines([...keep, ...added]))
    setGone(dropped)
    if (last && Array.isArray(last.lines)) setLastOrder({ lines: sanitizeLines(last.lines), at: Number(last.at) || 0 })
    setReady(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [byId])

  useEffect(() => {
    if (ready) write(KEY, raw)
  }, [raw, ready])

  const lines = useMemo(
    () =>
      raw.flatMap((l) => {
        const dish = byId.get(l.id)
        if (!dish?.available) return []
        const opts = validOpts(dish, l.opts)
        return [{ ...l, opts, dish, label: lineLabel(dish, opts), unit: unitPrice(dish, opts) }]
      }),
    [raw, byId],
  )

  const set = useCallback((key: string, qty: number) => {
    setRaw((prev) => {
      const q = Math.min(MAX_QTY, Math.floor(qty))
      if (q <= 0) return prev.filter((l) => l.key !== key)
      return prev.map((l) => (l.key === key ? { ...l, qty: q } : l))
    })
  }, [])
  const add = useCallback((id: string, qty = 1, opts: string[] = []) => {
    const key = lineKey(id, opts)
    setRaw((prev) => {
      const cur = prev.find((l) => l.key === key)
      if (!cur) return [...prev, { key, id, opts, qty: Math.min(MAX_QTY, qty) }]
      return prev.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l))
    })
  }, [])

  const value: Ctx = {
    lines,
    gone,
    dismissGone: () => setGone([]),
    count: lines.reduce((s, l) => s + l.qty, 0),
    subtotal: lines.reduce((s, l) => s + l.qty * l.unit, 0),
    add,
    set,
    clear: () => {
      const before = raw
      setRaw([])
      return before
    },
    restore: (ls) => setRaw(sanitizeLines(ls)),
    lastOrder,
    rememberOrder: () => {
      const order = { lines: raw, at: Date.now() }
      write(LAST_KEY, order)
      setLastOrder(order)
    },
    isOpen,
    open: () => setOpen(true),
    close: () => setOpen(false),
  }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const c = useContext(CartContext)
  if (!c) throw new Error('useCart outside CartProvider')
  return c
}
