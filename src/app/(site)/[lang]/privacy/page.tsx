import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { LegalPage } from '@/components/LegalPage'
import { getSettings } from '@/lib/data'
import { getDict, hasLocale } from '@/lib/i18n'
import { privacy } from '@/lib/legal'

export const revalidate = 300

export async function generateMetadata({ params }: PageProps<'/[lang]/privacy'>): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const t = getDict(lang)
  return { title: `${t.footer.privacy} · Matador`, alternates: { canonical: `/${lang}/privacy` } }
}

export default async function Page({ params }: PageProps<'/[lang]/privacy'>) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const t = getDict(lang)
  const s = await getSettings(lang)
  return <LegalPage lang={lang} doc={privacy(lang, s)} back={t.qr.back} />
}
