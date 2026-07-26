'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { IconeAnimado } from '@/components/ui/icone-animado'
import { MenuAcoesUsuario } from '@/components/layout/menu/MenuAcoesUsuario'
import { listarDestinos, rotuloPaginaAtual } from '@/lib/navegacao-menu'
import type { ItemNavegacao } from '@/lib/navegacao'
import type { AmbienteApp } from '@/lib/ambiente'
import type { Perfil } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  itens: ItemNavegacao[]
  ambiente: AmbienteApp
  perfil: Perfil
}

/** Variante 4 - header mínimo + paleta de comando (Ctrl+K) */
export function MenuVariantePaleta({ itens, ambiente, perfil }: Props) {
  const caminho = usePathname()
  const router = useRouter()
  const [aberta, definirAberta] = useState(false)
  const [busca, definirBusca] = useState('')
  const [indice, definirIndice] = useState(0)
  const rotuloAmbiente = ambiente === 'adm' ? 'Administração' : 'Portal empresas'
  const paginaAtual = rotuloPaginaAtual(caminho, itens)
  const destinos = listarDestinos(itens)

  const filtrados = destinos.filter((d) => {
    if (!busca.trim()) return true
    const termo = busca.toLowerCase()
    return (
      d.rotulo.toLowerCase().includes(termo) ||
      (d.grupo?.toLowerCase().includes(termo) ?? false)
    )
  })

  const abrirPaleta = useCallback(() => {
    definirAberta(true)
    definirBusca('')
    definirIndice(0)
  }, [])

  const fecharPaleta = useCallback(() => {
    definirAberta(false)
    definirBusca('')
    definirIndice(0)
  }, [])

  const irPara = useCallback((href: string, externo?: boolean) => {
    fecharPaleta()
    if (externo) {
      window.open(href, '_blank')
      return
    }
    router.push(href)
  }, [fecharPaleta, router])

  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        definirAberta((v) => !v)
        definirBusca('')
        definirIndice(0)
      }
      if (e.key === 'Escape') fecharPaleta()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [fecharPaleta])

  useEffect(() => {
    if (!aberta) return
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        definirIndice((i) => Math.min(i + 1, filtrados.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        definirIndice((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && filtrados[indice]) {
        e.preventDefault()
        irPara(filtrados[indice].href, filtrados[indice].externo)
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [aberta, filtrados, indice, irPara])

  useEffect(() => {
    definirIndice(0)
  }, [busca])

  return (
    <>
      <header className="menu-paleta-header">
        <div className="menu-paleta-marca">
          <p className="menu-paleta-logo">VIGMED</p>
          <p className="menu-paleta-trilha">
            {rotuloAmbiente}
            <span aria-hidden> / </span>
            <strong>{paginaAtual}</strong>
          </p>
        </div>

        <button type="button" className="menu-paleta-trigger" onClick={abrirPaleta}>
          <IconeAnimado nome="search" tamanho={14} />
          <span className="hidden sm:inline">Ir para...</span>
          <kbd className="menu-paleta-atalho">Ctrl K</kbd>
        </button>

        <MenuAcoesUsuario ambiente={ambiente} perfil={perfil} compacto />
      </header>

      <AnimatePresence>
        {aberta && (
          <>
            <motion.div
              className="menu-paleta-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={fecharPaleta}
            />
            <motion.div
              className="menu-paleta-modal"
              role="dialog"
              aria-label="Paleta de navegação"
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <div className="menu-paleta-busca-wrap">
                <IconeAnimado nome="search" tamanho={16} className="text-(--color-text-3)" />
                <input
                  autoFocus
                  className="menu-paleta-busca"
                  placeholder="Buscar página..."
                  value={busca}
                  onChange={(e) => definirBusca(e.target.value)}
                />
                <button type="button" className="menu-paleta-fechar" onClick={fecharPaleta}>
                  <IconeAnimado nome="x" tamanho={14} />
                </button>
              </div>

              <ul className="menu-paleta-lista">
                {filtrados.map((d, i) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      className={cn('menu-paleta-item', i === indice && 'menu-paleta-item--foco', caminho.startsWith(d.href) && 'menu-paleta-item--ativo')}
                      onClick={() => irPara(d.href, d.externo)}
                      onMouseEnter={() => definirIndice(i)}
                    >
                      <IconeAnimado nome={d.icone} tamanho={16} />
                      <div className="menu-paleta-item-texto">
                        <span>{d.rotulo}</span>
                        {d.grupo && <small>{d.grupo}</small>}
                      </div>
                      {d.externo && <IconeAnimado nome="external-link" tamanho={12} />}
                    </button>
                  </li>
                ))}
                {filtrados.length === 0 && (
                  <li className="menu-paleta-vazio">Nenhum resultado para &quot;{busca}&quot;</li>
                )}
              </ul>

              <footer className="menu-paleta-rodape">
                <span>↑↓ navegar</span>
                <span>Enter abrir</span>
                <span>Esc fechar</span>
              </footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
