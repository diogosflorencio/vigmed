'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type VarianteMenu = 'lateral' | 'dock' | 'trilho' | 'paleta' | 'contextual'

export interface OpcaoVarianteMenu {
  id: VarianteMenu
  rotulo: string
  descricao: string
}

export const OPCOES_VARIANTE_MENU: OpcaoVarianteMenu[] = [
  {
    id: 'lateral',
    rotulo: 'Barra lateral',
    descricao: 'Menu fixo à esquerda, grupos expansíveis - estilo painel corporativo',
  },
  {
    id: 'dock',
    rotulo: 'Dock inferior',
    descricao: 'Ícones na base da tela - estilo app mobile / macOS dock',
  },
  {
    id: 'trilho',
    rotulo: 'Trilho de ícones',
    descricao: 'Faixa estreita só com ícones; painel desliza ao interagir',
  },
  {
    id: 'paleta',
    rotulo: 'Paleta de comando',
    descricao: 'Header mínimo; navegação via Ctrl+K ou botão buscar',
  },
  {
    id: 'contextual',
    rotulo: 'Áreas contextuais',
    descricao: 'Escolhe a área no topo; links mudam conforme o contexto',
  },
]

const CHAVE_STORAGE = 'vigmed-menu-variante'
const PADRAO: VarianteMenu = 'lateral'

interface ContextoMenuVariante {
  variante: VarianteMenu
  definirVariante: (v: VarianteMenu) => void
  montado: boolean
}

const MenuVarianteContext = createContext<ContextoMenuVariante | null>(null)

export function MenuVarianteProvider({ children }: { children: ReactNode }) {
  const [variante, definirVarianteState] = useState<VarianteMenu>(PADRAO)
  const [montado, definirMontado] = useState(false)

  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE_STORAGE) as VarianteMenu | null
    if (salvo && OPCOES_VARIANTE_MENU.some((o) => o.id === salvo)) {
      definirVarianteState(salvo)
    }
    definirMontado(true)
  }, [])

  const definirVariante = useCallback((v: VarianteMenu) => {
    definirVarianteState(v)
    localStorage.setItem(CHAVE_STORAGE, v)
  }, [])

  return (
    <MenuVarianteContext.Provider value={{ variante, definirVariante, montado }}>
      {children}
    </MenuVarianteContext.Provider>
  )
}

export function useMenuVariante() {
  const ctx = useContext(MenuVarianteContext)
  if (!ctx) throw new Error('useMenuVariante deve estar dentro de MenuVarianteProvider')
  return ctx
}
