'use client'

import Image from 'next/image'
import { useEffect } from 'react'

import { type Dict, type Locale, localeLong, localeNames, locales } from '@/lib/i18n'
import { track } from '@/lib/track'
import { useCart } from './cart'
import { IconTicket } from './icons'

export function Header({ t, locale }: { t: Dict; locale: Locale }) {
  const cart = useCart()
  const { open } = cart
  // the ticket was tapped before the scripts loaded
  useEffect(() => {
    const w = window as unknown as { __mt?: number }
    if (w.__mt) {
      w.__mt = 0
      open()
    }
  }, [open])
  // calls and delivery-service clicks anywhere on the page count in the funnel
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a')
      if (!a) return
      if (a.getAttribute('href')?.startsWith('tel:')) track('call', false)
      else if (a.closest('.partners')) track('partner', false)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  return (
    <header className="header">
      <a className="header__brand" href={`/${locale}`}>
        <Image src="/brand/bull-520.webp" alt="" width={520} height={512} sizes="40px" loading="eager" />
        <span>{locale === 'hy' ? 'Մատադոր' : locale === 'ru' ? 'Матадор' : 'Matador'}</span>
      </a>
      <nav className="header__nav" aria-label="Main">
        <a href="#menu">{t.nav.menu}</a>
        <a href="#house">{t.nav.house}</a>
        <a href="#visit">{t.nav.visit}</a>
      </nav>
      <nav className="lang" aria-label={t.nav.lang}>
        {locales.map((l) => (
          <a key={l} href={`/${l}`} hrefLang={l} lang={l} aria-current={l === locale} title={localeLong[l]}>
            {localeNames[l]}
          </a>
        ))}
      </nav>
      <button type="button" className="btn btn--red ticket-btn" onClick={cart.open} data-ticket-target>
        <IconTicket />
        <span className="ticket-btn__label">{t.nav.order}</span>
        <span className="ticket-btn__count" aria-live="polite">
          <span className="sr-only">{t.ticket.open}: </span>
          {cart.count}
        </span>
      </button>
    </header>
  )
}
