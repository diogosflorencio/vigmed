'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconeAnimado } from '@/components/ui/icone-animado'
import { MenuAcoesUsuario } from '@/components/layout/menu/MenuAcoesUsuario'
import { areaAtiva, listarAreas, rotuloPaginaAtual } from '@/lib/navegacao-menu'
import type { ItemNavegacao } from '@/lib/navegacao'
import type { AmbienteApp } from '@/lib/ambiente'
import type { Perfil } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  itens: ItemNavegacao[]
  ambiente: AmbienteApp
  perfil: Perfil
}

/** Variante 5 - seletor de área no topo; links mudam conforme contexto */
export function MenuVarianteContextual({ itens, ambiente, perfil }: Props) {
  const caminho = usePathname()
  const areas = useMemo(() => listarAreas(itens), [itens])
  const [areaId, definirAreaId] = useState(() => areaAtiva(caminho, areas))
  const [mobileAberto, definirMobileAberto] = useState(false)
  const rotuloAmbiente = ambiente === 'adm' ? 'Administração' : 'Portal empresas'
  const paginaAtual = rotuloPaginaAtual(caminho, itens)

  useEffect(() => {
    definirAreaId(areaAtiva(caminho, areas))
  }, [caminho, areas])

  const area = areas.find((a) => a.id === areaId) ?? areas[0]

  const linksContextuais = area?.tipo === 'link'
    ? [{ href: area.href!, rotulo: area.rotulo }]
    : area?.filhos ?? []

  const conteudoNav = (
    <>
      <div className="menu-contextual-cabecalho">
        <p className="menu-contextual-logo">VIGMED</p>
        <p className="menu-contextual-pagina">{paginaAtual}</p>
      </div>

      <div className="menu-contextual-seletor">
        <label className="menu-contextual-label" htmlFor="menu-area-select">Área</label>
        <select
          id="menu-area-select"
          className="menu-contextual-select"
          value={areaId}
          onChange={(e) => definirAreaId(e.target.value)}
        >
          {areas.map((a) => (
            <option key={a.id} value={a.id}>{a.rotulo}</option>
          ))}
        </select>
      </div>

      <nav className="menu-contextual-nav" aria-label={`Links de ${area?.rotulo}`}>
        <p className="menu-contextual-secao">{area?.rotulo}</p>
        <ul className="menu-contextual-links">
          {linksContextuais.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn('menu-contextual-link', caminho.startsWith(link.href) && 'menu-contextual-link--ativo')}
                onClick={() => definirMobileAberto(false)}
              >
                <span className="menu-contextual-link-indicador" />
                {link.rotulo}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="menu-contextual-areas-rapidas">
        <p className="menu-contextual-label">Trocar área</p>
        <div className="menu-contextual-grid">
          {areas.map((a) => (
            <button
              key={a.id}
              type="button"
              className={cn('menu-contextual-area-btn', areaId === a.id && 'menu-contextual-area-btn--ativo')}
              onClick={() => definirAreaId(a.id)}
            >
              <IconeAnimado nome={a.icone} tamanho={15} />
              <span>{a.rotulo}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="menu-contextual-rodape">
        <p className="menu-contextual-ambiente">{rotuloAmbiente}</p>
        <MenuAcoesUsuario ambiente={ambiente} perfil={perfil} />
      </div>
    </>
  )

  return (
    <>
      <header className="menu-contextual-topo-mobile md:hidden">
        <button type="button" className="menu-contextual-toggle" onClick={() => definirMobileAberto((v) => !v)}>
          <IconeAnimado nome={mobileAberto ? 'x' : 'menu'} tamanho={18} />
        </button>
        <div>
          <p className="menu-contextual-logo-sm">VIGMED</p>
          <p className="menu-contextual-pagina-sm">{paginaAtual}</p>
        </div>
      </header>

      <aside className="menu-contextual hidden md:flex">{conteudoNav}</aside>

      {mobileAberto && (
        <>
          <div className="menu-contextual-overlay md:hidden" onClick={() => definirMobileAberto(false)} />
          <aside className="menu-contextual menu-contextual--mobile md:hidden">{conteudoNav}</aside>
        </>
      )}
    </>
  )
}
