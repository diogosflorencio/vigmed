'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'

/** Entrada suave da página do painel, no ritmo da landing. */
export function AnimacaoPaginaPainel({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
      )
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className="vm-pagina-painel">
      {children}
    </div>
  )
}
