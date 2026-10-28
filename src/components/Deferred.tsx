'use client'

import dynamic from 'next/dynamic'

/*
 * Not needed for the first screen: smooth scroll + scroll animations (GSAP, Lenis) and the ticket drawer load
 * after the page is interactive, so a slow phone can tap "Add" sooner.
 */
export const LazyMotion = dynamic(() => import('./Motion').then((m) => m.Motion), { ssr: false })
export const LazyTicket = dynamic(() => import('./Ticket').then((m) => m.Ticket), { ssr: false })
