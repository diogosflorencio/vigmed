'use client'

import { useEffect, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { Botao } from '@/components/vig/Botao'
import { Campo } from '@/components/vig/Campo'
import { Cartao } from '@/components/vig/Cartao'
import { AuthGoogleBotao } from '@/components/auth/AuthGoogleBotao'
import { entrarComEmail } from '@/lib/auth/acoes'
import { entrarComGoogleNoCliente } from '@/lib/auth/google-cliente'
import { ROTAS } from '@/lib/rotas'
import { cn } from '@/lib/utils'

interface PropsFormularioLogin {
  titulo?: string
  subtitulo?: string
  permitirCadastro?: boolean
}

/** Formulário de login com componentes VIGMED */
export function FormularioLogin({
  titulo = 'Entrar',
  subtitulo = 'Use o e-mail liberado pelo administrador',
  permitirCadastro = false,
}: PropsFormularioLogin) {
  const [email, definirEmail] = useState('')
  const [senha, definirSenha] = useState('')
  const [mostrarSenha, definirMostrarSenha] = useState(false)
  const [erro, definirErro] = useState('')
  const [pendente, iniciarTransicao] = useTransition()
  const parametros = useSearchParams()

  useEffect(() => {
    const codigo = parametros.get('erro')
    const msg = parametros.get('msg')
    if (codigo === 'sem_acesso') {
      definirErro('Sua conta não tem acesso. Use o e-mail do convite ou fale com o administrador.')
    } else if (codigo === 'oauth' && msg) {
      definirErro(decodeURIComponent(msg))
    } else if (codigo === 'auth') {
      definirErro('Não foi possível concluir o login. Tente novamente.')
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto"
    >
      <Cartao className="vig-auth-card">
        <div className="vig-auth-card-topo">
          <h1>{titulo}</h1>
          <p>{subtitulo}</p>
        </div>

        <AuthGoogleBotao pendente={pendente} onClick={aoLoginGoogle} />

        <div className="vig-auth-separador">
          <span>ou</span>
        </div>

        <form onSubmit={aoEnviar} className="flex flex-col gap-4">
          <Campo
            rotulo="E-mail"
            type="email"
            value={email}
            onChange={(e) => definirEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            autoComplete="email"
          />

          <div className="relative">
            <Campo
              rotulo="Senha"
              type={mostrarSenha ? 'text' : 'password'}
              value={senha}
              onChange={(e) => definirSenha(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => definirMostrarSenha(!mostrarSenha)}
              className="absolute right-3 top-[2.05rem] text-[var(--color-text-3)] hover:text-[var(--color-text-2)]"
              aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {mostrarSenha ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {erro && <p className="vig-campo-erro text-center">{erro}</p>}

          <Botao type="submit" variante="primario" className="w-full mt-1" disabled={pendente} filho="Entrar" />
        </form>

        {permitirCadastro && (
          <p className="vig-auth-rodape">
            Foi convidado?{' '}
            <a href={ROTAS.auth.cadastro}>Ativar conta</a>
          </p>
        )}

        <p className={cn('vig-auth-rodape', !permitirCadastro && 'mt-4')}>
          <a href={ROTAS.auth.recuperar}>Esqueceu a senha?</a>
        </p>
      </Cartao>
    </motion.div>
  )
}
