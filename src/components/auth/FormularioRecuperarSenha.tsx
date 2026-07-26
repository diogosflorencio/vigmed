'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { Button, Input, Card, CardContent } from '@/components/ui'
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-sm mx-auto"
    >
      <Card className="p-6">
        <CardContent className="p-0">
          <div className="mb-8 text-center">
            <h1 className="text-xl font-semibold">Recuperar senha</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enviaremos um link para redefinir sua senha
            </p>
          </div>

          {enviado ? (
            <p className="text-center text-sm text-muted-foreground">
              Verifique sua caixa de entrada em <strong>{email}</strong>.
            </p>
          ) : (
            <form onSubmit={aoEnviar} className="flex flex-col gap-4">
              <Input label="E-mail" type="email" value={email} onChange={(e) => definirEmail(e.target.value)} placeholder="seu@email.com" required />
              <Button type="submit" variant="primary" className="w-full" loading={pendente}>
                <Mail size={15} />
                Enviar link
              </Button>
            </form>
          )}

          <p className="mt-6 text-center">
            <a href={ROTAS.auth.entrar} className="text-xs text-muted-foreground hover:text-foreground">
              Voltar ao login
            </a>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
