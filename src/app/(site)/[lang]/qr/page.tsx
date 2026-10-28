import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'

import { PrintButton } from '@/components/PrintButton'
import { getDict, hasLocale } from '@/lib/i18n'
import { siteUrl } from '@/lib/url'

export const metadata: Metadata = { robots: { index: false } }

/** A printable table card: the QR opens this language's menu. */
export default async function QrPage({ params }: PageProps<'/[lang]/qr'>) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const t = getDict(lang)
  const url = `${siteUrl()}/${lang}#menu`
  const svg = await QRCode.toString(url, { type: 'svg', margin: 0, color: { dark: '#120d0b', light: '#f4eee3' } })
  return (
    <main className="qr">
      <div className="qr__card">
        <Image className="qr__logo" src="/brand/logo-720.webp" alt="Matador" width={720} height={604} priority />
        <h1 className="display qr__title">{t.qr.title}</h1>
        <p>{t.qr.lead}</p>
        <div className="qr__code" role="img" aria-label={url} dangerouslySetInnerHTML={{ __html: svg }} />
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
