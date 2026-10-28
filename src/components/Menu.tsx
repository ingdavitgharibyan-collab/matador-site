'use client'

import gsap from 'gsap'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { MenuCategory, MenuDish } from '@/lib/data'
import { type Dict, fill, formatPrice } from '@/lib/i18n'
import { Cape } from './Cape'
import { useCart } from './cart'
import { DishArt } from './DishArt'
import { IconCheck, IconChili, IconClose, IconMinus, IconPlus, IconStar } from './icons'

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** A small red square flies from the button to the ticket in the header. */
function flyToTicket(from: HTMLElement) {
  const target = document.querySelector<HTMLElement>('[data-ticket-target]')
  if (!target || reduced()) return
  const a = from.getBoundingClientRect()
  const b = target.getBoundingClientRect()
  const t = document.createElement('div')
  t.className = 'token'
  document.body.appendChild(t)
  gsap.set(t, { left: a.left + a.width / 2 - 11, top: a.top + a.height / 2 - 11, rotate: 0 })
  gsap
    .timeline({ onComplete: () => t.remove() })
    .to(t, { x: b.left + b.width / 2 - (a.left + a.width / 2), duration: 0.7, ease: 'power2.inOut' }, 0)
    .to(t, { y: b.top + b.height / 2 - (a.top + a.height / 2), duration: 0.7, ease: 'back.in(1.4)' }, 0)
    .to(t, { rotate: 225, scale: 0.4, duration: 0.7, ease: 'power1.in' }, 0)
    .fromTo(target, { scale: 1 }, { scale: 1.12, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' })
}

function Pic({ dish }: { dish: MenuDish }) {
  return dish.photo ? (
    <Image src={dish.photo.url} alt={dish.photo.alt} width={800} height={800} sizes="(max-width: 560px) 72px, 112px" />
  ) : (
    <DishArt kind={dish.art} />
  )
}

function Flags({ dish, t }: { dish: MenuDish; t: Dict }) {
  return (
    <p className="dish__meta">
      {dish.weight && <span>{dish.weight}</span>}
      {dish.spicy && (
        <span className="flag">
          <IconChili /> {t.menu.spicy}
        </span>
      )}
      {dish.signature && (
        <span className="flag">
          <IconStar /> {t.menu.signature}
        </span>
      )}
      {!dish.available && <span>{t.menu.soldOut}</span>}
    </p>
  )
}

export function Menu({ menu, t }: { menu: MenuCategory[]; t: Dict }) {
  const [active, setActive] = useState(menu[0]?.slug ?? '')
  const [open, setOpen] = useState<MenuDish | null>(null)
  const [qty, setQty] = useState(1)
  const [done, setDone] = useState<string | null>(null)
  const capeRef = useRef<HTMLDivElement>(null)
  const busy = useRef(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { add } = useCart()

  const choose = useCallback(
    (slug: string) => {
      if (slug === active || busy.current) return
      const cape = capeRef.current
      if (!cape || reduced()) {
        setActive(slug)
        return
      }
      busy.current = true
      gsap
        .timeline({ onComplete: () => void (busy.current = false) })
        .set(cape, { visibility: 'visible', xPercent: -120 })
        .to(cape, { xPercent: 0, duration: 0.42, ease: 'power3.in' })
        .add(() => setActive(slug))
        .to(cape, { xPercent: 120, duration: 0.55, ease: 'power3.out' }, '+=0.05')
        .set(cape, { visibility: 'hidden' })
    },
    [active],
  )

  // other parts of the page (the "three fires" list, hash links) can pick a category
  useEffect(() => {
    const onPick = (e: Event) => {
      const slug = (e as CustomEvent<string>).detail
      if (menu.some((c) => c.slug === slug)) choose(slug)
    }
    window.addEventListener('matador:category', onPick)
    return () => window.removeEventListener('matador:category', onPick)
  }, [choose, menu])

  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  const onAdd = (dish: MenuDish, el: HTMLElement, n = 1) => {
    add(dish.id, n)
    flyToTicket(el)
    setDone(dish.id)
    window.setTimeout(() => setDone((cur) => (cur === dish.id ? null : cur)), 1400)
  }

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const n = menu.length
    let j = -1
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') j = (i + 1) % n
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') j = (i - 1 + n) % n
    if (e.key === 'Home') j = 0
    if (e.key === 'End') j = n - 1
    if (j < 0) return
    e.preventDefault()
    choose(menu[j].slug)
    document.getElementById(`tab-${menu[j].slug}`)?.focus()
  }

  return (
    <section className="menu" id="menu" aria-labelledby="menu-title">
      <div className="menu__grid">
        <div className="menu__side" data-reveal>
          <Image className="menu__crest" src="/brand/bull-520.webp" alt="" width={520} height={512} />
          <h2 className="display menu__title" id="menu-title">
            {t.menu.title}
          </h2>
          <div className="cats" role="tablist" aria-label={t.menu.categories} aria-orientation="vertical">
            {menu.map((c, i) => (
              <button
                key={c.slug}
                id={`tab-${c.slug}`}
                role="tab"
                aria-selected={c.slug === active}
                aria-controls={`panel-${c.slug}`}
                tabIndex={c.slug === active ? 0 : -1}
                onClick={() => choose(c.slug)}
                onKeyDown={(e) => onTabKey(e, i)}
              >
                {c.name}
                <span>{c.dishes.length}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="menu__stage">
          <Cape ref={capeRef} />
          {menu.map((c) => (
            <div
              key={c.slug}
              id={`panel-${c.slug}`}
              role="tabpanel"
              aria-labelledby={`tab-${c.slug}`}
              hidden={c.slug !== active}
              tabIndex={0}
            >
              <div className="panel__head">
                <h3 className="display panel__title">{c.name}</h3>
                {c.tagline && <p className="panel__tag">{c.tagline}</p>}
              </div>
              <ul className="dishes">
                {c.dishes.map((d) => (
                  <li key={d.id} className="dish" data-off={!d.available}>
                    <button
                      type="button"
                      className="dish__art"
                      onClick={() => {
                        setQty(1)
                        setOpen(d)
                      }}
                      aria-label={`${t.menu.details}: ${d.name}`}
                    >
                      <Pic dish={d} />
                    </button>
                    <div>
                      <h4 className="dish__name">
                        <button
                          type="button"
                          onClick={() => {
                            setQty(1)
                            setOpen(d)
                          }}
                        >
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
                        data-done={done === d.id}
                        onClick={(e) => onAdd(d, e.currentTarget)}
                        aria-label={`${t.menu.add}: ${d.name}`}
                      >
                        {done === d.id ? <IconCheck /> : <IconPlus />}
                        {done === d.id ? t.menu.added : t.menu.add}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
              <Flags dish={open} t={t} />
              <div className="sheet__row">
                <div className="stepper" role="group" aria-label={t.menu.qty}>
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label={t.ticket.less}>
                    <IconMinus />
                  </button>
                  <output aria-live="polite">{qty}</output>
                  <button type="button" onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label={t.ticket.more}>
                    <IconPlus />
                  </button>
                </div>
                <button
                  type="button"
                  className="btn btn--red"
                  disabled={!open.available}
                  onClick={(e) => {
                    onAdd(open, e.currentTarget, qty)
                    setOpen(null)
                  }}
                >
                  <IconPlus />
                  {fill(t.menu.addToTicket, { p: formatPrice(open.price * qty) })}
                </button>
              </div>
            </div>
          </>
        )}
      </dialog>
    </section>
  )
}
