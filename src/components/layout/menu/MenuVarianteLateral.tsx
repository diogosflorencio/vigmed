'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { IconeAnimado } from '@/components/ui/icone-animado'
import { MenuAcoesUsuario } from '@/components/layout/menu/MenuAcoesUsuario'
import type { ItemNavegacao } from '@/lib/navegacao'
import { itemEstaAtivo } from '@/lib/navegacao'
import type { AmbienteApp } from '@/lib/ambiente'
import type { Perfil } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  itens: ItemNavegacao[]
  ambiente: AmbienteApp
  perfil: Perfil
}

/** Variante 1 - barra lateral fixa à esquerda */
export function MenuVarianteLateral({ itens, ambiente, perfil }: Props) {
  const caminho = usePathname()
  const [gruposAbertos, definirGruposAbertos] = useState<Record<string, boolean>>({})
  const [mobileAberto, definirMobileAberto] = useState(false)
  const rotuloAmbiente = ambiente === 'adm' ? 'Administração' : 'Portal empresas'

  function alternarGrupo(id: string) {
    definirGruposAbertos((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const conteudo = (
  <>
    <div className="menu-lateral-marca">
      <p className="menu-lateral-logo">VIGMED</p>
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
                    <IconeAnimado nome={item.icone} tamanho={16} />
                    <span>{item.rotulo}</span>
                  </a>
                </li>
              )
            }
            return (
              <li key={item.id}>
                <Link href={item.href} className={classe} onClick={() => definirMobileAberto(false)}>
                  <IconeAnimado nome={item.icone} tamanho={16} />
                  <span>{item.rotulo}</span>
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
                <IconeAnimado nome={item.icone} tamanho={16} />
                <span className="flex-1 text-left">{item.rotulo}</span>
                <IconeAnimado nome={aberto ? 'chevron-up' : 'chevron-down'} tamanho={13} />
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
        <IconeAnimado nome={mobileAberto ? 'x' : 'menu'} tamanho={18} />
      </button>

      <aside className="menu-lateral hidden md:flex">{conteudo}</aside>

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
              className="menu-lateral menu-lateral--mobile md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              {conteudo}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
