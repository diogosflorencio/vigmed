'use client'

import type { ReactNode } from 'react'
import { FundoPainel } from '@/components/layout/FundoPainel'
import { NavegacaoApp } from '@/components/layout/NavegacaoApp'
import { ProvedorMensagensNaoLidas } from '@/contexts/MensagensNaoLidasContext'
import { useTheme } from '@/contexts/ThemeContext'
import { obterNavegacao } from '@/lib/navegacao'
import type { Perfil } from '@/types'
import type { AmbienteApp } from '@/lib/ambiente'
import { SincronizarAparencia } from '@/components/perfil/SincronizarAparencia'
import { cn } from '@/lib/utils'

interface PropsCascaApp {
  children: ReactNode
  ambiente: AmbienteApp
  perfil: Perfil
  mensagensNaoLidas?: number
}

/** Shell do painel, layout adaptável conforme preferência do usuário */
export function CascaApp({ children, ambiente, perfil, mensagensNaoLidas = 0 }: PropsCascaApp) {
  const { modeloMenu } = useTheme()
  const itens = obterNavegacao(ambiente, perfil.papel)

  const classeShell = cn(
    'app-shell',
    modeloMenu === 'dock' && 'app-shell--menu-dock',
    modeloMenu === 'lateral' && 'app-shell--menu-lateral',
    modeloMenu === 'superior' && 'app-shell--menu-superior',
  )

  return (
    <ProvedorMensagensNaoLidas inicial={mensagensNaoLidas}>
      <div className={classeShell}>
        <SincronizarAparencia perfil={perfil} />
        <FundoPainel />

        {modeloMenu === 'superior' && (
          <NavegacaoApp itens={itens} ambiente={ambiente} perfil={perfil} />
        )}

        <main className="app-shell-conteudo">
          <div className="app-shell-pagina animate-fade-in">{children}</div>
        </main>

        {modeloMenu !== 'superior' && (
          <NavegacaoApp itens={itens} ambiente={ambiente} perfil={perfil} />
        )}
      </div>
    </ProvedorMensagensNaoLidas>
  )
}
