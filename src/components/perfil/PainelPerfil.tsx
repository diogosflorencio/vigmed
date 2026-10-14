'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel } from '@/components/layout/SecaoPainel'
import { ConfiguracaoAparencia } from '@/components/perfil/ConfiguracaoAparencia'
import { FormularioSenhaPerfil } from '@/components/perfil/FormularioSenhaPerfil'
import { Cartao } from '@/components/vig/Cartao'
import { Botao } from '@/components/vig/Botao'
import { Campo } from '@/components/vig/Campo'
import { Avatar } from '@/components/vig/Avatar'
import { useAcaoPendente } from '@/hooks/use-acao-pendente'
import { atualizarPerfil } from '@/lib/perfil/preferencias'
import type { Perfil } from '@/types'

interface Props {
  perfil: Perfil
}

export function PainelPerfil({ perfil }: Props) {
  const router = useRouter()
  const parametros = useSearchParams()
  const modoRecuperacao = parametros.get('redefinir') === '1'
  const { pendente, executar } = useAcaoPendente<'salvar'>()
  const [nome, definirNome] = useState(perfil.nome_completo)
  const [telefone, definirTelefone] = useState(perfil.telefone ?? '')

  function salvar() {
    void executar('salvar', async () => {
      const resultado = await atualizarPerfil({ nomeCompleto: nome, telefone })
      if (resultado.erro) {
        toast.error(resultado.erro)
        return
      }
      toast.success('Perfil atualizado.')
      router.refresh()
    })
  }

  return (
    <SecaoPainel>
      <CabecalhoPagina
        titulo="Meu perfil"
        descricao="Dados da conta e preferências do painel."
        rotulo="Conta"
      />

      {modoRecuperacao && (
        <div className="rounded-lg border border-[var(--vig-teal)] bg-[color-mix(in_srgb,var(--vig-teal)_8%,var(--color-surface))] px-4 py-3 text-sm text-[var(--color-text-2)]">
          Link de recuperação confirmado. Defina sua nova senha abaixo.
        </div>
      )}

      <div className="perfil-layout">
        <div className="perfil-layout-conta">
          <Cartao titulo="Dados pessoais" descricao="Nome e telefone usados no painel.">
            <div className="space-y-4">
              {perfil.url_avatar ? (
                <div className="flex items-center gap-3">
                  <Avatar nome={perfil.nome_completo} url={perfil.url_avatar} tamanho="lg" />
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--app-text)] truncate">{perfil.nome_completo}</p>
                    <p className="text-sm text-[var(--color-text-3)] capitalize">
                      {perfil.papel.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              ) : null}

              <Campo rotulo="Nome completo" value={nome} onChange={(e) => definirNome(e.target.value)} />
              <Campo rotulo="E-mail" value={perfil.email} disabled />
              <Campo rotulo="Telefone" value={telefone} onChange={(e) => definirTelefone(e.target.value)} />

              <Botao variante="primario" carregando={pendente('salvar')} onClick={salvar} filho="Salvar dados" />
            </div>
          </Cartao>

          <FormularioSenhaPerfil modoRecuperacao={modoRecuperacao} />
        </div>

        <ConfiguracaoAparencia />
      </div>
    </SecaoPainel>
  )
}
