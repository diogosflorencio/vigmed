'use client'

import { useState, useTransition } from 'react'
import { Botao } from '@/components/vig/Botao'
import { Campo } from '@/components/vig/Campo'
import { Cartao } from '@/components/vig/Cartao'
import { solicitarRedefinicaoSenha } from '@/lib/auth/acoes'
import { ROTAS } from '@/lib/rotas'
import toast from 'react-hot-toast'

/** Solicita e-mail de redefinição de senha via Supabase Auth */
export function FormularioRecuperarSenha() {
  const [email, definirEmail] = useState('')
  const [enviado, definirEnviado] = useState(false)
  const [pendente, iniciarTransicao] = useTransition()

  function aoEnviar(e: React.FormEvent) {
    e.preventDefault()

    iniciarTransicao(async () => {
      const resultado = await solicitarRedefinicaoSenha(email)
      if (resultado?.erro) {
        toast.error(resultado.erro)
      } else {
        definirEnviado(true)
        toast.success('E-mail enviado!')
      }
    })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Cartao className="vig-auth-card">
        <div className="vig-auth-card-topo">
          <h1>Recuperar senha</h1>
          <p>Enviaremos um link para redefinir sua senha</p>
        </div>

        {enviado ? (
          <div className="vig-auth-sucesso">
            <span className="vig-auth-sucesso-ico" aria-hidden>
              ✉
            </span>
            <p>
              Verifique sua caixa de entrada em <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={aoEnviar} className="flex flex-col gap-4">
            <Campo
              rotulo="E-mail"
              type="email"
              value={email}
              onChange={(e) => definirEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
            <Botao type="submit" variante="primario" className="w-full" disabled={pendente} filho="Enviar link" />
          </form>
        )}

        <p className="vig-auth-rodape">
          <a href={ROTAS.auth.entrar}>Voltar ao login</a>
        </p>
      </Cartao>
    </div>
  )
}
