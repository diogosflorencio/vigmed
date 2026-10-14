'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { MenuAcoesUsuario } from '@/components/layout/menu/MenuAcoesUsuario'
import { BotaoPaletaComando } from '@/components/layout/BotaoPaletaComando'
import { useNotificacoesPortal } from '@/contexts/NotificacoesPortalContext'
import { badgeDoHref } from '@/lib/navegacao-badge'
import type { ItemNavegacao } from '@/lib/navegacao'
import { itemEstaAtivo } from '@/lib/navegacao'
import type { AmbienteApp } from '@/lib/ambiente'
import type { Perfil } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  itens: ItemNavegacao[]
  ambiente: AmbienteApp
  perfil: Perfil
  lado?: 'esquerda' | 'direita'
}

/** Barra lateral fixa à esquerda ou à direita */
export function MenuVarianteLateral({ itens, ambiente, perfil, lado = 'esquerda' }: Props) {
  const caminho = usePathname()
  const notificacoes = useNotificacoesPortal()
  const [gruposAbertos, definirGruposAbertos] = useState<Record<string, boolean>>({})
  const [mobileAberto, definirMobileAberto] = useState(false)
  const rotuloAmbiente = ambiente === 'adm' ? 'Administração' : 'Portal empresas'

  function alternarGrupo(id: string) {
    definirGruposAbertos((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const conteudo = (
  <>
    <div className="menu-lateral-marca">
      <p className="menu-lateral-logo">
        <span className="vig-landing-logo-marca" aria-hidden />
        <span className="menu-lateral-logo-texto">VIGMED</span>
      </p>
      <p className="menu-lateral-ambiente">{rotuloAmbiente}</p>
    </div>

    <nav className="menu-lateral-nav">
      <ul className="menu-lateral-lista">
        {itens.map((item) => {
          if (item.tipo === 'link') {
            const ativo = itemEstaAtivo(caminho, item)
            const classe = cn('menu-lateral-link', ativo && 'menu-lateral-link--ativo')
            if (item.href.startsWith('http')) {
              return (
                <li key={item.id}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className={classe}>
                    <span>{item.rotulo}</span>
                  </a>
                </li>
              )
            }
            return (
              <li key={item.id}>
                <Link href={item.href} className={classe} onClick={() => definirMobileAberto(false)}>
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

          const aberto = gruposAbertos[item.id] ?? itemEstaAtivo(caminho, item)
          const grupoAtivo = itemEstaAtivo(caminho, item)

          return (
            <li key={item.id} className="menu-lateral-grupo">
              <button
                type="button"
                className={cn('menu-lateral-link menu-lateral-link--grupo', grupoAtivo && 'menu-lateral-link--ativo')}
                onClick={() => alternarGrupo(item.id)}
              >
                <span className="flex-1 text-left">{item.rotulo}</span>
                <span className={cn('menu-chevron', aberto && 'menu-chevron--aberto')} aria-hidden />
              </button>
              <AnimatePresence initial={false}>
                {aberto && (
                  <motion.ul
                    className="menu-lateral-sublista"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.filhos.map((filho) => (
                      <li key={filho.href}>
                        <Link
                          href={filho.href}
                          className={cn('menu-lateral-sublink', caminho.startsWith(filho.href) && 'menu-lateral-sublink--ativo')}
                          onClick={() => definirMobileAberto(false)}
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

    <div className="menu-lateral-rodape">
      <BotaoPaletaComando className="w-full mb-2" />
      <MenuAcoesUsuario ambiente={ambiente} perfil={perfil} />
    </div>
  </>
  )

  return (
    <>
      <button
        type="button"
        className="menu-lateral-toggle md:hidden"
        onClick={() => definirMobileAberto((v) => !v)}
        aria-label="Menu"
      >
        <span className="vig-landing-nav-toggle-bar" />
        <span className="vig-landing-nav-toggle-bar" />
      </button>

      <aside
        className={cn(
          'menu-lateral hidden md:flex',
          lado === 'direita' && 'menu-lateral--direita',
        )}
      >
        {conteudo}
      </aside>

      <AnimatePresence>
        {mobileAberto && (
          <>
            <motion.div
              className="menu-lateral-overlay md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => definirMobileAberto(false)}
            />
            <motion.aside
              className={cn(
                'menu-lateral menu-lateral--mobile md:hidden',
                lado === 'direita' && 'menu-lateral--direita',
              )}
              initial={{ x: lado === 'direita' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: lado === 'direita' ? '100%' : '-100%' }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {conteudo}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
