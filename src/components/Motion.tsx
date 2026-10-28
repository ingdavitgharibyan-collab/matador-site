'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useEffect } from 'react'

gsap.registerPlugin(ScrollTrigger)

/**
 * The motion layer. Rule: nothing that is already on screen is ever hidden — the first screen is painted by the
 * server and stays readable and tappable from the first frame. The one authored moment is the muleta crossing
 * the hero *over* the content; the logo settles under it. Below the fold, sections rise in as they arrive.
 * Under prefers-reduced-motion only the dialog scroll lock runs.
 */
export function Motion() {
  useEffect(() => {
    const root = document.documentElement
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let lenis: Lenis | null = null

    // dialogs stop the page from scrolling underneath, with or without smooth scroll
    const syncLock = () => {
      const open = Boolean(document.querySelector('dialog[open]'))
      root.classList.toggle('has-dialog', open)
      if (lenis) open ? lenis.stop() : lenis.start()
    }
    const mo = new MutationObserver(syncLock)
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] })
    if (reduce) return () => mo.disconnect()

    // smooth scroll only where it helps: precise pointers (touch scrolling is already native-smooth)
    const tick = (time: number) => lenis?.raf(time * 1000)
    if (window.matchMedia('(pointer: fine)').matches) {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true, anchors: { offset: -64 } })
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
    }

    const ctx = gsap.context(() => {
      const cape = document.querySelector<HTMLElement>('.hero > .cape')
      if (cape) {
        gsap
          .timeline()
          .set(cape, { visibility: 'visible', xPercent: -110 })
          .to(cape, { xPercent: 115, duration: 0.95, ease: 'power2.inOut' })
          .set(cape, { visibility: 'hidden' })
      }
      gsap.fromTo('.hero__logo', { scale: 0.95, rotate: -3 }, { scale: 1, rotate: 0, duration: 1.1, ease: 'power3.out', delay: 0.25 })

      // hero logo drifts as the page scrolls away from it
      gsap.to('.hero__logo', {
        yPercent: 14,
        rotate: 3,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      })

      // entrances below the fold only: heading, then text, then picture, once per section
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((group) => {
        if (group.getBoundingClientRect().top < window.innerHeight) return
        gsap.from(group.querySelectorAll(':scope > *'), {
          y: 28,
          opacity: 0,
          duration: 0.8,
          stagger: 0.075,
          ease: 'power3.out',
          scrollTrigger: { trigger: group, start: 'top 85%', once: true },
        })
      })

      // each menu category: its dishes rise in a row as it arrives (below the fold only)
      gsap.utils.toArray<HTMLElement>('.menu .cat').forEach((cat) => {
        if (cat.getBoundingClientRect().top < window.innerHeight) return
        gsap.from(cat.querySelectorAll('.dish'), {
          y: 32,
          opacity: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: 'power3.out',
          scrollTrigger: { trigger: cat, start: 'top 88%', once: true },
        })
      })

      // the medallion turns like a coin through the section
      gsap.fromTo(
        '.house__pic img',
        { rotate: -10, scale: 0.94 },
        { rotate: 8, scale: 1, ease: 'none', scrollTrigger: { trigger: '.house', start: 'top bottom', end: 'bottom top', scrub: true } },
      )

      // the name returns at the foot of the page and slides home
      gsap.from('.footer__name', {
        xPercent: 18,
        ease: 'none',
        scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true },
      })
    })

    return () => {
      ctx.revert()
      mo.disconnect()
      gsap.ticker.remove(tick)
      lenis?.destroy()
      root.classList.remove('has-dialog')
    }
  }, [])
  return null
}
