'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { IconProps } from '@phosphor-icons/react'
import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

export interface ItemServicoTrilha {
  titulo: string
  descricao: string
  tag: string
  icone: ComponentType<IconProps>
}

interface Props {
  itens: ItemServicoTrilha[]
}

/** Trilha horizontal pinada (padrão ExoApe / GSAP labs): um serviço dissolve no seguinte. */
export function ServicosTrilha({ itens }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const track = trackRef.current
    if (!wrap || !track) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const getX = () => -(track.scrollWidth - window.innerWidth)

      const tween = gsap.to(track, {
        x: getX,
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: () => `+=${track.scrollWidth - window.innerWidth + 200}`,
          pin: true,
          scrub: 1.1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      const cards = gsap.utils.toArray<HTMLElement>('.vm-svc-card', track)
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0.35, scale: 0.94 },
          {
            opacity: 1,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: 'left 75%',
              end: 'left 35%',
              scrub: true,
            },
          },
        )
      })

      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    })

    mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
      const cabeca = wrap.querySelector<HTMLElement>('.vm-svc-cabeca')
      if (cabeca) {
        gsap.fromTo(
          cabeca.children,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cabeca,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          },
        )
      }

      const cards = gsap.utils.toArray<HTMLElement>('.vm-svc-card', track)
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 40, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
          },
        )

        const ico = card.querySelector<HTMLElement>('.vm-svc-ico')
        if (ico) {
          gsap.fromTo(
            ico,
            { rotate: -8, scale: 0.9 },
            {
              rotate: 0,
              scale: 1,
              duration: 0.7,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            },
          )
        }
      })
    })

    return () => mm.revert()
  }, [itens.length])

  return (
    <div ref={wrapRef} className="vm-svc-pin">
      <div className="vm-svc-cabeca vm-frame">
        <span className="vm-eyebrow">Serviços</span>
        <h2>Do exame ao portal, em uma linha contínua.</h2>
        <p>Role para avançar. Cada frente se dissolve na próxima.</p>
      </div>

      <div ref={trackRef} className="vm-svc-track">
        {itens.map((item, i) => {
          const Icone = item.icone
          return (
            <article key={item.titulo} className={cn('vm-svc-card', i === 0 && 'is-first')}>
              <div className="vm-svc-card-topo">
                <span className="vm-svc-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="vm-svc-tag">{item.tag}</span>
              </div>
              <span className="vm-svc-ico" aria-hidden>
                <Icone size={42} weight="thin" />
              </span>
              <h3>{item.titulo}</h3>
              <p>{item.descricao}</p>
              <a href="#contato" className="vm-link">
                Falar sobre este serviço
              </a>
            </article>
          )
        })}
      </div>
    </div>
  )
}
