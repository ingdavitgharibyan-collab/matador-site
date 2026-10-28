import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'

import { PrintButton } from '@/components/PrintButton'
import { fill, getDict, hasLocale } from '@/lib/i18n'
import { siteUrl } from '@/lib/url'

export const metadata: Metadata = { robots: { index: false } }

/**
 * A printable table card: the QR opens this language's menu. /hy/qr?table=5 prints the card for table 5;
 * scanning it puts the ticket in "Table 5" mode (no address, no delivery fee).
 */
export default async function QrPage({ params, searchParams }: PageProps<'/[lang]/qr'>) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const t = getDict(lang)
  const raw = (await searchParams).table
  const table = typeof raw === 'string' && /^\d{1,3}$/.test(raw) ? raw : ''
  const url = `${siteUrl()}/${lang}?${table ? `table=${table}&` : ''}utm_source=qr#menu`
  const shown = siteUrl().replace(/^https?:\/\//, '')
  const svg = await QRCode.toString(url, { type: 'svg', margin: 0, color: { dark: '#120d0b', light: '#f4eee3' } })
  return (
    <main className="qr">
      <div className="qr__card">
        <Image className="qr__logo" src="/brand/logo-720.webp" alt="Matador" width={720} height={604} preload />
        <h1 className="display qr__title">{table ? fill(t.ticket.modeTable, { n: table }) : t.qr.title}</h1>
        <p>{t.qr.lead}</p>
        <div className="qr__code" role="img" aria-label={url} dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="qr__url">{shown}</p>
        <div className="qr__actions">
          <PrintButton label={t.qr.print} />
          <a className="btn btn--ghost" href={`/${lang}`}>
            {t.qr.back}
          </a>
        </div>
      </div>
    </main>
  )
}
