'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconeAnimado } from '@/components/ui/icone-animado'
import { MenuAcoesUsuario } from '@/components/layout/menu/MenuAcoesUsuario'
import { PipulaDock } from '@/components/layout/menu/PipulaDock'
import type { NomeIcone } from '@/lib/icones-animados'
import type { ItemNavegacao } from '@/lib/navegacao'
import { listarAreas, areaAtiva } from '@/lib/navegacao-menu'
import type { AmbienteApp } from '@/lib/ambiente'
import type { Perfil } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  itens: ItemNavegacao[]
  ambiente: AmbienteApp
  perfil: Perfil
}

interface PropsItemDock {
  href: string
  rotulo: string
  icone: NomeIcone
  ativo: boolean
  aoClicar?: () => void
  externo?: boolean
  comRotulo?: boolean
}

function ItemDock({ href, rotulo, icone, ativo, aoClicar, externo, comRotulo }: PropsItemDock) {
  const classe = cn(
    'menu-dock-item grupo-icone',
    ativo && 'menu-dock-item--ativo',
    comRotulo && 'menu-dock-item--com-rotulo',
  )

  const conteudo = (
    <>
      <span className="menu-dock-item-icone" aria-hidden>
        <IconeAnimado nome={icone} tamanho={20} />
      </span>
      {comRotulo && <span className="menu-dock-item-rotulo">{rotulo}</span>}
    </>
  )

  if (comRotulo) {
    if (externo) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classe}
          aria-label={rotulo}
          onClick={aoClicar}
        >
          {conteudo}
        </a>
      )
    }
    return (
      <Link href={href} className={classe} aria-label={rotulo} onClick={aoClicar}>
        {conteudo}
      </Link>
    )
  }

  return (
    <PipulaDock texto={rotulo}>
      {(pipula) => {
        const iconeSlot = (
          <span className="menu-dock-item-icone" aria-hidden>
            <IconeAnimado nome={icone} tamanho={20} />
          </span>
        )

        if (externo) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={classe}
              aria-label={rotulo}
              onClick={aoClicar}
              ref={pipula.ref as (node: HTMLAnchorElement | null) => void}
              onMouseEnter={pipula.onMouseEnter}
              onMouseLeave={pipula.onMouseLeave}
              onFocus={pipula.onFocus}
              onBlur={pipula.onBlur}
            >
              {iconeSlot}
            </a>
          )
        }

        return (
          <Link
            href={href}
            className={classe}
            aria-label={rotulo}
            onClick={aoClicar}
            ref={pipula.ref as (node: HTMLAnchorElement | null) => void}
            onMouseEnter={pipula.onMouseEnter}
            onMouseLeave={pipula.onMouseLeave}
            onFocus={pipula.onFocus}
            onBlur={pipula.onBlur}
          >
            {iconeSlot}
          </Link>
        )
      }}
    </PipulaDock>
  )
}

function ItemCategoria({
  rotulo,
  icone,
  ativo,
  onClick,
}: {
  rotulo: string
  icone: NomeIcone
  ativo: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={cn(
        'menu-dock-item menu-dock-item--com-rotulo grupo-icone',
        ativo && 'menu-dock-item--ativo',
      )}
      onClick={onClick}
      aria-label={rotulo}
      aria-pressed={ativo}
    >
      <span className="menu-dock-item-icone" aria-hidden>
        <IconeAnimado nome={icone} tamanho={20} />
      </span>
      <span className="menu-dock-item-rotulo">{rotulo}</span>
    </button>
  )
}

/** Dock inferior — desktop plano; mobile com categorias e subitens */
export function MenuDock({ itens, ambiente, perfil }: Props) {
  const caminho = usePathname()
  const areas = listarAreas(itens)
  const areaAtivaId = areaAtiva(caminho, areas)
  const [categoriaSelecionada, definirCategoriaSelecionada] = useState(areaAtivaId)

  useEffect(() => {
    definirCategoriaSelecionada(areaAtivaId)
  }, [areaAtivaId])

  const areaAberta = areas.find((a) => a.id === categoriaSelecionada)
  const subitens =
    areaAberta?.tipo === 'grupo' && areaAberta.filhos
      ? areaAberta.filhos.map((filho) => ({
          href: filho.href,
          rotulo: filho.rotulo,
          icone: filho.icone ?? areaAberta.icone,
        }))
      : []

  return (
    <>
      <nav className="menu-dock-barra hidden md:flex" aria-label="Navegação principal">
        <div className="menu-dock-inner">
          <div className="menu-dock-scroll">
            {areas.map((area) => {
              if (area.tipo === 'link' && area.href) {
                const externo = area.href.startsWith('http')
                return (
                  <ItemDock
                    key={area.id}
                    href={area.href}
                    rotulo={area.rotulo}
                    icone={area.icone}
                    ativo={caminho.startsWith(area.href)}
                    externo={externo}
                  />
                )
              }
              if (area.tipo === 'grupo' && area.filhos?.length) {
                return area.filhos.map((filho) => (
                  <ItemDock
                    key={`${area.id}-${filho.href}`}
                    href={filho.href}
                    rotulo={filho.rotulo}
                    icone={filho.icone ?? area.icone}
                    ativo={caminho.startsWith(filho.href)}
                  />
                ))
              }
              return null
            })}
          </div>
          <span className="menu-dock-separador" aria-hidden />
          <MenuAcoesUsuario ambiente={ambiente} perfil={perfil} compacto noDock />
        </div>
      </nav>

      <nav className="menu-dock-barra md:hidden" aria-label="Navegação principal">
        <div className="menu-dock-inner menu-dock-inner--mobile">
          <div className="menu-dock-mobile-corpo">
            {subitens.length > 0 && (
              <div className="menu-dock-sub-linha" role="group" aria-label={`Itens de ${areaAberta?.rotulo}`}>
                {subitens.map((sub) => (
                  <ItemDock
                    key={sub.href}
                    href={sub.href}
                    rotulo={sub.rotulo}
                    icone={sub.icone}
                    ativo={caminho.startsWith(sub.href)}
                    comRotulo
                  />
                ))}
              </div>
            )}

            <div className="menu-dock-scroll menu-dock-scroll--mobile">
              {areas.map((area) => {
                if (area.tipo === 'link' && area.href) {
                  const externo = area.href.startsWith('http')
                  return (
                    <ItemDock
                      key={area.id}
                      href={area.href}
                      rotulo={area.rotulo}
                      icone={area.icone}
                      ativo={caminho.startsWith(area.href)}
                      externo={externo}
                      comRotulo
                    />
                  )
                }

                return (
                  <ItemCategoria
                    key={area.id}
                    rotulo={area.rotulo}
                    icone={area.icone}
                    ativo={categoriaSelecionada === area.id}
                    onClick={() => definirCategoriaSelecionada(area.id)}
                  />
                )
              })}
            </div>
          </div>

          <span className="menu-dock-separador" aria-hidden />
          <MenuAcoesUsuario ambiente={ambiente} perfil={perfil} compacto noDock mobileComRotulo />
        </div>
      </nav>
    </>
  )
}
