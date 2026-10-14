'use client'

import { Suspense, useEffect, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { Botao } from '@/components/vig/Botao'
import { Campo } from '@/components/vig/Campo'
import { CampoSenha } from '@/components/vig/CampoSenha'
import { Cartao } from '@/components/vig/Cartao'
import { AuthGoogleBotao } from '@/components/auth/AuthGoogleBotao'
import { cadastrarComEmail } from '@/lib/auth/acoes'
import { entrarComGoogleNoCliente } from '@/lib/auth/google-cliente'
import { ROTAS } from '@/lib/rotas'

function FormularioCadastroInterno() {
  const parametros = useSearchParams()
  const [nome, definirNome] = useState('')
  const [email, definirEmail] = useState('')
  const [senha, definirSenha] = useState('')
  const [confirmarSenha, definirConfirmarSenha] = useState('')
  const [erro, definirErro] = useState('')
  const [pendente, iniciarTransicao] = useTransition()

  useEffect(() => {
    const e = parametros.get('email')
    if (e) definirEmail(e)
  }, [parametros])

  function aoLoginGoogle() {
    definirErro('')
    iniciarTransicao(async () => {
      const resultado = await entrarComGoogleNoCliente()
      if (resultado?.erro) definirErro(resultado.erro)
    })
  }

  function aoEnviar(e: React.FormEvent) {
    e.preventDefault()
    definirErro('')

    if (senha !== confirmarSenha) {
      definirErro('As senhas não coincidem.')
      return
    }

    if (senha.length < 8) {
      definirErro('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    iniciarTransicao(async () => {
      const resultado = await cadastrarComEmail(email, senha, nome)
      if (resultado?.erro) definirErro(resultado.erro)
    })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Cartao className="vig-auth-card">
        <div className="vig-auth-card-topo">
          <h1>Ativar conta</h1>
          <p>Use o e-mail autorizado. Ao criar a conta, você já entra automaticamente.</p>
        </div>

        <AuthGoogleBotao pendente={pendente} onClick={aoLoginGoogle} />

        <div className="vig-auth-separador">
          <span>ou defina uma senha</span>
        </div>

        <form onSubmit={aoEnviar} className="flex flex-col gap-4">
          <Campo rotulo="Nome completo" value={nome} onChange={(e) => definirNome(e.target.value)} placeholder="Seu nome" required />
          <Campo rotulo="E-mail" type="email" value={email} onChange={(e) => definirEmail(e.target.value)} placeholder="seu@email.com" required />
          <CampoSenha rotulo="Senha" value={senha} onChange={(e) => definirSenha(e.target.value)} placeholder="Mínimo 8 caracteres" required />
          <CampoSenha rotulo="Confirmar senha" value={confirmarSenha} onChange={(e) => definirConfirmarSenha(e.target.value)} placeholder="Repita a senha" required />

          {erro && (
            <div className="vig-auth-erro" role="alert">
              {erro}
            </div>
          )}

          <Botao type="submit" variante="primario" className="w-full mt-1" disabled={pendente} filho="Criar conta" />
        </form>

        <p className="vig-auth-rodape">
          Já tem conta? <a href={ROTAS.auth.entrar}>Entrar</a>
        </p>
      </Cartao>
    </div>
  )
}

/** Cadastro com convite; e-mail pode vir de /cadastro?email= */
export function FormularioCadastro() {
  return (
    <Suspense fallback={<div className="vig-auth-loading">Carregando…</div>}>
      <FormularioCadastroInterno />
    </Suspense>
  )
}
