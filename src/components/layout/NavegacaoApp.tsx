'use client'

import { MenuDock } from '@/components/layout/menu/MenuDock'
import type { ItemNavegacao } from '@/lib/navegacao'
import type { AmbienteApp } from '@/lib/ambiente'
import type { Perfil } from '@/types'

interface Props {
  itens: ItemNavegacao[]
  ambiente: AmbienteApp
  perfil: Perfil
}

/** Navegação principal do painel - dock inferior */
export function NavegacaoApp(props: Props) {
  return <MenuDock {...props} />
}
