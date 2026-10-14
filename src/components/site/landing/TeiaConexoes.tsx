'use client'

import { useEffect, useRef } from 'react'

interface No {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

interface Props {
  className?: string
  /** Tema claro: nós mais escuros para contraste no branco */
  claro?: boolean
}

/** Teia de nós e conexões em canvas (inspirada em graph-node animados). */
export function TeiaConexoes({ className, claro = false }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let anim = 0
    let nos: No[] = []
    let w = 0
    let h = 0
    let dpr = 1
    let mouse = { x: -9999, y: -9999 }

    const corNo = claro ? 'rgba(13, 148, 136, 0.7)' : 'rgba(94, 234, 212, 0.9)'
    const corLinha = claro ? 'rgba(13, 148, 136, 0.22)' : 'rgba(94, 234, 212, 0.28)'
    const corLinhaHover = claro ? 'rgba(13, 148, 136, 0.5)' : 'rgba(94, 234, 212, 0.65)'

    function resize() {
      if (!canvas || !ctx) return
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const qtd = Math.round(Math.min(70, Math.max(28, (w * h) / 18000)))
      nos = Array.from({ length: qtd }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1.2 + Math.random() * 1.8,
      }))
    }

    function passo() {
      if (!ctx) return
      ctx.clearRect(0, 0, w, h)

      const distMax = Math.min(160, w * 0.16)

      for (const n of nos) {
        if (!reduzido) {
          n.x += n.vx
          n.y += n.vy
          if (n.x < 0 || n.x > w) n.vx *= -1
          if (n.y < 0 || n.y > h) n.vy *= -1
          n.x = Math.max(0, Math.min(w, n.x))
          n.y = Math.max(0, Math.min(h, n.y))

          const dx = n.x - mouse.x
          const dy = n.y - mouse.y
          const d = Math.hypot(dx, dy)
          if (d < 140 && d > 0.01) {
            n.vx += (dx / d) * 0.02
            n.vy += (dy / d) * 0.02
          }
          n.vx *= 0.995
          n.vy *= 0.995
        }

        ctx.beginPath()
        ctx.fillStyle = corNo
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
      }

      for (let i = 0; i < nos.length; i++) {
        for (let j = i + 1; j < nos.length; j++) {
          const a = nos[i]
          const b = nos[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d = Math.hypot(dx, dy)
          if (d > distMax) continue
          const pertoMouse =
            Math.hypot((a.x + b.x) / 2 - mouse.x, (a.y + b.y) / 2 - mouse.y) < 120
          const alpha = 1 - d / distMax
          ctx.beginPath()
          ctx.strokeStyle = pertoMouse ? corLinhaHover : corLinha
          ctx.globalAlpha = alpha
          ctx.lineWidth = pertoMouse ? 1.2 : 0.8
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
          ctx.globalAlpha = 1
        }
      }

      if (!reduzido) anim = requestAnimationFrame(passo)
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onLeave = () => {
      mouse = { x: -9999, y: -9999 }
    }

    resize()
    passo()
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(anim)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [claro])

  return <canvas ref={ref} className={className} aria-hidden />
}
