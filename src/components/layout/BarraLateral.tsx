'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { sair } from '@/lib/auth/acoes'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { IconeAnimado } from '@/components/ui/icone-animado'
import type { ItemNavegacao } from '@/lib/navegacao'
import { itemEstaAtivo } from '@/lib/navegacao'
import type { AmbienteApp } from '@/lib/ambiente'

interface PropsBarraLateral {
  itens: ItemNavegacao[]
  ambiente: AmbienteApp
}

/** Barra lateral fixa - navegação sempre legível, sem hover/pílula */
export function BarraLateral({ itens, ambiente }: PropsBarraLateral) {
  const caminho = usePathname()
  const [gruposAbertos, definirGruposAbertos] = useState<Record<string, boolean>>({})

  function grupoEstaAberto(id: string, ativo: boolean) {
    if (ativo) return true
    return gruposAbertos[id] ?? false
  }

  return (
    <aside className="app-sidebar hidden md:flex" aria-label="Navegação principal">
      <div className="app-sidebar-top">
        <p className="app-sidebar-brand">VIGMED</p>
        <p className="app-sidebar-env">{ambiente === 'adm' ? 'Administração' : 'Portal empresas'}</p>
      </div>

      <nav className="app-sidebar-nav">
        <ul className="app-sidebar-list">
          {itens.map((item) => {
            if (item.tipo === 'link') {
              const ativo = itemEstaAtivo(caminho, item)
              return (
                <li key={item.id}>
                  {item.href.startsWith('http') ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn('app-sidebar-link', ativo && 'app-sidebar-link--ativo')}
                    >
                      <span className="app-sidebar-icone">
                        <IconeAnimado nome={item.icone} tamanho={16} />
                      </span>
                      <span>{item.rotulo}</span>
                    </a>
                  ) : (
                    <Link href={item.href} className={cn('app-sidebar-link', ativo && 'app-sidebar-link--ativo')}>
                      <span className="app-sidebar-icone">
                        <IconeAnimado nome={item.icone} tamanho={16} />
                      </span>
                      <span>{item.rotulo}</span>
                    </Link>
                  )}
                </li>
              )
            }

            const ativo = itemEstaAtivo(caminho, item)
            const aberto = grupoEstaAberto(item.id, ativo)

            return (
              <li key={item.id} className="app-sidebar-group">
                <button
                  type="button"
                  className={cn('app-sidebar-link w-full', ativo && 'app-sidebar-link--ativo')}
                  onClick={() =>
                    definirGruposAbertos((atual) => ({ ...atual, [item.id]: !aberto }))
                  }
                  aria-expanded={aberto}
                >
                  <span className="app-sidebar-icone">
                    <IconeAnimado nome={item.icone} tamanho={16} />
                  </span>
                  <span className="flex-1 text-left">{item.rotulo}</span>
                  <span className={cn('app-sidebar-chevron', aberto && 'app-sidebar-chevron--aberto')}>
                    <IconeAnimado nome="chevron-down" tamanho={14} />
                  </span>
                </button>
                {aberto && (
                  <ul className="app-sidebar-sublist">
                    {item.filhos.map((filho) => {
                      const filhoAtivo = caminho.startsWith(filho.href)
                      return (
                        <li key={filho.href}>
                          <Link
                            href={filho.href}
                            className={cn('app-sidebar-sublink', filhoAtivo && 'app-sidebar-sublink--ativo')}
                          >
                            {filho.rotulo}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="app-sidebar-footer">
        <ThemeToggle />
        <button type="button" className="app-sidebar-link app-sidebar-link--sair" onClick={() => sair()}>
          <IconeAnimado nome="logout" tamanho={16} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
