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

/** Variante 3 - trilho estreito de ícones com painel deslizante */
export function MenuVarianteTrilho({ itens, ambiente, perfil }: Props) {
  const caminho = usePathname()
  const [painelAberto, definirPainelAberto] = useState<string | null>(null)
  const [fixado, definirFixado] = useState(false)
  const rotuloAmbiente = ambiente === 'adm' ? 'ADM' : 'DOCS'

  const itemAtivo = itens.find((i) => itemEstaAtivo(caminho, i))
  const idPainel = painelAberto ?? (itemAtivo?.id ?? null)

  function abrirPainel(id: string) {
    definirPainelAberto((atual) => (atual === id ? null : id))
  }

  return (
    <>
      <div className="menu-trilho-topo md:hidden">
        <p className="menu-trilho-marca-texto">VIGMED</p>
        <button type="button" className="menu-trilho-toggle" onClick={() => definirFixado((v) => !v)}>
          <IconeAnimado nome={fixado ? 'x' : 'menu'} tamanho={18} />
        </button>
      </div>

      <div
        className={cn('menu-trilho-wrap', (fixado || painelAberto) && 'menu-trilho-wrap--aberto')}
        onMouseLeave={() => { if (!fixado) definirPainelAberto(null) }}
      >
        <aside className="menu-trilho-rail" aria-label="Trilho de navegação">
          <p className="menu-trilho-marca hidden md:block">V</p>

          <ul className="menu-trilho-icones">
            {itens.map((item) => {
              const ativo = itemEstaAtivo(caminho, item)
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cn('menu-trilho-icone', ativo && 'menu-trilho-icone--ativo', idPainel === item.id && 'menu-trilho-icone--painel')}
                    onClick={() => abrirPainel(item.id)}
                    onMouseEnter={() => { if (!fixado) definirPainelAberto(item.id) }}
                    title={item.rotulo}
                  >
                    <IconeAnimado nome={item.icone} tamanho={18} />
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="menu-trilho-rail-rodape hidden md:block">
            <MenuAcoesUsuario ambiente={ambiente} perfil={perfil} compacto />
          </div>
        </aside>

        <AnimatePresence>
          {idPainel && (
            <motion.aside
              className="menu-trilho-painel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {itens.map((item) => {
                if (item.id !== idPainel) return null

                return (
                  <div key={item.id} className="menu-trilho-painel-conteudo">
                    <header className="menu-trilho-painel-cabecalho">
                      <p className="menu-trilho-painel-titulo">{item.rotulo}</p>
                      <p className="menu-trilho-painel-ambiente">{rotuloAmbiente}</p>
                    </header>

                    {item.tipo === 'link' ? (
                      item.href.startsWith('http') ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer" className="menu-trilho-painel-link menu-trilho-painel-link--ativo">
                          Abrir {item.rotulo}
                          <IconeAnimado nome="external-link" tamanho={13} />
                        </a>
                      ) : (
                        <Link href={item.href} className={cn('menu-trilho-painel-link', caminho.startsWith(item.href) && 'menu-trilho-painel-link--ativo')}>
                          {item.rotulo}
                        </Link>
                      )
                    ) : (
                      <ul className="menu-trilho-painel-lista">
                        {item.filhos.map((f) => (
                          <li key={f.href}>
                            <Link
                              href={f.href}
                              className={cn('menu-trilho-painel-link', caminho.startsWith(f.href) && 'menu-trilho-painel-link--ativo')}
                            >
                              {f.rotulo}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="menu-trilho-painel-rodape md:hidden">
                      <MenuAcoesUsuario ambiente={ambiente} perfil={perfil} />
                    </div>
                  </div>
                )
              })}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
