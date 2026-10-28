'use client'

import Image from 'next/image'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import type { MenuDish, SiteSettings } from '@/lib/data'
import { canOrder, type OrderGate } from '@/lib/hours'
import { type Dict, fill, formatPrice } from '@/lib/i18n'
import { defaultOpts, needsChoice } from '@/lib/menu'
import { placeOrder } from '@/app/(site)/actions'
import { normalizePhone, orderMessage, orderRef } from '@/lib/order'
import { quote } from '@/lib/pricing'
import { type Line, MAX_QTY, useCart } from './cart'
import { IconCheck, IconClose, IconMinus, IconPhone, IconPlus, IconTelegram, IconWhatsapp } from './icons'

const FORM_KEY = 'matador-ticket-form-v1'
type Field = 'name' | 'phone' | 'address'
type Sent = { ref: string; lines: { name: string; qty: number }[]; total: number; channel: string; token?: string }

const TABLE_KEY = 'matador-table'

export function Ticket({
  t,
  lang,
  settings,
  drinks = [],
}: {
  t: Dict
  lang: string
  settings: SiteSettings
  drinks?: MenuDish[]
}) {
  const cart = useCart()
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  const formId = `${id}-form`
  const [mode, setMode] = useState<'delivery' | 'pickup' | 'table'>('delivery')
  const [table, setTable] = useState('')
  const [zoneId, setZoneId] = useState(settings.zones[0]?.id ?? '')
  const [pay, setPay] = useState(settings.paymentMethods[0] ?? 'cash')
  const [form, setForm] = useState({ name: '', phone: '', address: '', flat: '', note: '' })
  const [tried, setTried] = useState(false)
  const [formError, setFormError] = useState('')
  const [tg, setTg] = useState<{ ok: boolean; text: string } | null>(null)
  const [sent, setSent] = useState<Sent | null>(null)
  const [undo, setUndo] = useState<{ lines: Line[] } | null>(null)
  const [now, setNow] = useState(() => new Date())
  const sending = useRef(false)
  const openedAt = useRef(0)
  const [busy, setBusy] = useState(false)
  const focusAfterRemove = useRef<number | null>(null)
  const linesRef = useRef<HTMLUListElement>(null)
  const emptyRef = useRef<HTMLAnchorElement>(null)
  const undoRef = useRef<HTMLButtonElement>(null)
  const honeypot = useRef<HTMLInputElement>(null)

  // ---------------------------------------------------------------- lifecycle
  /* eslint-disable react-hooks/set-state-in-effect -- restore the guest's details and table once, from storage */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(FORM_KEY) || 'null')
      if (saved) {
        setForm((f) => ({ ...f, name: saved.name ?? '', phone: saved.phone ?? '', address: saved.address ?? '', flat: saved.flat ?? '' }))
        if (saved.zone && settings.zones.some((z) => z.id === saved.zone)) setZoneId(saved.zone)
      }
    } catch {}
    // a table QR (…?table=5) puts the ticket in table mode for this visit
    try {
      const fromUrl = new URLSearchParams(window.location.search).get('table')
      if (fromUrl && /^\d{1,3}$/.test(fromUrl)) sessionStorage.setItem(TABLE_KEY, fromUrl)
      const tbl = sessionStorage.getItem(TABLE_KEY)
      if (tbl) {
        setTable(tbl)
        setMode('table')
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  const acknowledgeSent = useCallback(() => {
    if (!sent) return
    cart.clear()
    setSent(null)
    setTg(null)
  }, [sent, cart])

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (cart.isOpen && !d.open) {
      d.showModal()
      openedAt.current = performance.now()
      setNow(new Date())
    }
    if (!cart.isOpen && d.open) d.close()
  }, [cart.isOpen])

  useEffect(() => {
    if (!cart.isOpen) return
    const i = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(i)
  }, [cart.isOpen])

  useEffect(() => {
    if (!undo) return
    undoRef.current?.focus()
    const i = window.setTimeout(() => setUndo(null), 6000)
    return () => window.clearTimeout(i)
  }, [undo])

  // keep keyboard focus inside the ticket when a line disappears
  useEffect(() => {
    const idx = focusAfterRemove.current
    if (idx === null) return
    focusAfterRemove.current = null
    const rows = linesRef.current?.querySelectorAll<HTMLButtonElement>('.line .stepper button:first-child')
    if (rows?.length) rows[Math.min(idx, rows.length - 1)].focus()
    else emptyRef.current?.focus()
  }, [cart.lines.length])

  // ---------------------------------------------------------------- rules
  const gate: OrderGate = canOrder(
    {
      hours: settings.hours,
      closures: settings.closures,
      paused: settings.paused,
      pauseNote: settings.pauseNote,
      lastOrderMinutes: settings.lastOrderMinutes,
    },
    now,
  )
  const gateText = (() => {
    if (gate.ok) return ''
    if (gate.reason === 'paused') return fill(t.ticket.gatePaused, { n: settings.pauseNote ? ` ${settings.pauseNote}` : '' })
    if (gate.reason === 'last') return fill(t.ticket.gateLast, { m: settings.lastOrderMinutes })
    const s = gate.status
    if (s && !s.open && s.at) {
      const when = s.today ? fill(t.ticket.whenToday, { t: s.at }) : fill(t.ticket.whenDay, { d: t.days[s.nextDay].toLowerCase(), t: s.at })
      return (s.closureNote ? `${s.closureNote}. ` : '') + fill(t.ticket.gateClosed, { when })
    }
    return fill(t.status.closedNote, { n: s && !s.open && s.closureNote ? `. ${s.closureNote}` : '' })
  })()

  const { zone, fee, freeFrom, minOrder, belowMin, total } = quote(cart.subtotal, mode, settings, zoneId)
  const hasDrink = cart.lines.some((l) => l.dish.category === 'drinks')
  const offer = hasDrink ? [] : drinks.filter((d) => d.available && !needsChoice(d)).slice(0, 3)

  const phone = normalizePhone(form.phone)
  const errors: Partial<Record<Field, string>> = {
    ...(form.name.trim() ? {} : { name: t.ticket.errName }),
    ...(phone ? {} : { phone: t.ticket.errPhone }),
    ...(mode === 'delivery' && form.address.trim().length < 4 ? { address: t.ticket.errAddr } : {}),
  }
  const showErr = (f: Field) => (tried ? errors[f] : undefined)

  // ---------------------------------------------------------------- send
  const prepare = () => {
    setTried(true)
    const first = (['phone', 'name', 'address'] as Field[]).find((f) => errors[f])
    if (belowMin) {
      setFormError(fill(t.ticket.minOrder, { p: formatPrice(minOrder), r: formatPrice(minOrder - cart.subtotal) }))
      return null
    }
    if (first) {
      setFormError(t.ticket.fix)
      const el = document.getElementById(`${id}-${first}`)
      el?.focus()
      el?.scrollIntoView({ block: 'center' })
      return null
    }
    setFormError('')
    try {
      localStorage.setItem(
        FORM_KEY,
        JSON.stringify({ name: form.name, phone: phone, address: form.address, flat: form.flat, zone: zoneId }),
      )
    } catch {}
    const draft = {
      ref: orderRef(),
      lines: cart.lines.map((l) => ({ name: l.label, qty: l.qty, price: l.unit })),
      mode,
      table,
      zone: mode === 'delivery' && zone ? `${zone.name}, ${fill(t.ticket.eta, { a: zone.etaMin, b: zone.etaMax })}` : undefined,
      fee,
      payment: pay,
      name: form.name,
      phone: phone!,
      address: form.address,
      flat: form.flat,
      note: form.note,
    }
    return { draft, text: orderMessage(draft, t) }
  }

  const markSent = (r: string, channel: string, token?: string, sum = total) => {
    cart.rememberOrder()
    setSent({ ref: r, lines: cart.lines.map((l) => ({ name: l.label, qty: l.qty })), total: sum, channel, token })
  }

  /** Records the order on the server (prices, rules, number) and returns the text to send, or null after showing why. */
  const submit = async (channel: 'whatsapp' | 'telegram', p: NonNullable<ReturnType<typeof prepare>>, elapsed: number) => {
    setBusy(true)
    try {
      const r = await placeOrder({
        lang,
        lines: cart.lines.map((l) => ({ id: l.id, qty: l.qty, opts: l.opts })),
        mode,
        table,
        zoneId,
        payment: pay,
        name: form.name,
        phone: p.draft.phone,
        address: form.address,
        flat: form.flat,
        note: form.note,
        channel,
        website: honeypot.current?.value ?? '',
        elapsed,
      })
      if (r.ok) return r
      const msg: Record<string, string> = {
        closed: gateText || t.ticket.tryAgain,
        paused: fill(t.ticket.gatePaused, { n: '' }),
        last: fill(t.ticket.gateLast, { m: settings.lastOrderMinutes }),
        min: fill(t.ticket.minOrder, { p: formatPrice(minOrder), r: formatPrice(Math.max(0, minOrder - cart.subtotal)) }),
        rate: t.ticket.tooMany,
        invalid: t.ticket.fix,
        empty: t.ticket.empty,
        spam: t.ticket.tryAgain,
      }
      setFormError(msg[r.error] ?? t.ticket.tryAgain)
      setNow(new Date())
      return null
    } catch {
      // the server could not be reached: still let the guest send the order, it just is not recorded
      return { ok: true as const, ref: p.draft.ref, token: '', total, message: p.text }
    } finally {
      setBusy(false)
    }
  }

  const sendWa = async (e: React.SyntheticEvent) => {
    // a double tap must not open two chats
    if (!gate.ok || sending.current) return
    const p = prepare()
    if (!p) return
    sending.current = true
    window.setTimeout(() => (sending.current = false), 2500)
    // open the window inside the tap (pop-up blockers), fill it once the order is recorded
    const w = window.open('', '_blank')
    const r = await submit('whatsapp', p, e.timeStamp - openedAt.current)
    if (!r) {
      w?.close()
      return
    }
    const url = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(r.message)}`
    if (w) {
      w.opener = null
      w.location.href = url
    } else window.open(url, '_blank', 'noopener')
    markSent(r.ref, 'WhatsApp', r.token, r.total)
  }

  const sendTg = async (e: React.SyntheticEvent) => {
    if (!gate.ok || sending.current) return
    const p = prepare()
    if (!p) return
    sending.current = true
    window.setTimeout(() => (sending.current = false), 2500)
    const r = await submit('telegram', p, e.timeStamp - openedAt.current)
    if (!r) return
    let ok = false
    try {
      await navigator.clipboard.writeText(r.message)
      ok = true
    } catch {}
    setTg({ ok, text: r.message })
    // the chat opens from a real link the guest taps next (no pop-up after an await: iOS blocks those)
    markSent(r.ref, 'Telegram', r.token, r.total)
  }

  const phoneHref = `tel:${settings.phone.replace(/[^\d+]/g, '')}`
  const field = (k: keyof typeof form) => ({
    id: `${id}-${k}`,
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value })),
    ...(k !== 'note'
      ? {
          'aria-invalid': Boolean(showErr(k as Field)),
          'aria-describedby': showErr(k as Field) ? `${id}-${k}-err` : undefined,
        }
      : {}),
  })
  const err = (k: Field) =>
    showErr(k) ? (
      <p className="field__err" id={`${id}-${k}-err`}>
        {showErr(k)}
      </p>
    ) : null

  const partners =
    settings.partners.length > 0 ? (
      <div>
        <p className="sums__note">{t.ticket.partners}</p>
        <div className="partners">
          {settings.partners.map((p) => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer">
              {p.name}
            </a>
          ))}
        </div>
      </div>
    ) : null

  const lastCount = cart.lastOrder?.lines.reduce((s, l) => s + l.qty, 0) ?? 0

  return (
    <dialog
      ref={ref}
      className="ticket"
      aria-labelledby={`${id}-title`}
      onClose={() => {
        acknowledgeSent()
        cart.close()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) cart.close()
      }}
    >
      <div className="ticket__paper">
        <div className="ticket__head">
          <Image src="/brand/medallion-520.webp" alt="" width={520} height={526} sizes="64px" />
          <h2 className="display ticket__title" id={`${id}-title`}>
            {sent ? t.ticket.sentTitle : t.ticket.title}
          </h2>
          <button type="button" className="ticket__close" onClick={cart.close} aria-label={t.menu.close}>
            <IconClose />
          </button>
        </div>

        <div className="ticket__body">
          {cart.gone.length > 0 && (
            <div className="notice" role="status">
              {cart.gone.map((d) => (
                <p key={d}>{fill(t.ticket.gone, { d })}</p>
              ))}
              <button type="button" className="ticket__clear" onClick={cart.dismissGone}>
                {t.menu.close}
              </button>
            </div>
          )}
          {undo && (
            <div className="notice" role="status">
              <p>{t.ticket.cleared}</p>
              <button
                ref={undoRef}
                type="button"
                className="btn btn--ink"
                onClick={() => {
                  cart.restore(undo.lines)
                  setUndo(null)
                }}
              >
                {t.ticket.undo}
              </button>
            </div>
          )}

          {sent ? (
            <div className="stub">
              <p className="stub__ref">
                {t.ticket.orderRef} <strong>{sent.ref}</strong>
              </p>
              <ul className="stub__lines">
                {sent.lines.map((l) => (
                  <li key={l.name}>
                    {l.qty} × {l.name}
                  </li>
                ))}
              </ul>
              <p className="stub__total">
                {t.ticket.total}: {formatPrice(sent.total)}
              </p>
              {tg && (
                <div className="tg">
                  <p className="ticket__msg" data-kind={tg.ok ? 'ok' : 'error'} role="status">
                    {tg.ok ? t.ticket.copied : t.ticket.copyFail}
                  </p>
                  {!tg.ok && (
                    <textarea
                      className="tg__text"
                      readOnly
                      value={tg.text}
                      rows={6}
                      onFocus={(e) => e.currentTarget.select()}
                      aria-label={t.ticket.title}
                    />
                  )}
                  <a className="btn btn--ink" href={`https://t.me/${settings.telegram}`} target="_blank" rel="noopener noreferrer">
                    <IconTelegram /> {t.ticket.openTg}
                  </a>
                </div>
              )}
              <p>{t.ticket.sentLead}</p>
              {sent.token && (
                <a className="btn btn--ghost" href={`/${lang}/o/${sent.token}`}>
                  {t.ticket.track}
                </a>
              )}
              <div className="stub__actions">
                <button
                  type="button"
                  className="btn btn--red"
                  onClick={() => {
                    acknowledgeSent()
                    cart.close()
                  }}
                >
                  <IconCheck /> {t.ticket.newOrder}
                </button>
                <button
                  type="button"
                  className="ticket__clear"
                  onClick={() => {
                    setSent(null)
                    setTg(null)
                  }}
                >
                  {t.ticket.retry}
                </button>
              </div>
            </div>
          ) : cart.lines.length === 0 ? (
            <div className="ticket__empty">
              <p>{t.ticket.empty}</p>
              <a ref={emptyRef} className="btn btn--ink" href="#menu" onClick={cart.close}>
                {t.ticket.toMenu}
              </a>
              {cart.lastOrder && lastCount > 0 && !undo && (
                <button type="button" className="repeat" onClick={() => cart.restore(cart.lastOrder!.lines)}>
                  <strong>{t.ticket.repeat}</strong>
                  <span>{fill(t.ticket.repeatMeta, { n: lastCount })}</span>
                </button>
              )}
              {partners}
            </div>
          ) : (
            <>
              {!gate.ok && (
                <div className="gate" role="alert">
                  <p>{gateText}</p>
                  <p>
                    {fill(t.ticket.gateCall, { p: '' })}
                    <a href={phoneHref}>{settings.phone}</a>
                  </p>
                </div>
              )}
              <ul className="lines" ref={linesRef}>
                {cart.lines.map((l, i) => (
                  <li className="line" key={l.key}>
                    <span className="line__name">{l.label}</span>
                    <div className="stepper" role="group" aria-label={`${t.menu.qty}: ${l.dish.name}`}>
                      <button
                        type="button"
                        onClick={() => {
                          if (l.qty === 1) focusAfterRemove.current = i
                          cart.set(l.key, l.qty - 1)
                        }}
                        aria-label={l.qty === 1 ? `${t.ticket.remove}: ${l.dish.name}` : t.ticket.less}
                      >
                        <IconMinus />
                      </button>
                      <output>{l.qty}</output>
                      <button
                        type="button"
                        onClick={() => cart.set(l.key, l.qty + 1)}
                        aria-label={t.ticket.more}
                        disabled={l.qty >= MAX_QTY}
                      >
                        <IconPlus />
                      </button>
                    </div>
                    <span className="line__price">{formatPrice(l.qty * l.unit)}</span>
                  </li>
                ))}
              </ul>

              <div className="sums">
                <div>
                  <span>{t.ticket.subtotal}</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                {mode === 'delivery' && (
                  <div>
                    <span>{t.ticket.delivery}</span>
                    <span>{fee ? formatPrice(fee) : t.ticket.free}</span>
                  </div>
                )}
                <div className="sums__total">
                  <span>{t.ticket.total}</span>
                  <span>{formatPrice(total)}</span>
                </div>
                {mode === 'delivery' && freeFrom ? (
                  <div className="progress" aria-live="polite">
                    <span className="progress__bar" style={{ ['--p' as string]: Math.min(1, cart.subtotal / freeFrom) }} aria-hidden="true" />
                    <span>
                      {cart.subtotal >= freeFrom
                        ? t.ticket.freeReached
                        : fill(t.ticket.freeLeft, { p: formatPrice(freeFrom - cart.subtotal) })}
                    </span>
                  </div>
                ) : null}
                {belowMin && (
                  <p className="sums__note">{fill(t.ticket.minOrder, { p: formatPrice(minOrder), r: formatPrice(minOrder - cart.subtotal) })}</p>
                )}
              </div>

              {offer.length > 0 && (
                <div className="upsell">
                  <p>{t.ticket.upsell}</p>
                  <div className="chips">
                    {offer.map((d) => (
                      <button key={d.id} type="button" onClick={() => cart.add(d.id, 1, defaultOpts(d))}>
                        <IconPlus /> {d.name} · {formatPrice(d.price)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form
                className="form"
                id={formId}
                onSubmit={(e) => {
                  e.preventDefault()
                  void sendWa(e)
                }}
                noValidate
              >
                <fieldset className="seg">
                  <legend>{t.ticket.mode}</legend>
                  {table && (
                    <label>
                      <input type="radio" name="mode" checked={mode === 'table'} onChange={() => setMode('table')} />
                      {fill(t.ticket.modeTable, { n: table })}
                    </label>
                  )}
                  <label>
                    <input type="radio" name="mode" checked={mode === 'delivery'} onChange={() => setMode('delivery')} />
                    {t.ticket.modeDelivery}
                  </label>
                  <label>
                    <input type="radio" name="mode" checked={mode === 'pickup'} onChange={() => setMode('pickup')} />
                    {t.ticket.modePickup}
                  </label>
                </fieldset>
                <div className="field">
                  <label htmlFor={`${id}-phone`}>{t.ticket.phone}</label>
                  <input
                    {...field('phone')}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    enterKeyHint="next"
                    placeholder="091 123456"
                    onBlur={() => phone && setForm((f) => ({ ...f, phone }))}
                  />
                  {err('phone')}
                </div>
                <div className="field">
                  <label htmlFor={`${id}-name`}>{t.ticket.name}</label>
                  <input {...field('name')} autoComplete="name" enterKeyHint="next" maxLength={60} />
                  {err('name')}
                </div>
                {mode === 'delivery' && settings.zones.length > 0 && (
                  <fieldset className="seg seg--wrap seg--zones">
                    <legend>{t.ticket.zone}</legend>
                    {settings.zones.map((z) => (
                      <label key={z.id}>
                        <input type="radio" name="zone" checked={zoneId === z.id} onChange={() => setZoneId(z.id)} />
                        <span>{z.name}</span>
                        <small>
                          {z.fee ? formatPrice(z.fee) : t.ticket.free}, {fill(t.ticket.eta, { a: z.etaMin, b: z.etaMax })}
                        </small>
                      </label>
                    ))}
                  </fieldset>
                )}
                {mode === 'delivery' && (
                  <>
                    <div className="field">
                      <label htmlFor={`${id}-address`}>{t.ticket.address}</label>
                      <input {...field('address')} autoComplete="street-address" enterKeyHint="next" maxLength={200} />
                      {err('address')}
                    </div>
                    <div className="field">
                      <label htmlFor={`${id}-flat`}>{t.ticket.flat}</label>
                      <input {...field('flat')} autoComplete="address-line2" enterKeyHint="next" maxLength={80} />
                    </div>
                  </>
                )}
                {settings.paymentMethods.length > 1 && (
                  <fieldset className="seg seg--wrap">
                    <legend>{t.ticket.payment}</legend>
                    {settings.paymentMethods.map((m) => (
                      <label key={m}>
                        <input type="radio" name="pay" checked={pay === m} onChange={() => setPay(m)} />
                        {t.ticket.pay[m] ?? m}
                      </label>
                    ))}
                  </fieldset>
                )}
                <div className="field">
                  <label htmlFor={`${id}-note`}>{t.ticket.note}</label>
                  <textarea {...field('note')} placeholder={t.ticket.notePh} maxLength={500} enterKeyHint="send" />
                </div>
                {/* bots fill every field; people never see this one */}
                <input ref={honeypot} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp" defaultValue="" />
                <p className="ticket__fine">{t.ticket.notice}</p>
              </form>

              <button
                type="button"
                className="ticket__clear"
                onClick={() => {
                  setUndo({ lines: cart.clear() })
                }}
              >
                {t.ticket.clear}
              </button>
              {!gate.ok && partners}
            </>
          )}
        </div>

        {!sent && cart.lines.length > 0 && (
          <div className="ticket__foot">
            {formError && (
              <p className="ticket__msg" role="alert" data-kind="error">
                {formError}
              </p>
            )}
            <div className="ticket__actions">
              {settings.whatsapp && (
                <button type="submit" form={formId} className="btn btn--red" disabled={!gate.ok || busy} aria-busy={busy}>
                  <IconWhatsapp /> {t.ticket.sendWa}
                </button>
              )}
              {settings.telegram && (
                <button type="button" className="btn btn--ink btn--square" onClick={sendTg} disabled={!gate.ok || busy} aria-label={t.ticket.sendTg} title={t.ticket.sendTg}>
                  <IconTelegram />
                </button>
              )}
              <a className="btn btn--ghost btn--square" href={phoneHref} aria-label={t.ticket.call} title={t.ticket.call}>
                <IconPhone />
              </a>
            </div>
          </div>
        )}
      </div>
    </dialog>
  )
}
