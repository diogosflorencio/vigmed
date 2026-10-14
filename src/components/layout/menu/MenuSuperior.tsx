'use client'

import { BarraNavegacaoMobile } from '@/components/layout/BarraNavegacaoMobile'
import type { ItemNavegacao } from '@/lib/navegacao'
import type { AmbienteApp } from '@/lib/ambiente'
import type { Perfil } from '@/types'

interface Props {
  itens: ItemNavegacao[]
  ambiente: AmbienteApp
  perfil: Perfil
}

/** Menu fixo no topo, barra horizontal com dropdowns */
export function MenuSuperior(props: Props) {
  return <BarraNavegacaoMobile {...props} />
}
