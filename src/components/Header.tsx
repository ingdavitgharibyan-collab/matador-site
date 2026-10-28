'use client'

import Image from 'next/image'

import { type Dict, type Locale, localeLong, localeNames, locales } from '@/lib/i18n'
import { useCart } from './cart'
import { IconTicket } from './icons'

export function Header({ t, locale }: { t: Dict; locale: Locale }) {
  const cart = useCart()
  return (
    <header className="header">
      <a className="header__brand" href={`/${locale}`}>
        <Image src="/brand/bull-520.webp" alt="" width={520} height={512} priority />
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
