'use client'

import { useEffect, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeSlash } from '@phosphor-icons/react'
import { AuthGoogleBotao } from '@/components/auth/AuthGoogleBotao'
import { entrarComEmail } from '@/lib/auth/acoes'
import { entrarComGoogleNoCliente } from '@/lib/auth/google-cliente'
import { ROTAS } from '@/lib/rotas'

interface PropsFormularioLogin {
  titulo?: string
  subtitulo?: string
  permitirCadastro?: boolean
}

/** Formulário de login com layout próprio da área auth. */
export function FormularioLogin({
  titulo = 'Entrar',
  subtitulo = 'Use o e-mail liberado pelo administrador',
  permitirCadastro = false,
}: PropsFormularioLogin) {
  const [email, definirEmail] = useState('')
  const [senha, definirSenha] = useState('')
  const [senhaVisivel, definirSenhaVisivel] = useState(false)
  const [erro, definirErro] = useState('')
  const [pendente, iniciarTransicao] = useTransition()
  const parametros = useSearchParams()

  useEffect(() => {
    const e = parametros.get('email')
    if (e) definirEmail(decodeURIComponent(e))
  }, [parametros])

  useEffect(() => {
    const codigo = parametros.get('erro')
    const msg = parametros.get('msg')
    if (codigo === 'sem_acesso') {
      definirErro('Sua conta não tem acesso. Use o e-mail do convite ou fale com o administrador.')
    } else if (codigo === 'oauth' && msg) {
      definirErro(decodeURIComponent(msg))
    } else if (codigo === 'auth') {
      definirErro(
        msg
          ? decodeURIComponent(msg)
          : 'Não foi possível concluir o login. Tente novamente.',
      )
    }
  }, [parametros])

  function aoEnviar(e: React.FormEvent) {
    e.preventDefault()
    definirErro('')

    iniciarTransicao(async () => {
      const redirect = parametros.get('redirect') ?? undefined
      const ambiente = parametros.get('ambiente') ?? undefined
      const resultado = await entrarComEmail(email, senha, { redirect, ambiente })
      if (resultado?.erro) definirErro(resultado.erro)
    })
  }

  function aoLoginGoogle() {
    definirErro('')
    iniciarTransicao(async () => {
      const resultado = await entrarComGoogleNoCliente()
      if (resultado?.erro) definirErro(resultado.erro)
    })
  }

  return (
    <div className="vm-auth-card">
      <header className="vm-auth-card-topo">
        <h1>{titulo}</h1>
        <p>{subtitulo}</p>
      </header>

      <AuthGoogleBotao
        pendente={pendente}
        onClick={aoLoginGoogle}
        className="vm-auth-btn vm-auth-btn--ghost"
      />

      <div className="vm-auth-separador">
        <span>ou</span>
      </div>

      <form onSubmit={aoEnviar} className="vm-auth-form">
        <label className="vm-auth-field">
          <span className="vm-auth-field-label">E-mail</span>
          <input
            className="vm-auth-input"
            type="email"
            value={email}
            onChange={(e) => definirEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            autoComplete="email"
          />
        </label>

        <label className="vm-auth-field">
          <span className="vm-auth-field-label">Senha</span>
          <span className="vm-auth-input-wrap">
            <input
              className="vm-auth-input"
              type={senhaVisivel ? 'text' : 'password'}
              value={senha}
              onChange={(e) => definirSenha(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="vm-auth-olho"
              onClick={() => definirSenhaVisivel((v) => !v)}
              aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {senhaVisivel ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
            </button>
          </span>
        </label>

        {erro ? (
          <div className="vm-auth-erro" role="alert">
            {erro}
          </div>
        ) : null}

        <button type="submit" className="vm-auth-btn vm-auth-btn--solid" disabled={pendente}>
          {pendente ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <div className="vm-auth-links">
        {permitirCadastro ? (
          <p>
            Foi convidado? <a href={ROTAS.auth.cadastro}>Ativar conta</a>
          </p>
        ) : null}
        <p>
          <a href={ROTAS.auth.recuperar}>Esqueceu a senha?</a>
        </p>
      </div>
    </div>
  )
}
