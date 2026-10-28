'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { useEffect } from 'react'

gsap.registerPlugin(ScrollTrigger, SplitText)

/**
 * The motion layer. Content is visible without it; everything here starts from the rendered state.
 * One authored moment (the cape crossing the hero on load), entrances per section, scroll-linked
 * pictures. Nothing runs under prefers-reduced-motion.
 */
export function Motion() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, anchors: { offset: -64 } })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // dialogs stop the page from scrolling underneath
    const syncLock = () => (document.querySelector('dialog[open]') ? lenis.stop() : lenis.start())
    const mo = new MutationObserver(syncLock)
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] })

    let split: SplitText | null = null
    const ctx = gsap.context(() => {
      // ---- the signature: the muleta crosses the hero, the title and the logo arrive behind it
      const cape = document.querySelector<HTMLElement>('.hero > .cape')
      const title = document.querySelector<HTMLElement>('.hero__title')
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      if (cape) {
        intro
          .set(cape, { visibility: 'visible', xPercent: -110 })
          .to(cape, { xPercent: 115, duration: 1.25, ease: 'power2.inOut' }, 0)
          .set(cape, { visibility: 'hidden' })
      }
      intro.from('.hero__logo', { scale: 0.9, rotate: -4, opacity: 0, duration: 1.1 }, 0.35)
      if (title) {
        document.fonts.ready.then(() => {
          split = SplitText.create(title, { type: 'lines', mask: 'lines' })
          gsap.from(split.lines, { yPercent: 105, duration: 0.9, stagger: 0.09, ease: 'power4.out', delay: 0.45 })
        })
      }
      intro.from('.hero__lead, .hero__actions > *, .hero__status', { y: 22, opacity: 0, duration: 0.7, stagger: 0.08 }, 0.7)

      // hero logo drifts as the page scrolls away from it
      gsap.to('.hero__logo', {
        yPercent: 14,
        rotate: 3,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      })

      // ---- entrances: heading, then text, then picture, once per section
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((group) => {
        const parts = group.querySelectorAll(':scope > *')
        gsap.from(parts, {
          y: 28,
          opacity: 0,
          duration: 0.8,
          stagger: 0.075,
          ease: 'power3.out',
          scrollTrigger: { trigger: group, start: 'top 82%', once: true },
        })
      })

      // dishes of the first act rise in a row
      gsap.from('.menu [role="tabpanel"]:not([hidden]) .dish', {
        y: 36,
        opacity: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.menu__stage', start: 'top 80%', once: true },
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
      split?.revert()
      mo.disconnect()
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])
  return null
}
