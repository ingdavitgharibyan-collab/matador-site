/** Fire-and-forget funnel event (no cookies, nothing personal). Each event counts once per page load. */
const sent = new Set<string>()
export function track(e: string, once = true) {
  if (typeof window === 'undefined') return
  if (once && sent.has(e)) return
  sent.add(e)
  const l = document.documentElement.lang
  try {
    navigator.sendBeacon?.('/m', JSON.stringify({ e, l }))
  } catch {}
}
