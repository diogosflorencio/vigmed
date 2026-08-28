'use client'

import { useTheme } from '@/contexts/ThemeContext'
import type { ModoTema } from '@/lib/tema/tipos'
import { Cartao } from '@/components/vig/Cartao'
import { ChipSeletor } from '@/components/vig/ChipSeletor'
import { IconeAnimado } from '@/components/ui/icone-animado'
import { SeletorTemaVisual } from '@/components/perfil/SeletorTemaVisual'
import { SeletorModeloMenu } from '@/components/perfil/SeletorModeloMenu'
import type { NomeIcone } from '@/lib/icones-animados'

const MODOS: { id: ModoTema; rotulo: string; icone: NomeIcone }[] = [
  { id: 'light', rotulo: 'Claro', icone: 'sun' },
  { id: 'dark', rotulo: 'Escuro', icone: 'moon' },
  { id: 'system', rotulo: 'Sistema', icone: 'monitor' },
]

/** Seletor de aparência: modo, tema visual e layout do menu */
export function ConfiguracaoAparencia() {
  const { modo, definirModo, montado } = useTheme()

  if (!montado) return null

  return (
    <Cartao
      titulo="Aparência"
      descricao="Personalize cores, contraste e o layout de navegação do painel."
      destaque
    >
      <div className="space-y-6">
        <div className="space-y-2.5">
          <p className="text-xs uppercase tracking-wider text-[var(--color-text-3)] font-medium">Modo</p>
          <ChipSeletor
            valor={modo}
            aoMudar={definirModo}
            opcoes={MODOS.map((item) => ({
              id: item.id,
              rotulo: item.rotulo,
              icone: <IconeAnimado nome={item.icone} tamanho={15} />,
            }))}
          />
        </div>

        <div className="space-y-2.5">
          <p className="text-xs uppercase tracking-wider text-[var(--color-text-3)] font-medium">Tema do painel</p>
          <SeletorTemaVisual />
        </div>

        <div className="space-y-2.5">
          <p className="text-xs uppercase tracking-wider text-[var(--color-text-3)] font-medium">Modelo do menu</p>
          <SeletorModeloMenu />
        </div>
      </div>
    </Cartao>
  )
}
