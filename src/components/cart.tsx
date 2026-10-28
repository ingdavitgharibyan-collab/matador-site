'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import type { MenuDish } from '@/lib/data'

type Line = { id: string; qty: number }
export type LastOrder = { lines: Line[]; at: number }

type Ctx = {
  lines: (Line & { dish: MenuDish })[]
  /** dishes that were in the ticket but are not available today; shown once, then dropped */
  gone: string[]
  dismissGone: () => void
  count: number
  subtotal: number
  add: (id: string, qty?: number) => void
  set: (id: string, qty: number) => void
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

/** Whatever is in storage (old versions, hand edits) becomes clean lines: string ids, integer 1–99, no duplicates. */
export function sanitizeLines(input: unknown): Line[] {
  if (!Array.isArray(input)) return []
  const merged = new Map<string, number>()
  for (const l of input) {
    if (!l || (typeof l.id !== 'string' && typeof l.id !== 'number')) continue
    const qty = Math.floor(Number(l.qty))
    if (!Number.isFinite(qty) || qty < 1) continue
    const id = String(l.id)
    merged.set(id, Math.min(MAX_QTY, (merged.get(id) ?? 0) + qty))
  }
  return [...merged].map(([id, qty]) => ({ id, qty }))
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
    setRaw(keep)
    setGone(dropped)
    if (last && Array.isArray(last.lines)) setLastOrder({ lines: sanitizeLines(last.lines), at: Number(last.at) || 0 })
    setReady(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [byId])

  useEffect(() => {
    if (ready) write(KEY, raw)
  }, [raw, ready])

  const lines = useMemo(
    () => raw.flatMap((l) => (byId.get(l.id)?.available ? [{ ...l, dish: byId.get(l.id)! }] : [])),
    [raw, byId],
  )

  const set = useCallback((id: string, qty: number) => {
    setRaw((prev) => {
      const q = Math.min(MAX_QTY, Math.floor(qty))
      if (q <= 0) return prev.filter((l) => l.id !== id)
      return prev.some((l) => l.id === id) ? prev.map((l) => (l.id === id ? { id, qty: q } : l)) : [...prev, { id, qty: q }]
    })
  }, [])
  const add = useCallback((id: string, qty = 1) => {
    setRaw((prev) => {
      const cur = prev.find((l) => l.id === id)
      if (!cur) return [...prev, { id, qty: Math.min(MAX_QTY, qty) }]
      return prev.map((l) => (l.id === id ? { id, qty: Math.min(MAX_QTY, l.qty + qty) } : l))
    })
  }, [])

  const value: Ctx = {
    lines,
    gone,
    dismissGone: () => setGone([]),
    count: lines.reduce((s, l) => s + l.qty, 0),
    subtotal: lines.reduce((s, l) => s + l.qty * l.dish.price, 0),
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
