'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { IconeAnimado } from '@/components/ui/icone-animado'
import { sair } from '@/lib/auth/acoes'
import type { ItemNavegacao } from '@/lib/navegacao'
import { itemEstaAtivo } from '@/lib/navegacao'
import type { AmbienteApp } from '@/lib/ambiente'
import type { Perfil } from '@/types'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { BotaoPaletaComando } from '@/components/layout/BotaoPaletaComando'
import { useNotificacoesPortal } from '@/contexts/NotificacoesPortalContext'
import { badgeDoHref } from '@/lib/navegacao-badge'

interface PropsBarraMobile {
  itens: ItemNavegacao[]
  ambiente: AmbienteApp
  perfil: Perfil
}

/** Navegação: barra superior fixa + menu mobile */
export function BarraNavegacaoMobile({ itens, ambiente, perfil }: PropsBarraMobile) {
  const caminho = usePathname()
  const notificacoes = useNotificacoesPortal()
  const [menuAberto, definirMenuAberto] = useState(false)
  const [grupoAbertoDesktop, definirGrupoAbertoDesktop] = useState<string | null>(null)
  const [grupoAbertoMobile, definirGrupoAbertoMobile] = useState<string | null>(null)
  const navDesktopRef = useRef<HTMLElement>(null)
  const rotuloAmbiente = ambiente === 'adm' ? 'Administração' : 'Portal empresas'

  function fecharSubmenuDesktop() {
    definirGrupoAbertoDesktop(null)
  }

  useEffect(() => {
    fecharSubmenuDesktop()
    definirMenuAberto(false)
    definirGrupoAbertoMobile(null)
  }, [caminho])

  useEffect(() => {
    if (!grupoAbertoDesktop) return

    function aoCliqueFora(e: MouseEvent) {
      const alvo = e.target as Node
      if (navDesktopRef.current?.contains(alvo)) return
      fecharSubmenuDesktop()
    }

    function aoTecla(e: KeyboardEvent) {
      if (e.key === 'Escape') fecharSubmenuDesktop()
    }

    document.addEventListener('mousedown', aoCliqueFora)
    document.addEventListener('keydown', aoTecla)
    return () => {
      document.removeEventListener('mousedown', aoCliqueFora)
      document.removeEventListener('keydown', aoTecla)
    }
  }, [grupoAbertoDesktop])

  return (
    <div className="menu-topo-flutuante-wrap menu-topo-fixo-wrap safe-top">
      <header className="menu-topo-flutuante menu-topo-fixo">
        <div className="menu-topo-marca">
          <p className="menu-topo-logo">VIGMED</p>
          <p className="menu-topo-ambiente">{rotuloAmbiente}</p>
        </div>

        <nav ref={navDesktopRef} className="menu-topo-links hidden md:flex">
          {itens.map((item) => {
            if (item.tipo === 'link') {
              const ativo = itemEstaAtivo(caminho, item)
              const classe = cn('menu-topo-link', ativo && 'menu-topo-link--ativo')
              if (item.href.startsWith('http')) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classe}
                    onClick={fecharSubmenuDesktop}
                  >
                    <IconeAnimado nome={item.icone} tamanho={15} />
                    <span>{item.rotulo}</span>
                  </a>
                )
              }
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={classe}
                  onClick={fecharSubmenuDesktop}
                >
                  <IconeAnimado nome={item.icone} tamanho={15} />
                  <span>{item.rotulo}</span>
                  {(() => {
                    const badge = badgeDoHref(item.href, notificacoes)
                    return badge > 0 ? (
                      <span className="menu-nav-badge">{badge > 99 ? '99+' : badge}</span>
                    ) : null
                  })()}
                </Link>
              )
            }

            const expandido = grupoAbertoDesktop === item.id
            return (
              <div key={item.id} className="menu-topo-grupo">
                <button
                  type="button"
                  className={cn('menu-topo-link', itemEstaAtivo(caminho, item) && 'menu-topo-link--ativo')}
                  aria-expanded={expandido}
                  onClick={() => definirGrupoAbertoDesktop(expandido ? null : item.id)}
                >
                  <IconeAnimado nome={item.icone} tamanho={15} />
                  <span>{item.rotulo}</span>
                  <span className={cn('menu-topo-chevron', expandido && 'menu-topo-chevron--aberto')}>
                    <IconeAnimado nome="chevron-down" tamanho={13} />
                  </span>
                </button>
                <AnimatePresence>
                  {expandido && (
                    <motion.ul
                      className="menu-topo-submenu"
                      initial={{ opacity: 0, y: 6, x: '-50%' }}
                      animate={{ opacity: 1, y: 0, x: '-50%' }}
                      exit={{ opacity: 0, y: 4, x: '-50%' }}
                      transition={{ duration: 0.14 }}
                    >
                      {item.filhos.map((filho) => (
                        <li key={filho.href}>
                          <Link
                            href={filho.href}
                            className={cn(
                              'menu-topo-subitem',
                              caminho.startsWith(filho.href) && 'menu-topo-subitem--ativo',
                            )}
                            onClick={fecharSubmenuDesktop}
                          >
                            {filho.rotulo}
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </nav>

        <div className="menu-topo-acoes">
          <BotaoPaletaComando compacto className="hidden md:inline-flex" />
          <ThemeToggle className="menu-topo-btn-tema hidden md:inline-flex" />
          <button type="button" className="menu-topo-btn-sair hidden md:inline-flex" onClick={() => sair()}>
            <IconeAnimado nome="logout" tamanho={14} />
            <span>Sair</span>
          </button>

          <button
            type="button"
            className="menu-topo-btn-menu md:hidden"
            onClick={() => definirMenuAberto((aberto) => !aberto)}
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          >
            <IconeAnimado nome={menuAberto ? 'x' : 'menu'} tamanho={17} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuAberto && (
          <>
            <button
              type="button"
              className="menu-topo-backdrop md:hidden"
              aria-label="Fechar menu"
              onClick={() => definirMenuAberto(false)}
            />
            <motion.div
              className="menu-topo-mobile-painel md:hidden"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <div className="menu-topo-mobile-perfil">
                <p className="text-sm font-semibold">{perfil.nome_completo}</p>
                <p className="text-xs text-(--color-text-3) truncate">{perfil.email}</p>
              </div>

              <nav>
                <ul className="menu-topo-mobile-lista">
                  {itens.map((item) => {
                    if (item.tipo === 'link') {
                      const ativo = itemEstaAtivo(caminho, item)
                      const classe = cn('menu-topo-mobile-link', ativo && 'menu-topo-mobile-link--ativo')
                      if (item.href.startsWith('http')) {
                        return (
                          <li key={item.id}>
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={classe}
                              onClick={() => definirMenuAberto(false)}
                            >
                              <IconeAnimado nome={item.icone} tamanho={15} />
                              <span>{item.rotulo}</span>
                            </a>
                          </li>
                        )
                      }
                      return (
                        <li key={item.id}>
                          <Link href={item.href} className={classe} onClick={() => definirMenuAberto(false)}>
                            <IconeAnimado nome={item.icone} tamanho={15} />
                            <span>{item.rotulo}</span>
                            {(() => {
                              const badge = badgeDoHref(item.href, notificacoes)
                              return badge > 0 ? (
                                <span className="menu-nav-badge">{badge > 99 ? '99+' : badge}</span>
                              ) : null
                            })()}
                          </Link>
                        </li>
                      )
                    }

                    const expandido = grupoAbertoMobile === item.id
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => definirGrupoAbertoMobile(expandido ? null : item.id)}
                          className={cn(
                            'menu-topo-mobile-link w-full',
                            itemEstaAtivo(caminho, item) && 'menu-topo-mobile-link--ativo',
                          )}
                        >
                          <IconeAnimado nome={item.icone} tamanho={15} />
                          <span className="flex-1 text-left">{item.rotulo}</span>
                          <span className={cn('menu-topo-chevron', expandido && 'menu-topo-chevron--aberto')}>
                            <IconeAnimado nome="chevron-down" tamanho={13} />
                          </span>
                        </button>
                        <AnimatePresence>
                          {expandido && (
                            <motion.ul
                              className="menu-topo-mobile-sublista"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              {item.filhos.map((filho) => (
                                <li key={filho.href}>
                                  <Link
                                    href={filho.href}
                                    onClick={() => {
                                      definirMenuAberto(false)
                                      definirGrupoAbertoMobile(null)
                                    }}
                                    className={cn(
                                      'menu-topo-mobile-subitem',
                                      caminho.startsWith(filho.href) && 'menu-topo-mobile-subitem--ativo',
                                    )}
                                  >
                                    {filho.rotulo}
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              <div className="menu-topo-mobile-rodape">
                <ThemeToggle className="menu-topo-btn-tema w-full justify-center" />
                <button type="button" className="menu-topo-btn-sair w-full justify-center" onClick={() => sair()}>
                  <IconeAnimado nome="logout" tamanho={14} />
                  <span>Sair</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
