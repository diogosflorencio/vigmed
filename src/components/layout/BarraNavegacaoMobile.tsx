'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from 'framer-motion'
import { cn } from '@/lib/utils'
import { IconeAnimado } from '@/components/ui/icone-animado'
import { sair } from '@/lib/auth/acoes'
import type { ItemNavegacao } from '@/lib/navegacao'
import { itemEstaAtivo } from '@/lib/navegacao'
import type { AmbienteApp } from '@/lib/ambiente'
import type { Perfil } from '@/types'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

interface PropsBarraMobile {
  itens: ItemNavegacao[]
  ambiente: AmbienteApp
  perfil: Perfil
}

/** Navegação mobile - barra superior + menu lateral deslizante */
export function BarraNavegacaoMobile({ itens, ambiente, perfil }: PropsBarraMobile) {
  const caminho = usePathname()
  const [menuAberto, definirMenuAberto] = useState(false)
  const [grupoAbertoDesktop, definirGrupoAbertoDesktop] = useState<string | null>(null)
  const [grupoAbertoMobile, definirGrupoAbertoMobile] = useState<string | null>(null)
  const [compacto, definirCompacto] = useState(false)
  const rotuloAmbiente = ambiente === 'adm' ? 'Administração' : 'Portal empresas'
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (atual) => {
    definirCompacto(atual > 24)
  })

  return (
    <div className="menu-topo-flutuante-wrap safe-top">
      <header className={cn('menu-topo-flutuante', compacto && 'menu-topo-flutuante--compacto')}>
        <div className="menu-topo-marca">
          <p className="menu-topo-logo">VIGMED</p>
          <p className="menu-topo-ambiente">{rotuloAmbiente}</p>
        </div>

        <nav className="menu-topo-links hidden md:flex">
          {itens.map((item) => {
            if (item.tipo === 'link') {
              const ativo = itemEstaAtivo(caminho, item)
              const classe = cn('menu-topo-link', ativo && 'menu-topo-link--ativo')
              if (item.href.startsWith('http')) {
                return (
                  <motion.a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classe}
                    whileHover={{ y: -1 }}
                  >
                    <IconeAnimado nome={item.icone} tamanho={15} />
                    <span>{item.rotulo}</span>
                  </motion.a>
                )
              }
              return (
                <motion.div key={item.id} whileHover={{ y: -1 }}>
                  <Link href={item.href} className={classe}>
                    <IconeAnimado nome={item.icone} tamanho={15} />
                    <span>{item.rotulo}</span>
                  </Link>
                </motion.div>
              )
            }

            const expandido = grupoAbertoDesktop === item.id
            return (
              <div key={item.id} className="menu-topo-grupo">
                <button
                  type="button"
                  className={cn('menu-topo-link', itemEstaAtivo(caminho, item) && 'menu-topo-link--ativo')}
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
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                    >
                      {item.filhos.map((filho) => (
                        <li key={filho.href}>
                          <Link
                            href={filho.href}
                            className={cn('menu-topo-subitem', caminho.startsWith(filho.href) && 'menu-topo-subitem--ativo')}
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
                        className={cn('menu-topo-mobile-link w-full', itemEstaAtivo(caminho, item) && 'menu-topo-mobile-link--ativo')}
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
                                  onClick={() => definirMenuAberto(false)}
                                  className={cn('menu-topo-mobile-subitem', caminho.startsWith(filho.href) && 'menu-topo-mobile-subitem--ativo')}
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
        )}
      </AnimatePresence>
    </div>
  )
}
