'use client'

import Image from 'next/image'
import { useEffect, useId, useRef, useState } from 'react'

import type { SiteSettings } from '@/lib/data'
import { type Dict, fill, formatPrice } from '@/lib/i18n'
import { useCart } from './cart'
import { IconClose, IconMinus, IconPhone, IconPlus, IconTelegram, IconWhatsapp } from './icons'

type Msg = { kind: 'error' | 'ok'; text: string } | null
const FORM_KEY = 'matador-ticket-form-v1'

export function Ticket({ t, settings }: { t: Dict; settings: SiteSettings }) {
  const cart = useCart()
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  const [mode, setMode] = useState<'delivery' | 'pickup'>('delivery')
  const [form, setForm] = useState({ name: '', phone: '', address: '', note: '' })
  const [msg, setMsg] = useState<Msg>(null)
  const [tried, setTried] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(FORM_KEY) || 'null')
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore the visitor's details once
      if (saved) setForm((f) => ({ ...f, name: saved.name ?? '', phone: saved.phone ?? '', address: saved.address ?? '' }))
    } catch {}
  }, [])

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (cart.isOpen && !d.open) d.showModal()
    if (!cart.isOpen && d.open) d.close()
  }, [cart.isOpen])

  const fee =
    mode === 'pickup' || cart.subtotal === 0
      ? 0
      : settings.freeDeliveryFrom && cart.subtotal >= settings.freeDeliveryFrom
        ? 0
        : settings.deliveryFee
  const total = cart.subtotal + fee

  const missingName = !form.name.trim()
  const missingPhone = form.phone.replace(/\D/g, '').length < 6
  const missingAddr = mode === 'delivery' && !form.address.trim()
  const invalid = missingName || missingPhone || missingAddr

  const message = () => {
    const rows = cart.lines.map((l) => `• ${l.qty} × ${l.dish.name} — ${formatPrice(l.qty * l.dish.price)}`)
    return [
      t.ticket.msgHello,
      ...rows,
      '',
      `${t.ticket.subtotal}: ${formatPrice(cart.subtotal)}`,
      mode === 'delivery' ? `${t.ticket.delivery}: ${fee ? formatPrice(fee) : t.ticket.free}` : t.ticket.modePickup,
      `${t.ticket.total}: ${formatPrice(total)}`,
      '',
      `${t.ticket.name}: ${form.name.trim()}`,
      `${t.ticket.phone}: ${form.phone.trim()}`,
      mode === 'delivery' ? `${t.ticket.address}: ${form.address.trim()}` : '',
      form.note.trim() ? `${t.ticket.note}: ${form.note.trim()}` : '',
    ]
      .filter((x, i, a) => x !== '' || a[i - 1] !== '')
      .join('\n')
      .trim()
  }

  const guard = () => {
    setTried(true)
    if (invalid) {
      setMsg({ kind: 'error', text: fill(t.ticket.missing, { a: missingAddr ? t.ticket.missingAddr : '' }) })
      return false
    }
    try {
      localStorage.setItem(FORM_KEY, JSON.stringify({ name: form.name, phone: form.phone, address: form.address }))
    } catch {}
    return true
  }

  const sendWa = () => {
    if (!guard()) return
    window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(message())}`, '_blank', 'noopener')
    setMsg({ kind: 'ok', text: fill(t.ticket.sent, { app: 'WhatsApp' }) })
  }
  const sendTg = async () => {
    if (!guard()) return
    try {
      await navigator.clipboard.writeText(message())
    } catch {}
    window.open(`https://t.me/${settings.telegram}`, '_blank', 'noopener')
    setMsg({ kind: 'ok', text: t.ticket.copied })
  }

  const phoneHref = `tel:${settings.phone.replace(/[^\d+]/g, '')}`
  const field = (k: keyof typeof form) => ({
    id: `${id}-${k}`,
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }))
      if (msg?.kind === 'error') setMsg(null)
    },
  })

  return (
    <dialog
      ref={ref}
      className="ticket"
      aria-labelledby={`${id}-title`}
      onClose={cart.close}
      onClick={(e) => {
        if (e.target === e.currentTarget) cart.close()
      }}
    >
      <div className="ticket__paper">
        <div className="ticket__head">
          <Image src="/brand/medallion-520.webp" alt="" width={520} height={526} />
          <h2 className="display ticket__title" id={`${id}-title`}>
            {t.ticket.title}
          </h2>
          <button type="button" className="ticket__close" onClick={cart.close} aria-label={t.menu.close}>
            <IconClose />
          </button>
        </div>

        <div className="ticket__body">
          {cart.lines.length === 0 ? (
            <div className="ticket__empty">
              <p>{t.ticket.empty}</p>
              <a className="btn btn--ink" href="#menu" onClick={cart.close}>
                {t.ticket.toMenu}
              </a>
            </div>
          ) : (
            <>
              <ul className="lines">
                {cart.lines.map((l) => (
                  <li className="line" key={l.id}>
                    <span className="line__name">{l.dish.name}</span>
                    <div className="stepper" role="group" aria-label={`${t.menu.qty}: ${l.dish.name}`}>
                      <button
                        type="button"
                        onClick={() => cart.set(l.id, l.qty - 1)}
                        aria-label={l.qty === 1 ? t.ticket.remove : t.ticket.less}
                      >
                        <IconMinus />
                      </button>
                      <output>{l.qty}</output>
                      <button type="button" onClick={() => cart.set(l.id, l.qty + 1)} aria-label={t.ticket.more}>
                        <IconPlus />
                      </button>
                    </div>
                    <span className="line__price">{formatPrice(l.qty * l.dish.price)}</span>
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
                {mode === 'delivery' && settings.freeDeliveryFrom && fee > 0 && (
                  <p className="sums__note">{fill(t.ticket.freeFrom, { p: formatPrice(settings.freeDeliveryFrom) })}</p>
                )}
              </div>

              <form className="form" onSubmit={(e) => (e.preventDefault(), sendWa())} noValidate>
                <fieldset className="seg">
                  <legend>{t.ticket.mode}</legend>
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
                  <label htmlFor={`${id}-name`}>{t.ticket.name}</label>
                  <input {...field('name')} autoComplete="name" aria-invalid={tried && missingName} />
                </div>
                <div className="field">
                  <label htmlFor={`${id}-phone`}>{t.ticket.phone}</label>
                  <input
                    {...field('phone')}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+374"
                    aria-invalid={tried && missingPhone}
                  />
                </div>
                {mode === 'delivery' && (
                  <div className="field">
                    <label htmlFor={`${id}-address`}>{t.ticket.address}</label>
                    <input {...field('address')} autoComplete="street-address" aria-invalid={tried && missingAddr} />
                  </div>
                )}
                <div className="field">
                  <label htmlFor={`${id}-note`}>{t.ticket.note}</label>
                  <textarea {...field('note')} placeholder={t.ticket.notePh} />
                </div>
              </form>

              <button type="button" className="ticket__clear" onClick={cart.clear}>
                {t.ticket.clear}
              </button>
            </>
          )}

          {settings.partners.length > 0 && (
            <div>
              <p className="sums__note">{t.ticket.partners}</p>
              <div className="partners" style={{ marginTop: 8 }}>
                {settings.partners.map((p) => (
                  <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer">
                    {p.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {cart.lines.length > 0 && (
          <div className="ticket__foot">
            <p className="ticket__msg" role="status" data-kind={msg?.kind}>
              {msg?.text}
            </p>
            {settings.whatsapp && (
              <button type="button" className="btn btn--red" onClick={sendWa}>
                <IconWhatsapp /> {t.ticket.sendWa}
              </button>
            )}
            {settings.telegram && (
              <button type="button" className="btn btn--ink" onClick={sendTg}>
                <IconTelegram /> {t.ticket.sendTg}
              </button>
            )}
            <a className="btn btn--ghost" href={phoneHref}>
              <IconPhone /> {t.ticket.call}
            </a>
          </div>
        )}
      </div>
    </dialog>
  )
}
