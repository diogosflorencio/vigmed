'use client'

import { useTheme } from '@/contexts/ThemeContext'
import type { ModoTema } from '@/lib/tema/tipos'
import { Cartao } from '@/components/vig/Cartao'
import { ChipSeletor } from '@/components/vig/ChipSeletor'
import { SeletorTemaVisual } from '@/components/perfil/SeletorTemaVisual'
import { SeletorModeloMenu } from '@/components/perfil/SeletorModeloMenu'

const MODOS: { id: ModoTema; rotulo: string }[] = [
  { id: 'light', rotulo: 'Claro' },
  { id: 'dark', rotulo: 'Escuro' },
  { id: 'system', rotulo: 'Sistema' },
]

/** Seletor de aparência: modo, tema visual e layout do menu */
export function ConfiguracaoAparencia() {
  const { modo, definirModo, montado } = useTheme()

  if (!montado) return null

  return (
    <Cartao
      titulo="Aparência"
      descricao="Modo, tema e posição do menu."
    >
      <div className="vig-config-aparencia">
        <section className="vig-config-bloco">
          <p className="vig-config-rotulo">Modo de cor</p>
          <ChipSeletor
            rotulo="Modo de cor"
            valor={modo}
            aoMudar={definirModo}
            opcoes={MODOS.map((item) => ({
              id: item.id,
              rotulo: item.rotulo,
            }))}
          />
        </section>

        <section className="vig-config-bloco">
          <p className="vig-config-rotulo">Tema do painel</p>
          <SeletorTemaVisual />
        </section>

        <section className="vig-config-bloco">
          <p className="vig-config-rotulo">Modelo do menu</p>
          <SeletorModeloMenu />
        </section>
      </div>
    </Cartao>
  )
}
