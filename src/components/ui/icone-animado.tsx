'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  ICONES_ANIMADOS,
  ICONES_ESTATICOS,
  type EntradaIconeAnimado,
  type NomeIcone,
} from '@/lib/icones-animados'
import type { IconHandle } from '@animateicons/react'

const SELETOR_HOVER_PAI =
  'a, button, label, summary, [role="button"], [data-grupo-icone], .grupo-icone'

interface PropsIconeAnimado {
  nome: NomeIcone
  tamanho?: number
  className?: string
  /** false desliga animação */
  animar?: boolean
}

interface PropsIconeAnimadoDireto {
  entrada: EntradaIconeAnimado
  tamanho?: number
  className?: string
  animar?: boolean
}

/** Ícone @animateicons/react — anima ao hover/foco no ícone ou no ancestral interativo */
export function IconeAnimado({ nome, tamanho = 16, className, animar = true }: PropsIconeAnimado) {
  const entrada = ICONES_ANIMADOS[nome]
  return <IconeAnimadoEntrada entrada={entrada} tamanho={tamanho} className={className} animar={animar} />
}

export function IconeAnimadoEntrada({ entrada, tamanho = 16, className, animar = true }: PropsIconeAnimadoDireto) {
  const reduzir = useReducedMotion()
  const usarAnimacao = animar && !reduzir
  const iconeRef = useRef<IconHandle>(null)
  const ancoraRef = useRef<HTMLSpanElement>(null)
  const Animado = entrada.componente

  useEffect(() => {
    if (!usarAnimacao) return

    const ancora = ancoraRef.current
    if (!ancora) return

    const alvo = (ancora.closest(SELETOR_HOVER_PAI) as HTMLElement | null) ?? ancora.parentElement
    if (!alvo) return

    const animarIcone = () => iconeRef.current?.startAnimation()
    const pararIcone = () => iconeRef.current?.stopAnimation()

    alvo.addEventListener('mouseenter', animarIcone)
    alvo.addEventListener('mouseleave', pararIcone)
    alvo.addEventListener('focusin', animarIcone)
    alvo.addEventListener('focusout', pararIcone)

    return () => {
      alvo.removeEventListener('mouseenter', animarIcone)
      alvo.removeEventListener('mouseleave', pararIcone)
      alvo.removeEventListener('focusin', animarIcone)
      alvo.removeEventListener('focusout', pararIcone)
    }
  }, [usarAnimacao])

  return (
    <span ref={ancoraRef} className={cn('inline-flex shrink-0', className)} aria-hidden>
      <Animado
        ref={iconeRef}
        size={tamanho}
        color="currentColor"
        isAnimated={false}
      />
    </span>
  )
}

/** Fallback estático - lucide-react */
export function IconeEstatico({ nome, tamanho = 16, className }: Omit<PropsIconeAnimado, 'animar'>) {
  const Estatico = ICONES_ESTATICOS[nome]
  return (
    <span className={cn('inline-flex shrink-0', className)} aria-hidden>
      <Estatico size={tamanho} strokeWidth={1.75} />
    </span>
  )
}
