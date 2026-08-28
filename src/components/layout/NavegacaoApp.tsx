'use client'

import { MenuDock } from '@/components/layout/menu/MenuDock'
import { MenuVarianteLateral } from '@/components/layout/menu/MenuVarianteLateral'
import { MenuSuperior } from '@/components/layout/menu/MenuSuperior'
import { useTheme } from '@/contexts/ThemeContext'
import type { ItemNavegacao } from '@/lib/navegacao'
import type { AmbienteApp } from '@/lib/ambiente'
import type { Perfil } from '@/types'

interface Props {
  itens: ItemNavegacao[]
  ambiente: AmbienteApp
  perfil: Perfil
}

/** Navegação principal do painel, dock, lateral ou superior */
export function NavegacaoApp(props: Props) {
  const { modeloMenu } = useTheme()

  if (modeloMenu === 'lateral') return <MenuVarianteLateral {...props} />
  if (modeloMenu === 'superior') return <MenuSuperior {...props} />
  return <MenuDock {...props} />
}
