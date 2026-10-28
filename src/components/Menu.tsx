'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

import type { MenuCategory, MenuDish } from '@/lib/data'
import { type Dict, fill, formatPrice } from '@/lib/i18n'
import { defaultOpts, needsChoice, unitPrice, validOpts } from '@/lib/menu'
import { Cape } from './Cape'
import { useCart } from './cart'
import { DishArt } from './DishArt'
import { IconCheck, IconChili, IconClose, IconMinus, IconPlus, IconStar } from './icons'

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** A small red square flies from the button to the ticket in the header (Web Animations, no library). */
function flyToTicket(from: HTMLElement) {
  const target = document.querySelector<HTMLElement>('[data-ticket-target]')
  if (!target || reduced()) return
  const a = from.getBoundingClientRect()
  const b = target.getBoundingClientRect()
  const t = document.createElement('div')
  t.className = 'token'
  t.style.left = `${a.left + a.width / 2 - 11}px`
  t.style.top = `${a.top + a.height / 2 - 11}px`
  document.body.appendChild(t)
  const dx = b.left + b.width / 2 - (a.left + a.width / 2)
  const dy = b.top + b.height / 2 - (a.top + a.height / 2)
  t.animate(
    [
      { transform: 'translate(0, 0) rotate(0) scale(1)' },
      { transform: `translate(${dx * 0.6}px, ${dy * 0.2 - 40}px) rotate(120deg) scale(0.8)`, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) rotate(225deg) scale(0.4)` },
    ],
    { duration: 650, easing: 'cubic-bezier(0.5, 0, 0.75, 0)' },
  ).onfinish = () => {
    t.remove()
    target.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 240 })
  }
}

/** The muleta crosses the screen while the page scrolls to a category. Decoration only: never blocks a tap. */
function sweep(cape: HTMLElement | null) {
  if (!cape || reduced()) return
  cape.getAnimations().forEach((an) => an.cancel())
  cape.style.visibility = 'visible'
  cape.animate([{ transform: 'translateX(-110%)' }, { transform: 'translateX(115%)' }], {
    duration: 800,
    easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
  }).onfinish = () => (cape.style.visibility = 'hidden')
}

function Pic({ dish }: { dish: MenuDish }) {
  return dish.photo ? (
    <Image src={dish.photo.url} alt={dish.photo.alt} width={800} height={800} sizes="(max-width: 560px) 72px, 112px" />
  ) : (
    <DishArt kind={dish.art} />
  )
}

function Flags({ dish, t, full }: { dish: MenuDish; t: Dict; full?: boolean }) {
  return (
    <p className="dish__meta">
      {dish.weight && <span>{dish.weight}</span>}
      {dish.spicy && (
        <span className="flag">
          <IconChili /> {t.menu.spicy}
        </span>
      )}
      {dish.containsPork && <span className="flag">{t.menu.pork}</span>}
      {dish.vegetarian && <span className="flag">{t.menu.veg}</span>}
      {dish.signature && (
        <span className="flag">
          <IconStar /> {t.menu.signature}
        </span>
      )}
      {full && dish.allergens.length > 0 && (
        <span>
          {t.menu.allergens}: {dish.allergens.map((a) => t.menu.allergen[a] ?? a).join(', ')}
        </span>
      )}
      {!dish.available && <span>{t.menu.soldOut}</span>}
    </p>
  )
}

type Filter = 'spicy' | 'noPork' | 'veg'
const FILTERS: Filter[] = ['spicy', 'noPork', 'veg']
const passes = (d: MenuDish, f: Set<Filter>, q: string) =>
  (!f.has('spicy') || d.spicy) &&
  (!f.has('noPork') || !d.containsPork) &&
  (!f.has('veg') || d.vegetarian) &&
  (!q || `${d.name} ${d.description} ${d.ingredients}`.toLowerCase().includes(q))

declare global {
  interface Window {
    __mq?: string[]
    __mh?: boolean
  }
}

export function Menu({ menu, t }: { menu: MenuCategory[]; t: Dict }) {
  const [active, setActive] = useState(menu[0]?.slug ?? '')
  const [open, setOpen] = useState<MenuDish | null>(null)
  const [picked, setPicked] = useState<string[]>([])
  const [qty, setQty] = useState(1)
  const [done, setDone] = useState<string | null>(null)
  const [filters, setFilters] = useState<Set<Filter>>(new Set())
  const [query, setQuery] = useState('')
  const capeRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const catsRef = useRef<HTMLElement>(null)
  const { add } = useCart()
  const byId = useMemo(() => new Map(menu.flatMap((c) => c.dishes).map((d) => [d.id, d])), [menu])

  const q = query.trim().toLowerCase()
  const filtering = filters.size > 0 || q.length > 0
  const shown = useMemo(
    () => new Set(menu.flatMap((c) => c.dishes).filter((d) => passes(d, filters, q)).map((d) => d.id)),
    [menu, filters, q],
  )

  const openDish = (d: MenuDish) => {
    setQty(1)
    setPicked(defaultOpts(d))
    setOpen(d)
  }

  const onAdd = (dish: MenuDish, el: HTMLElement | null, n = 1, opts = defaultOpts(dish)) => {
    add(dish.id, n, validOpts(dish, opts))
    if (el) flyToTicket(el)
    setDone(dish.id)
    window.setTimeout(() => setDone((cur) => (cur === dish.id ? null : cur)), 1400)
  }

  // taps on "Add" made before the page finished loading were queued by an inline script: honour them now
  /* eslint-disable react-hooks/set-state-in-effect -- one-time hand-over from the pre-hydration queue */
  useEffect(() => {
    window.__mh = true
    const queued = window.__mq ?? []
    window.__mq = []
    document.querySelectorAll('[data-add][data-done="true"]').forEach((b) => b.removeAttribute('data-done'))
    for (const id of queued) {
      const d = byId.get(id)
      if (!d?.available) continue
      if (needsChoice(d)) openDish(d)
      else add(d.id, 1, defaultOpts(d))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, after hydration
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  // scrollspy: the category in the middle of the screen is the current one
  useEffect(() => {
    const sections = menu.map((c) => document.getElementById(`cat-${c.slug}`)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (hit) setActive(hit.target.id.replace('cat-', ''))
      },
      { rootMargin: '-35% 0px -60% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [menu])

  // keep the current category chip in view on the phone's horizontal bar
  useEffect(() => {
    const el = catsRef.current?.querySelector<HTMLElement>(`a[href="#cat-${active}"]`)
    const bar = catsRef.current
    if (el && bar && bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: el.offsetLeft - 16, behavior: reduced() ? 'auto' : 'smooth' })
  }, [active])

  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  const toggle = (f: Filter) =>
    setFilters((cur) => {
      const next = new Set(cur)
      if (next.has(f)) next.delete(f)
      else next.add(f)
      return next
    })
  const filterLabel: Record<Filter, string> = { spicy: t.menu.spicy, noPork: t.menu.noPork, veg: t.menu.veg }

  const pick = (groupOptionIds: string[], id: string, multi: boolean) =>
    setPicked((cur) => {
      if (multi) return cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
      return [...cur.filter((x) => !groupOptionIds.includes(x)), id]
    })

  return (
    <section className="menu" id="menu" aria-labelledby="menu-title">
      <Cape ref={capeRef} page />
      <div className="menu__grid">
        <div className="menu__side" data-reveal>
          <Image className="menu__crest" src="/brand/bull-520.webp" alt="" width={520} height={512} sizes="(max-width: 960px) 88px, 150px" />
          <h2 className="display menu__title" id="menu-title">
            {t.menu.title}
          </h2>
          <nav className="cats" aria-label={t.menu.categories} ref={catsRef}>
            {menu.map((c) => (
              <a
                key={c.slug}
                href={`#cat-${c.slug}`}
                aria-current={c.slug === active ? 'true' : undefined}
                onClick={() => {
                  setActive(c.slug)
                  sweep(capeRef.current)
                }}
              >
                {c.name}
                <span>{c.dishes.length}</span>
              </a>
            ))}
          </nav>
        </div>

        <div className="menu__stage">
          <div className="tools" role="search">
            <label className="sr-only" htmlFor="dish-search">
              {t.menu.search}
            </label>
            <input
              id="dish-search"
              type="search"
              placeholder={t.menu.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              enterKeyHint="search"
              autoComplete="off"
            />
            <div className="chips" role="group" aria-label={t.menu.filters}>
              {FILTERS.map((f) => (
                <button key={f} type="button" aria-pressed={filters.has(f)} onClick={() => toggle(f)}>
                  {f === 'spicy' && <IconChili />}
                  {filterLabel[f]}
                </button>
              ))}
            </div>
            <p className="tools__count" aria-live="polite">
              {filtering ? fill(t.menu.found, { n: shown.size }) : ''}
            </p>
          </div>

          {filtering && shown.size === 0 && (
            <div className="menu__empty">
              <p>{t.menu.nothing}</p>
              <button
                type="button"
                className="btn btn--ink"
                onClick={() => {
                  setFilters(new Set())
                  setQuery('')
                }}
              >
                {t.menu.reset}
              </button>
            </div>
          )}

          {menu.map((c) => {
            const visible = c.dishes.filter((d) => shown.has(d.id))
            return (
              <section
                key={c.slug}
                id={`cat-${c.slug}`}
                className="cat"
                aria-labelledby={`cat-${c.slug}-title`}
                hidden={filtering && visible.length === 0}
              >
                <div className="panel__head">
                  <h3 className="display panel__title" id={`cat-${c.slug}-title`}>
                    {c.name}
                  </h3>
                  {c.tagline && <p className="panel__tag">{c.tagline}</p>}
                </div>
                <ul className="dishes">
                  {c.dishes.map((d) => {
                    const choose = needsChoice(d)
                    return (
                      <li key={d.id} className="dish" data-off={!d.available} hidden={!shown.has(d.id)}>
                        <button type="button" className="dish__art" onClick={() => openDish(d)} aria-label={`${t.menu.details}: ${d.name}`}>
                          <Pic dish={d} />
                        </button>
                        <div>
                          <h4 className="dish__name">
                            <button type="button" onClick={() => openDish(d)}>
                              {d.name}
                            </button>
                          </h4>
                          {d.description && <p className="dish__desc">{d.description}</p>}
                          <Flags dish={d} t={t} />
                        </div>
                        <div className="dish__buy">
                          <span className="price">{formatPrice(d.price)}</span>
                          <button
                            type="button"
                            className="btn btn--ink add"
                            disabled={!d.available}
                            data-add={d.id}
                            data-done={done === d.id}
                            onClick={(e) => (choose ? openDish(d) : onAdd(d, e.currentTarget))}
                            aria-label={`${choose ? t.menu.choose : t.menu.add}: ${d.name}`}
                          >
                            {done === d.id ? <IconCheck /> : <IconPlus />}
                            {done === d.id ? t.menu.added : choose ? t.menu.choose : t.menu.add}
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="sheet"
        aria-labelledby="dish-title"
        onClose={() => setOpen(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(null)
        }}
      >
        {open && (
          <>
            <button type="button" className="sheet__close" onClick={() => setOpen(null)} aria-label={t.menu.close}>
              <IconClose />
            </button>
            <div className="sheet__art">
              {open.photo ? (
                <Image src={open.photo.url} alt={open.photo.alt} width={1200} height={675} sizes="720px" />
              ) : (
                <DishArt kind={open.art} />
              )}
            </div>
            <div className="sheet__body">
              <h3 className="display sheet__title" id="dish-title">
                {open.name}
              </h3>
              {open.description && <p>{open.description}</p>}
              {open.ingredients && (
                <p>
                  <strong>{t.menu.ingredients}: </strong>
                  {open.ingredients}
                </p>
              )}
              <Flags dish={open} t={t} full />
              {open.optionGroups.map((g) => {
                const ids = g.options.map((o) => o.id)
                return (
                  <fieldset key={g.id} className="opts">
                    <legend>
                      {g.name} <span>{g.required ? t.menu.required : t.menu.optional}</span>
                    </legend>
                    {g.options.map((o) => (
                      <label key={o.id}>
                        <input
                          type={g.multi ? 'checkbox' : 'radio'}
                          name={`g-${g.id}`}
                          checked={picked.includes(o.id)}
                          onChange={() => pick(ids, o.id, g.multi)}
                        />
                        <span>{o.name}</span>
                        {o.price > 0 && <span className="opts__price">+{formatPrice(o.price)}</span>}
                      </label>
                    ))}
                  </fieldset>
                )
              })}
              <div className="sheet__row">
                <div className="stepper" role="group" aria-label={t.menu.qty}>
                  <button type="button" onClick={() => setQty((v) => Math.max(1, v - 1))} aria-label={t.ticket.less}>
                    <IconMinus />
                  </button>
                  <output aria-live="polite">{qty}</output>
                  <button type="button" onClick={() => setQty((v) => Math.min(99, v + 1))} aria-label={t.ticket.more}>
                    <IconPlus />
                  </button>
                </div>
                <button
                  type="button"
                  className="btn btn--red sheet__add"
                  disabled={!open.available}
                  onClick={(e) => {
                    onAdd(open, e.currentTarget, qty, picked)
                    setOpen(null)
                  }}
                >
                  <IconPlus />
                  {fill(t.menu.addToTicket, { p: formatPrice(unitPrice(open, validOpts(open, picked)) * qty) })}
                </button>
              </div>
            </div>
          </>
        )}
      </dialog>
    </section>
  )
}
