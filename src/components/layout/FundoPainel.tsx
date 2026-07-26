'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/** Fundo do painel - malha de quadrados pequenos, gradiente esquerda→direita, parallax leve */
export function FundoPainel() {
  const reduzirMovimento = useReducedMotion()
  const [desloc, definirDesloc] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (reduzirMovimento) return

    const aoMover = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      definirDesloc({ x: nx * 16, y: ny * 12 })
    }

    window.addEventListener('mousemove', aoMover, { passive: true })
    return () => window.removeEventListener('mousemove', aoMover)
  }, [reduzirMovimento])

  return (
    <div className="app-shell-fundo" aria-hidden>
      <div
        className="painel-fundo-parallax"
        style={{
          transform: `translate3d(${desloc.x}px, ${desloc.y}px, 0)`,
        }}
      >
        <div className="painel-fundo-malha painel-fundo-malha--grade" />
      </div>
      <div className="painel-fundo-velo" />
    </div>
  )
}
