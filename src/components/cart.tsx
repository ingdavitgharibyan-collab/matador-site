'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import type { MenuDish } from '@/lib/data'

type Line = { id: string; qty: number }
type Ctx = {
  lines: (Line & { dish: MenuDish })[]
  count: number
  subtotal: number
  add: (id: string, qty?: number) => void
  set: (id: string, qty: number) => void
  clear: () => void
  isOpen: boolean
  open: () => void
  close: () => void
}

const CartContext = createContext<Ctx | null>(null)
const KEY = 'matador-ticket-v1'

export function CartProvider({ dishes, children }: { dishes: MenuDish[]; children: React.ReactNode }) {
  const [raw, setRaw] = useState<Line[]>([])
  const [isOpen, setOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]')
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage once
      if (Array.isArray(saved)) setRaw(saved.filter((l) => typeof l?.id === 'string' && l.qty > 0))
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(raw))
    } catch {}
  }, [raw])

  const byId = useMemo(() => new Map(dishes.map((d) => [d.id, d])), [dishes])
  const lines = useMemo(
    () => raw.flatMap((l) => (byId.get(l.id)?.available ? [{ ...l, dish: byId.get(l.id)! }] : [])),
    [raw, byId],
  )

  const set = useCallback((id: string, qty: number) => {
    setRaw((prev) => {
      const rest = prev.filter((l) => l.id !== id)
      if (qty <= 0) return rest
      const i = prev.findIndex((l) => l.id === id)
      const next = [...prev]
      if (i === -1) return [...rest, { id, qty: Math.min(qty, 99) }]
      next[i] = { id, qty: Math.min(qty, 99) }
      return next
    })
  }, [])
  const add = useCallback(
    (id: string, qty = 1) => {
      setRaw((prev) => {
        const cur = prev.find((l) => l.id === id)?.qty ?? 0
        const i = prev.findIndex((l) => l.id === id)
        if (i === -1) return [...prev, { id, qty }]
        const next = [...prev]
        next[i] = { id, qty: Math.min(cur + qty, 99) }
        return next
      })
    },
    [],
  )

  const value: Ctx = {
    lines,
    count: lines.reduce((s, l) => s + l.qty, 0),
    subtotal: lines.reduce((s, l) => s + l.qty * l.dish.price, 0),
    add,
    set,
    clear: () => setRaw([]),
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
