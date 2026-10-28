'use client'

import { useRowLabel, useTranslation } from '@payloadcms/ui'

const DAYS: Record<string, string[]> = {
  hy: ['Երկուշաբթի', 'Երեքշաբթի', 'Չորեքշաբթի', 'Հինգշաբթի', 'Ուրբաթ', 'Շաբաթ', 'Կիրակի'],
  ru: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
  en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
}

/** Opening-hours rows read as weekdays instead of "Hour 01…07". */
export function DayRowLabel() {
  const { rowNumber, data } = useRowLabel<{ open?: string; close?: string; closed?: boolean }>()
  const { i18n } = useTranslation()
  const day = (DAYS[i18n.language] ?? DAYS.en)[rowNumber ?? 0] ?? ''
  const time = data?.closed ? '—' : data?.open && data?.close ? `${data.open}–${data.close}` : ''
  return (
    <span>
      {day} {time && <span style={{ opacity: 0.7 }}>{time}</span>}
    </span>
  )
}
