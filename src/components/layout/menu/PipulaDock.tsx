'use client'

import { useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

const AFASTAMENTO_PIPULA = 28

interface Props {
  texto: string
  children: (props: {
    ref: (node: HTMLElement | null) => void
    onMouseEnter: () => void
    onMouseLeave: () => void
    onFocus: () => void
    onBlur: () => void
  }) => ReactNode
}

/** Rótulo em pílula acima da barra do dock, alinhado ao botão */
export function PipulaDock({ texto, children }: Props) {
  const alvoRef = useRef<HTMLElement | null>(null)
  const [visivel, definirVisivel] = useState(false)
  const [coords, definirCoords] = useState({ x: 0, y: 0 })

  function mostrar() {
    const el = alvoRef.current
    if (!el) return
    const item = el.getBoundingClientRect()
    const dock = el.closest('.menu-dock-inner')?.getBoundingClientRect()
    const topoDock = dock?.top ?? item.top
    definirCoords({
      x: item.left + item.width / 2,
      y: topoDock - AFASTAMENTO_PIPULA,
    })
    definirVisivel(true)
  }

  function esconder() {
    definirVisivel(false)
  }

  return (
    <>
      {children({
        ref: (node) => {
          alvoRef.current = node
        },
        onMouseEnter: mostrar,
        onMouseLeave: esconder,
        onFocus: mostrar,
        onBlur: esconder,
      })}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {visivel && (
              <motion.span
                key={texto}
                className="menu-dock-pipula"
                style={{ left: coords.x, top: coords.y }}
                initial={{ opacity: 0, y: 6, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 4, x: '-50%' }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                role="tooltip"
              >
                {texto}
              </motion.span>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}
