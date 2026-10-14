'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import toast from 'react-hot-toast'
import { Botao } from '@/components/vig/Botao'
import { CampoSenha } from '@/components/vig/CampoSenha'
import { Cartao } from '@/components/vig/Cartao'
import { redefinirSenha } from '@/lib/auth/acoes'
import { useAcaoPendente } from '@/hooks/use-acao-pendente'

interface Props {
  modoRecuperacao?: boolean
}

/** Formulário de nova senha no perfil */
export function FormularioSenhaPerfil({ modoRecuperacao = false }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const { pendente, executar } = useAcaoPendente<'senha'>()
  const [novaSenha, definirNovaSenha] = useState('')
  const [confirmar, definirConfirmar] = useState('')

  function salvar() {
    void executar('senha', async () => {
      const resultado = await redefinirSenha(novaSenha, confirmar)
      if (resultado.erro) {
        toast.error(resultado.erro)
        return
      }
      toast.success('Senha atualizada.')
      definirNovaSenha('')
      definirConfirmar('')
      if (modoRecuperacao) {
        router.replace(pathname)
      }
    })
  }

  return (
    <Cartao
      titulo={modoRecuperacao ? 'Definir nova senha' : 'Alterar senha'}
      descricao={
        modoRecuperacao
          ? 'Escolha uma senha nova para concluir a recuperação.'
          : 'Use uma senha forte com pelo menos 8 caracteres.'
      }
    >
      <div className="space-y-4 max-w-md">
        <CampoSenha
          rotulo="Nova senha"
          value={novaSenha}
          onChange={(e) => definirNovaSenha(e.target.value)}
          autoComplete="new-password"
          minLength={8}
        />
        <CampoSenha
          rotulo="Confirmar senha"
          value={confirmar}
          onChange={(e) => definirConfirmar(e.target.value)}
          autoComplete="new-password"
          minLength={8}
        />
        <Botao
          variante="primario"
          carregando={pendente('senha')}
          onClick={salvar}
          filho="Salvar senha"
        />
      </div>
    </Cartao>
  )
}
