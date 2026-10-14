import { Sora, Unbounded } from 'next/font/google'
import type { ReactNode } from 'react'
import '@/styles/landing.css'

const fonteTitulo = Unbounded({
  subsets: ['latin'],
  variable: '--fonte-vm-titulo',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
})

const fonteCorpo = Sora({
  subsets: ['latin'],
  variable: '--fonte-vm-corpo',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

/** Tipografia e CSS da landing nas telas de autenticação. */
export function FonteAuth({ children }: { children: ReactNode }) {
  return (
    <div className={`${fonteTitulo.variable} ${fonteCorpo.variable}`} style={{ minHeight: '100svh' }}>
      {children}
    </div>
  )
}
