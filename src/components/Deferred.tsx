'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'

/*
 * Not needed for the first screen: smooth scroll + scroll animations (GSAP, Lenis) and the ticket drawer load
 * after the page is interactive, so a slow phone can tap "Add" sooner.
 */
export const LazyMotion = dynamic(() => import('./Motion').then((m) => m.Motion), { ssr: false })
export const LazyTicket = dynamic(() => import('./Ticket').then((m) => m.Ticket), { ssr: false })

/** Offline menu + "add to home screen": the service worker registers after the page is idle. */
export function RegisterSW() {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') return
    const go = () => navigator.serviceWorker.register('/sw.js').catch(() => {})
    if ('requestIdleCallback' in window) requestIdleCallback(go)
    else setTimeout(go, 2000)
  }, [])
  return null
}
