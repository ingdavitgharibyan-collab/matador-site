import { revalidatePath } from 'next/cache'

/**
 * Content edits show on the site on the next request instead of after the 60 s ISR window: a sold-out dish,
 * a new price or a deleted photo must not linger. Outside the Next server (seed scripts) this is a no-op.
 */
export function revalidateSite() {
  try {
    for (const lang of ['hy', 'ru', 'en']) {
      revalidatePath(`/${lang}`)
      revalidatePath(`/${lang}/qr`)
    }
  } catch {
    // not running inside Next (CLI / seed)
  }
}

export const revalidateAfterChange = () => {
  revalidateSite()
}
export const revalidateAfterDelete = () => {
  revalidateSite()
}
