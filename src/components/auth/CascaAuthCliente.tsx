'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle } from '@phosphor-icons/react'
import { ForcarTemaAuth } from '@/components/auth/ForcarTemaAuth'
import { TeiaConexoes } from '@/components/site/landing/TeiaConexoes'
import { ToggleTemaLanding } from '@/components/site/landing/ToggleTemaLanding'
import { cn } from '@/lib/utils'

const CHAVE_TEMA = 'vigmed-landing-tema'

interface Props {
  children: ReactNode
}

/** Shell visual do login alinhado à landing (teia, marca, tema). */
export function CascaAuthCliente({ children }: Props) {
  const [temaClaro, setTemaClaro] = useState(false)
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    try {
      setTemaClaro(localStorage.getItem(CHAVE_TEMA) === 'claro')
    } catch {
      /* ignore */
    }
    setPronto(true)
  }, [])

  useEffect(() => {
    if (!pronto) return
    try {
      localStorage.setItem(CHAVE_TEMA, temaClaro ? 'claro' : 'escuro')
    } catch {
      /* ignore */
    }
  }, [temaClaro, pronto])

  return (
    <div className={cn('vm vm-auth', temaClaro && 'vm--claro')}>
      <ForcarTemaAuth />

      <div className="vm-auth-shell">
        <aside className="vm-auth-brand" aria-label="Apresentação">
          <TeiaConexoes className="vm-auth-teia" claro={temaClaro} />
          <div className="vm-auth-brand-topo">
            <Link href="/" className="vm-brand">
              <span className="vm-brand-dot" aria-hidden />
              VIGMED
            </Link>
            <ToggleTemaLanding claro={temaClaro} onToggle={() => setTemaClaro((v) => !v)} />
          </div>

          <div className="vm-auth-brand-inner">
            <div className="vm-auth-brand-copy">
              <p className="vm-eyebrow">Área do cliente</p>
              <h1 className="vm-auth-titulo">Portal para laudos, comunicados e mensagens.</h1>
              <p className="vm-auth-lead">
                Entre com o e-mail autorizado pela administração. Cada empresa enxerga apenas os
                próprios arquivos.
              </p>

              <ul className="vm-lista vm-auth-lista">
                {[
                  'Acesso isolado por empresa',
                  'Login com e-mail autorizado',
                  'Laudos e documentos digitais',
                ].map((texto) => (
                  <li key={texto}>
                    <CheckCircle size={18} weight="fill" />
                    <span>{texto}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <main className="vm-auth-form-area">
          <div className="vm-auth-form-topo">
            <Link href="/" className="vm-brand vm-auth-marca-mobile">
              <span className="vm-brand-dot" aria-hidden />
              VIGMED
            </Link>
            <ToggleTemaLanding claro={temaClaro} onToggle={() => setTemaClaro((v) => !v)} />
          </div>

          <div className="vm-auth-form-wrap">{children}</div>

          <p className="vm-auth-voltar">
            <Link href="/">← Voltar ao site</Link>
          </p>
        </main>
      </div>
    </div>
  )
}
