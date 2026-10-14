'use client'

import { useEffect, type ReactNode } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Lenis + GSAP: autoridade única de scroll (padrão lenis-gsap-lab). */
export function ScrollSuave({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduzido) {
      gsap.set('.vm-reveal', { clearProps: 'all', opacity: 1, y: 0 })
      return
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)

    const ticker = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(ticker)
    gsap.ticker.lagSmoothing(0)

    const ctx = gsap.context(() => {
      const mobile = window.matchMedia('(max-width: 899px)').matches

      const heroInner = document.querySelector<HTMLElement>('.vm-hero-inner')
      if (heroInner) {
        gsap.fromTo(
          heroInner.children,
          { opacity: 0, y: mobile ? 22 : 32 },
          {
            opacity: 1,
            y: 0,
            duration: mobile ? 0.75 : 0.95,
            stagger: mobile ? 0.07 : 0.1,
            ease: 'power3.out',
            delay: 0.12,
          },
        )
      }

      gsap.utils.toArray<HTMLElement>('.vm-reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: mobile ? 28 : 40 },
          {
            opacity: 1,
            y: 0,
            duration: mobile ? 0.8 : 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: mobile ? 'top 92%' : 'top 88%',
              toggleActions: 'play none none none',
            },
          },
        )
      })

      if (mobile) {
        gsap.utils.toArray<HTMLElement>('.vm-diff article').forEach((el, i) => {
          gsap.fromTo(
            el.querySelector('.vm-diff-ico'),
            { scale: 0.85, opacity: 0.4 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.55,
              delay: 0.05 + i * 0.04,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 92%',
                toggleActions: 'play none none none',
              },
            },
          )
        })

        gsap.utils.toArray<HTMLElement>('.vm-secao, .vm-portal-bleed, .vm-svc-pin').forEach((sec) => {
          const eyebrow = sec.querySelector<HTMLElement>('.vm-eyebrow')
          if (!eyebrow || eyebrow.closest('.vm-svc-cabeca')) return
          gsap.fromTo(
            eyebrow,
            { opacity: 0, letterSpacing: '0.28em' },
            {
              opacity: 1,
              letterSpacing: '0.14em',
              duration: 0.7,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: eyebrow,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            },
          )
        })
      }

      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const alvo = Number(el.dataset.count || 0)
        const obj = { val: 0 }
        const noHero = Boolean(el.closest('.vm-hero'))
        gsap.to(obj, {
          val: alvo,
          duration: 1.8,
          delay: noHero ? 0.45 : 0,
          ease: 'power2.out',
          ...(noHero
            ? {}
            : {
                scrollTrigger: {
                  trigger: el,
                  start: 'top 90%',
                  toggleActions: 'play none none none',
                },
              }),
          onUpdate: () => {
            el.textContent = Math.round(obj.val).toString()
          },
        })
      })
    })

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      ctx.revert()
      gsap.ticker.remove(ticker)
      lenis.destroy()
      delete (window as unknown as { __lenis?: Lenis }).__lenis
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return <>{children}</>
}
