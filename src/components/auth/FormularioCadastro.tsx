'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { UserPlus } from 'lucide-react'
import { Button, Input, Card, CardContent } from '@/components/ui'
import { cadastrarComEmail } from '@/lib/auth/acoes'
import { ROTAS } from '@/lib/rotas'
import toast from 'react-hot-toast'

/** Cadastro com convite — e-mail deve estar autorizado previamente */
export function FormularioCadastro() {
  const [nome, definirNome] = useState('')
  const [email, definirEmail] = useState('')
  const [senha, definirSenha] = useState('')
  const [confirmarSenha, definirConfirmarSenha] = useState('')
  const [erro, definirErro] = useState('')
  const [pendente, iniciarTransicao] = useTransition()

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
      if (resultado?.erro) {
        definirErro(resultado.erro)
      } else if (resultado?.sucesso) {
        toast.success(resultado.mensagem ?? 'Cadastro realizado!')
      }
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-sm mx-auto"
    >
      <Card className="p-6">
        <CardContent className="p-0">
          <div className="mb-8 text-center">
            <h1 className="text-xl font-semibold">Ativar conta</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Use o e-mail autorizado. Entre com Google ou defina sua senha aqui.
            </p>
          </div>

          <form onSubmit={aoEnviar} className="flex flex-col gap-4">
            <Input label="Nome completo" value={nome} onChange={(e) => definirNome(e.target.value)} placeholder="Seu nome" required />
            <Input label="E-mail" type="email" value={email} onChange={(e) => definirEmail(e.target.value)} placeholder="seu@email.com" required />
            <Input label="Senha" type="password" value={senha} onChange={(e) => definirSenha(e.target.value)} placeholder="Mínimo 8 caracteres" required />
            <Input label="Confirmar senha" type="password" value={confirmarSenha} onChange={(e) => definirConfirmarSenha(e.target.value)} placeholder="Repita a senha" required />

            {erro && <p className="text-xs text-destructive text-center">{erro}</p>}

            <Button type="submit" variant="primary" className="w-full mt-1" loading={pendente}>
              <UserPlus size={15} />
              Criar conta
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Já tem conta?{' '}
            <a href={ROTAS.auth.entrar} className="font-medium text-foreground underline-offset-2 hover:underline">
              Entrar
            </a>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
