'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ArrowRight, Bell, FileText, WarningCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface ChipBanner {
  rotulo: string
  valor: string | number
  tom?: 'neutro' | 'sinal' | 'alerta' | 'risco'
  href?: string
}

interface Props {
  kicker: string
  titulo: string
  texto: string
  chips?: ChipBanner[]
  cta?: { rotulo: string; href: string }
  className?: string
}

/** Banner de contexto do painel, alinhado à linguagem visual da landing. */
export function BannerPainel({ kicker, titulo, texto, chips = [], cta, className }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const partes = el.querySelectorAll('[data-banner-parte]')
    const ctx = gsap.context(() => {
      gsap.from(partes, {
        opacity: 0,
        y: 18,
        duration: 0.7,
        stagger: 0.07,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
      })
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className={cn('vm-banner', className)} aria-label={kicker}>
      <div className="vm-banner-glow" aria-hidden />
      <div className="vm-banner-corpo">
        <p className="vm-banner-kicker" data-banner-parte>
          {kicker}
        </p>
        <h2 className="vm-banner-titulo" data-banner-parte>
          {titulo}
        </h2>
        <p className="vm-banner-texto" data-banner-parte>
          {texto}
        </p>

        {chips.length > 0 && (
          <div className="vm-banner-chips" data-banner-parte>
            {chips.map((chip) => {
              const classe = cn('vm-banner-chip', `vm-banner-chip--${chip.tom ?? 'neutro'}`)
              const conteudo = (
                <>
                  <ChipIcone tom={chip.tom} />
                  <span className="vm-banner-chip-valor">{chip.valor}</span>
                  <span className="vm-banner-chip-rotulo">{chip.rotulo}</span>
                </>
              )
              if (chip.href) {
                return (
                  <Link key={chip.rotulo} href={chip.href} className={classe}>
                    {conteudo}
                  </Link>
                )
              }
              return (
                <span key={chip.rotulo} className={classe}>
                  {conteudo}
                </span>
              )
            })}
          </div>
        )}

        {cta && (
          <div data-banner-parte>
            <Link href={cta.href} className="vm-banner-cta">
              {cta.rotulo}
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

function ChipIcone({ tom }: { tom?: ChipBanner['tom'] }) {
  const props = { size: 14 as const, weight: 'bold' as const }
  if (tom === 'alerta' || tom === 'risco') return <WarningCircle {...props} />
  if (tom === 'sinal') return <Bell {...props} />
  return <FileText {...props} />
}
