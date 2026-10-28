import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { LegalPage } from '@/components/LegalPage'
import { getSettings } from '@/lib/data'
import { getDict, hasLocale } from '@/lib/i18n'
import { terms } from '@/lib/legal'

export const revalidate = 300

export async function generateMetadata({ params }: PageProps<'/[lang]/terms'>): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const t = getDict(lang)
  return { title: `${t.footer.terms} · Matador`, alternates: { canonical: `/${lang}/terms` } }
}

export default async function Page({ params }: PageProps<'/[lang]/terms'>) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const t = getDict(lang)
  const s = await getSettings(lang)
  return <LegalPage lang={lang} doc={terms(lang, s, t.ticket.pay)} back={t.qr.back} />
}
