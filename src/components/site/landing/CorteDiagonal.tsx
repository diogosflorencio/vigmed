'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Corte diagonal estilo ExoApe: painéis se abrem e o conteúdo surge no centro. */
export function CorteDiagonal() {
  const wrapRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduzido) {
      wrap.classList.add('is-aberto')
      return
    }

    const painelA = wrap.querySelector<HTMLElement>('.vm-slash-a')
    const painelB = wrap.querySelector<HTMLElement>('.vm-slash-b')
    const palavra = wrap.querySelector<HTMLElement>('.vm-slash-word')
    const revelado = wrap.querySelector<HTMLElement>('.vm-slash-core')
    if (!painelA || !painelB || !palavra || !revelado) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 900px)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: '+=160%',
          pin: true,
          scrub: 1.15,
          anticipatePin: 1,
        },
      })

      tl.to(painelA, { xPercent: -55, yPercent: -45, ease: 'none' }, 0)
        .to(painelB, { xPercent: 55, yPercent: 45, ease: 'none' }, 0)
        .to(palavra, { scale: 1.35, opacity: 0, filter: 'blur(8px)', ease: 'none' }, 0)
        .fromTo(
          revelado,
          { opacity: 0, scale: 0.88, y: 40 },
          { opacity: 1, scale: 1, y: 0, ease: 'none' },
          0.25,
        )
    })

    /* Mobile: sem pin longo; scrub leve para transição suave entre seções */
    mm.add('(max-width: 899px)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: 'top 75%',
          end: 'bottom 35%',
          scrub: 0.85,
        },
      })

      tl.fromTo(
        painelA,
        { xPercent: 0, yPercent: 0 },
        { xPercent: -38, yPercent: -32, ease: 'none' },
        0,
      )
        .fromTo(
          painelB,
          { xPercent: 0, yPercent: 0 },
          { xPercent: 38, yPercent: 32, ease: 'none' },
          0,
        )
        .fromTo(
          palavra,
          { scale: 1, opacity: 1, filter: 'blur(0px)' },
          { scale: 1.15, opacity: 0, filter: 'blur(6px)', ease: 'none' },
          0,
        )
        .fromTo(
          revelado,
          { opacity: 0, y: 28, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, ease: 'none' },
          0.2,
        )
    })

    return () => mm.revert()
  }, [])

  return (
    <section ref={wrapRef} className="vm-slash" aria-label="VIGMED">
      <div className="vm-slash-stage">
        <div className="vm-slash-a" aria-hidden />
        <div className="vm-slash-b" aria-hidden />

        <p className="vm-slash-word" aria-hidden>
          VIGMED
        </p>

        <div className="vm-slash-core">
          <span className="vm-eyebrow">Operação conectada</span>
          <h2>
            Saúde ocupacional
            <br />
            no centro da empresa.
          </h2>
          <p>
            Clínica, conformidade e portal digital em uma rede só. Cada laudo, comunicado e
            acesso no lugar certo.
          </p>
          <a href="#empresas" className="vm-btn vm-btn--ink vm-btn--lg">
            Ver área do cliente
          </a>
        </div>
      </div>
    </section>
  )
}
