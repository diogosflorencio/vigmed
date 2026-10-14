'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'

interface Item {
  pergunta: string
  resposta: string
}

interface Props {
  itens: Item[]
}

const HOLD_MS = 2600
const AVANCAR_MS = 220
const IDLE_RETOMAR_MS = 4500

/** FAQ slider infinito; no mobile continua animando e pausa com o dedo. */
export function FaqAnimado({ itens }: Props) {
  const [ativo, setAtivo] = useState(0)
  const [pausado, setPausado] = useState(false)
  const [mobile, setMobile] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLElement | null)[]>([])
  const painelRefs = useRef<(HTMLDivElement | null)[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const pausadoRef = useRef(false)
  const ativoRef = useRef(0)
  const autoScrollRef = useRef(false)
  const idleTimerRef = useRef<number | null>(null)
  const mobileLoopRef = useRef<number | null>(null)

  pausadoRef.current = pausado

  function yDoItem(i: number) {
    const viewport = viewportRef.current
    const item = itemRefs.current[i]
    if (!viewport || !item) return 0
    return -item.offsetTop + Math.max(10, viewport.clientHeight * 0.06)
  }

  function marcarAtivo(i: number) {
    ativoRef.current = i
    setAtivo(i)
    itemRefs.current.forEach((el, j) => {
      if (!el) return
      const dist = Math.min(Math.abs(j - i), itens.length - Math.abs(j - i))
      el.classList.toggle('is-open', j === i)
      el.classList.toggle('is-near', dist === 1)
    })
  }

  function abrirSomente(i: number, instantaneo = false) {
    painelRefs.current.forEach((painel, j) => {
      if (!painel) return
      gsap.to(painel, {
        height: j === i ? 'auto' : 0,
        opacity: j === i ? 1 : 0,
        duration: instantaneo ? 0 : 0.45,
        ease: 'power3.out',
        overwrite: true,
      })
    })
  }

  function fecharItem(i: number) {
    const painel = painelRefs.current[i]
    if (!painel) return Promise.resolve()
    return new Promise<void>((resolve) => {
      gsap.to(painel, {
        height: 0,
        opacity: 0,
        duration: 0.45,
        ease: 'power2.inOut',
        overwrite: true,
        onComplete: () => resolve(),
      })
    })
  }

  function scrollPara(i: number) {
    const el = itemRefs.current[i]
    const viewport = viewportRef.current
    if (!el || !viewport) return
    autoScrollRef.current = true
    // Só move o container do FAQ, nunca a página
    viewport.scrollTo({
      top: Math.max(0, el.offsetTop - 8),
      behavior: 'smooth',
    })
    window.setTimeout(() => {
      autoScrollRef.current = false
    }, 700)
  }

  function pausarPorInteracao() {
    setPausado(true)
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current)
    idleTimerRef.current = window.setTimeout(() => {
      setPausado(false)
    }, IDLE_RETOMAR_MS)
  }

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 959px)')
    const sync = () => setMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  /* ===== Desktop: timeline automática ===== */
  useEffect(() => {
    if (mobile) return

    const viewport = viewportRef.current
    const track = trackRef.current
    const cabeca = document.querySelector<HTMLElement>('[data-faq-altura]')
    if (!viewport || !track || !cabeca || itens.length === 0) return

    const syncAltura = () => {
      const h = Math.ceil(cabeca.getBoundingClientRect().height)
      viewport.style.height = `${Math.max(h, 280)}px`
      gsap.set(track, { y: yDoItem(ativoRef.current) })
      tlRef.current?.invalidate()
    }

    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    painelRefs.current.forEach((painel) => {
      if (painel) gsap.set(painel, { height: 0, opacity: 0 })
    })

    syncAltura()
    marcarAtivo(0)

    if (reduzido) {
      abrirSomente(0, true)
      const ro = new ResizeObserver(syncAltura)
      ro.observe(cabeca)
      window.addEventListener('resize', syncAltura)
      return () => {
        ro.disconnect()
        window.removeEventListener('resize', syncAltura)
      }
    }

    const tl = gsap.timeline({
      repeat: -1,
      paused: pausadoRef.current,
    })

    itens.forEach((_, i) => {
      const painel = painelRefs.current[i]
      if (!painel) return

      tl.call(() => marcarAtivo(i))

      tl.to(track, {
        y: () => yDoItem(i),
        duration: 0.8,
        ease: 'power3.inOut',
      })

      tl.to(painel, {
        height: 'auto',
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
        onUpdate: () => {
          gsap.set(track, { y: yDoItem(i) })
        },
      })

      tl.to({}, { duration: 2.6 })

      tl.to(painel, {
        height: 0,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
        onUpdate: () => {
          gsap.set(track, { y: yDoItem(i) })
        },
      })

      tl.to({}, { duration: 0.18 })
    })

    tlRef.current = tl

    const ro = new ResizeObserver(syncAltura)
    ro.observe(cabeca)
    window.addEventListener('resize', syncAltura)

    return () => {
      tl.kill()
      tlRef.current = null
      ro.disconnect()
      window.removeEventListener('resize', syncAltura)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itens, mobile])

  useEffect(() => {
    if (mobile) return
    const tl = tlRef.current
    if (!tl) return
    if (pausado) tl.pause()
    else tl.play()
  }, [pausado, mobile])

  /* ===== Mobile: autoplay + scroll por dedo ===== */
  useEffect(() => {
    if (!mobile) return

    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track || itens.length === 0) return

    gsap.set(track, { clearProps: 'transform' })
    viewport.style.height = ''
    marcarAtivo(0)
    abrirSomente(0, true)

    const onScroll = () => {
      if (autoScrollRef.current) return
      pausarPorInteracao()

      const meio = viewport.scrollTop + viewport.clientHeight * 0.35
      let melhor = 0
      let melhorDist = Infinity
      itemRefs.current.forEach((el, i) => {
        if (!el) return
        const centro = el.offsetTop + el.offsetHeight * 0.35
        const dist = Math.abs(centro - meio)
        if (dist < melhorDist) {
          melhorDist = dist
          melhor = i
        }
      })
      if (melhor !== ativoRef.current) {
        marcarAtivo(melhor)
        abrirSomente(melhor, false)
      }
    }

    const onTouch = () => pausarPorInteracao()

    viewport.addEventListener('scroll', onScroll, { passive: true })
    viewport.addEventListener('touchstart', onTouch, { passive: true })

    return () => {
      viewport.removeEventListener('scroll', onScroll)
      viewport.removeEventListener('touchstart', onTouch)
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobile, itens])

  useEffect(() => {
    if (!mobile) return
    if (pausado) {
      if (mobileLoopRef.current) {
        window.clearTimeout(mobileLoopRef.current)
        mobileLoopRef.current = null
      }
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelado = false

    const ciclo = async () => {
      while (!cancelado && !pausadoRef.current) {
        const i = ativoRef.current
        marcarAtivo(i)
        abrirSomente(i, false)
        scrollPara(i)

        await esperar(HOLD_MS)
        if (cancelado || pausadoRef.current) break

        await fecharItem(i)
        if (cancelado || pausadoRef.current) break
        await esperar(AVANCAR_MS)

        const next = (i + 1) % itens.length
        marcarAtivo(next)
        scrollPara(next)
        await esperar(380)
      }
    }

    void ciclo()

    return () => {
      cancelado = true
      if (mobileLoopRef.current) {
        window.clearTimeout(mobileLoopRef.current)
        mobileLoopRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobile, pausado, itens.length])

  function esperar(ms: number) {
    return new Promise<void>((resolve) => {
      mobileLoopRef.current = window.setTimeout(() => {
        mobileLoopRef.current = null
        resolve()
      }, ms)
    })
  }

  function aoEscolher(i: number) {
    pausarPorInteracao()
    marcarAtivo(i)
    abrirSomente(i, false)

    if (mobile) {
      scrollPara(i)
      return
    }

    const track = trackRef.current
    if (!track) return
    gsap.to(track, {
      y: () => yDoItem(i),
      duration: 0.65,
      ease: 'power3.inOut',
      overwrite: 'auto',
      onUpdate: () => gsap.set(track, { y: yDoItem(i) }),
    })
  }

  return (
    <div
      className={cn('vm-faq-slider', pausado && 'is-paused', mobile && 'is-mobile')}
      onMouseEnter={() => !mobile && setPausado(true)}
      onMouseLeave={() => !mobile && setPausado(false)}
      onFocusCapture={() => !mobile && setPausado(true)}
      onBlurCapture={(e) => {
        if (mobile) return
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPausado(false)
      }}
    >
      <div className="vm-faq-slider-viewport" ref={viewportRef} aria-live="polite">
        <div className="vm-faq-slider-track" ref={trackRef}>
          {itens.map((item, i) => (
            <article
              key={item.pergunta}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              className={cn('vm-faq-exo-item', ativo === i && 'is-open')}
            >
              <button
                type="button"
                className="vm-faq-exo-trigger"
                aria-expanded={ativo === i}
                onClick={() => aoEscolher(i)}
              >
                <span className="vm-faq-exo-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="vm-faq-exo-q">{item.pergunta}</span>
                <span className="vm-faq-exo-icone" aria-hidden>
                  <span />
                  <span />
                </span>
              </button>
              <div
                ref={(el) => {
                  painelRefs.current[i] = el
                }}
                className="vm-faq-exo-painel"
                style={{ height: 0, opacity: 0, overflow: 'hidden' }}
              >
                <p>{item.resposta}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {!mobile && (
        <div className="vm-faq-slider-dots" role="tablist" aria-label="Perguntas">
          {itens.map((item, i) => (
            <button
              key={item.pergunta}
              type="button"
              role="tab"
              aria-selected={ativo === i}
              className={cn('vm-faq-slider-dot', ativo === i && 'is-on')}
              onClick={() => aoEscolher(i)}
              aria-label={`Pergunta ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
