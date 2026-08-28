'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'

interface Props {
  valor: number
  sufixo?: string
  prefixo?: string
  duracao?: number
}

/** Contador numérico animado ao entrar na viewport */
export function ContadorAnimado({ valor, sufixo = '', prefixo = '', duracao = 2 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const visivel = useInView(ref, { once: true, margin: '-40px' })
  const alvo = useMotionValue(0)
  const spring = useSpring(alvo, { duration: duracao * 1000, bounce: 0 })
  const [atual, definirAtual] = useState(0)

  useEffect(() => {
    if (visivel) alvo.set(valor)
  }, [visivel, valor, alvo])

  useEffect(() => {
    return spring.on('change', (v) => definirAtual(Math.round(v)))
  }, [spring])

  return (
    <span ref={ref}>
      {prefixo}
      {atual}
      {sufixo}
    </span>
  )
}
