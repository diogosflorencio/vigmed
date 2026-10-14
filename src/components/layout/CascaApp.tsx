'use client'

import type { ReactNode } from 'react'
import { AnimacaoPaginaPainel } from '@/components/layout/AnimacaoPaginaPainel'
import { FundoPainel } from '@/components/layout/FundoPainel'
import { NavegacaoApp } from '@/components/layout/NavegacaoApp'
import { PaletaComando } from '@/components/layout/PaletaComando'
import { ProvedorPaletaComando } from '@/contexts/PaletaComandoContext'
import { ProvedorNotificacoesPortal } from '@/contexts/NotificacoesPortalContext'
import type { NotificacoesPortalState } from '@/contexts/NotificacoesPortalContext'
import { useTheme } from '@/contexts/ThemeContext'
import { obterNavegacao } from '@/lib/navegacao'
import type { Perfil } from '@/types'
import type { AmbienteApp } from '@/lib/ambiente'
import { SincronizarAparencia } from '@/components/perfil/SincronizarAparencia'
import { PrefetchPainel } from '@/components/layout/PrefetchPainel'
import { cn } from '@/lib/utils'

interface PropsCascaApp {
  children: ReactNode
  ambiente: AmbienteApp
  perfil: Perfil
  notificacoes?: NotificacoesPortalState
  /** @deprecated use notificacoes */
  mensagensNaoLidas?: number
}

/** Shell do painel, layout adaptável conforme preferência do usuário */
export function CascaApp({
  children,
  ambiente,
  perfil,
  notificacoes,
  mensagensNaoLidas = 0,
}: PropsCascaApp) {
  const inicial: NotificacoesPortalState = notificacoes ?? {
    mensagens: mensagensNaoLidas,
    comunicados: 0,
    documentosAlerta: 0,
    convitesPendentes: 0,
    retencaoPendente: 0,
  }
  const { modeloMenu } = useTheme()
  const itens = obterNavegacao(ambiente, perfil.papel)

  const classeShell = cn(
    'app-shell',
    modeloMenu === 'dock' && 'app-shell--menu-dock',
    modeloMenu === 'lateral' && 'app-shell--menu-lateral',
    modeloMenu === 'direita' && 'app-shell--menu-direita',
    modeloMenu === 'superior' && 'app-shell--menu-superior',
  )

  return (
    <ProvedorPaletaComando>
      <ProvedorNotificacoesPortal
        inicial={inicial}
        ambiente={ambiente === 'docs' ? 'docs' : 'adm'}
      >
        <div className={classeShell}>
          <SincronizarAparencia perfil={perfil} />
          <PrefetchPainel ambiente={ambiente} />
          <FundoPainel />
          <PaletaComando itens={itens} ambiente={ambiente === 'docs' ? 'docs' : 'adm'} />

          {/* Esquerda/superior antes do main; direita/dock depois (ordem do grid). */}
          {(modeloMenu === 'superior' || modeloMenu === 'lateral') && (
            <NavegacaoApp itens={itens} ambiente={ambiente} perfil={perfil} />
          )}

          <main id="conteudo-principal" className="app-shell-conteudo" tabIndex={-1}>
            <a href="#conteudo-principal" className="app-pular-conteudo">
              Pular para o conteúdo
            </a>
            <div className="app-shell-pagina">
              <AnimacaoPaginaPainel>{children}</AnimacaoPaginaPainel>
            </div>
          </main>

          {(modeloMenu === 'dock' || modeloMenu === 'direita') && (
            <NavegacaoApp itens={itens} ambiente={ambiente} perfil={perfil} />
          )}
        </div>
      </ProvedorNotificacoesPortal>
    </ProvedorPaletaComando>
  )
}
