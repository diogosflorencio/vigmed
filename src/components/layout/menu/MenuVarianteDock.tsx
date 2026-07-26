'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { IconeAnimado } from '@/components/ui/icone-animado'
import { MenuAcoesUsuario } from '@/components/layout/menu/MenuAcoesUsuario'
import type { NomeIcone } from '@/lib/icones-animados'
import type { ItemNavegacao } from '@/lib/navegacao'
import { listarDestinos } from '@/lib/navegacao-menu'
import type { AmbienteApp } from '@/lib/ambiente'
import type { Perfil } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  itens: ItemNavegacao[]
  ambiente: AmbienteApp
  perfil: Perfil
}

interface ItemDock {
  id: string
  rotulo: string
  icone: NomeIcone
  tipo: 'link' | 'grupo'
  href?: string
  filhos?: { href: string; rotulo: string }[]
}

/** Variante 2 - dock fixo na base da tela */
export function MenuVarianteDock({ itens, ambiente, perfil }: Props) {
  const caminho = usePathname()
  const [grupoAberto, definirGrupoAberto] = useState<string | null>(null)
  const [maisAberto, definirMaisAberto] = useState(false)
  const rotuloAmbiente = ambiente === 'adm' ? 'ADM' : 'DOCS'

  const itensDock: ItemDock[] = itens.map((item) => {
    if (item.tipo === 'link') {
      return { id: item.id, rotulo: item.rotulo, icone: item.icone, tipo: 'link', href: item.href }
    }
    return { id: item.id, rotulo: item.rotulo, icone: item.icone, tipo: 'grupo', filhos: item.filhos }
  })

  const destinos = listarDestinos(itens)
  const maxVisiveis = 5
  const visiveis = itensDock.slice(0, maxVisiveis)
  const extras = itensDock.slice(maxVisiveis)

  function renderBotao(item: ItemDock) {
    const ativo = item.tipo === 'link'
      ? item.href && caminho.startsWith(item.href)
      : item.filhos?.some((f) => caminho.startsWith(f.href))

    if (item.tipo === 'link' && item.href) {
      if (item.href.startsWith('http')) {
        return (
          <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer" className={cn('menu-dock-item', ativo && 'menu-dock-item--ativo')}>
            <IconeAnimado nome={item.icone} tamanho={20} />
            <span>{item.rotulo}</span>
          </a>
        )
      }
      return (
        <Link key={item.id} href={item.href} className={cn('menu-dock-item', ativo && 'menu-dock-item--ativo')}>
          <IconeAnimado nome={item.icone} tamanho={20} />
          <span>{item.rotulo}</span>
        </Link>
      )
    }

    return (
      <button
        key={item.id}
        type="button"
        className={cn('menu-dock-item', ativo && 'menu-dock-item--ativo')}
        onClick={() => definirGrupoAberto(grupoAberto === item.id ? null : item.id)}
      >
        <IconeAnimado nome={item.icone} tamanho={20} />
        <span>{item.rotulo}</span>
      </button>
    )
  }

  const grupoAtual = itensDock.find((i) => i.id === grupoAberto && i.tipo === 'grupo')

  return (
    <>
      <header className="menu-dock-topo">
        <p className="menu-dock-marca">VIGMED <span>{rotuloAmbiente}</span></p>
        <MenuAcoesUsuario ambiente={ambiente} perfil={perfil} compacto />
      </header>

      <nav className="menu-dock-barra safe-bottom" aria-label="Navegação principal">
        <div className="menu-dock-inner">
          {visiveis.map(renderBotao)}
          {extras.length > 0 && (
            <button
              type="button"
              className={cn('menu-dock-item', maisAberto && 'menu-dock-item--ativo')}
              onClick={() => definirMaisAberto((v) => !v)}
            >
              <IconeAnimado nome="menu" tamanho={20} />
              <span>Mais</span>
            </button>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {grupoAtual?.filhos && (
          <motion.div
            className="menu-dock-popup"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            <p className="menu-dock-popup-titulo">{grupoAtual.rotulo}</p>
            <ul>
              {grupoAtual.filhos.map((f) => (
                <li key={f.href}>
                  <Link
                    href={f.href}
                    className={cn('menu-dock-popup-link', caminho.startsWith(f.href) && 'menu-dock-popup-link--ativo')}
                    onClick={() => definirGrupoAberto(null)}
                  >
                    {f.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {maisAberto && (
          <>
            <motion.div className="menu-dock-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => definirMaisAberto(false)} />
            <motion.div
              className="menu-dock-sheet"
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            >
              <p className="menu-dock-sheet-titulo">Todas as páginas</p>
              <ul className="menu-dock-sheet-lista">
                {destinos.map((d) => (
                  <li key={d.id}>
                    {d.externo ? (
                      <a href={d.href} target="_blank" rel="noopener noreferrer" className="menu-dock-sheet-link" onClick={() => definirMaisAberto(false)}>
                        <IconeAnimado nome={d.icone} tamanho={15} />
                        <span>{d.grupo ? `${d.grupo} · ${d.rotulo}` : d.rotulo}</span>
                      </a>
                    ) : (
                      <Link href={d.href} className={cn('menu-dock-sheet-link', caminho.startsWith(d.href) && 'menu-dock-sheet-link--ativo')} onClick={() => definirMaisAberto(false)}>
                        <IconeAnimado nome={d.icone} tamanho={15} />
                        <span>{d.grupo ? `${d.grupo} · ${d.rotulo}` : d.rotulo}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
