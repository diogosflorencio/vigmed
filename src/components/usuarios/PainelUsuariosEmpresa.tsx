'use client'

import { useState, useTransition } from 'react'
import { UserPlus, Mail, Clock, CheckCircle2 } from 'lucide-react'
import { Button, Input, Card, CardContent, Badge } from '@/components/ui'
import { convidarUsuario } from '@/lib/usuarios/acoes'
import { ROTULO_PAPEL } from '@/lib/usuarios/constantes'
import type { PapelUsuario } from '@/types'
import toast from 'react-hot-toast'

interface ConviteResumo {
  id: string
  email: string
  nome_completo: string
  papel: PapelUsuario
  usado_em: string | null
  criado_em: string
}

interface PerfilResumo {
  id: string
  email: string
  nome_completo: string
  papel: PapelUsuario
  ativo: boolean
  ultimo_login_em: string | null
}

interface Props {
  convites: ConviteResumo[]
  perfis: PerfilResumo[]
  nomeEmpresa: string
}

/** Convites de acesso à empresa - visível só para administrador_empresa */
export function PainelUsuariosEmpresa({ convites, perfis, nomeEmpresa }: Props) {
  const [email, definirEmail] = useState('')
  const [nome, definirNome] = useState('')
  const [pendente, iniciarTransicao] = useTransition()

  function aoConvidar(e: React.FormEvent) {
    e.preventDefault()

    iniciarTransicao(async () => {
      const resultado = await convidarUsuario({
        email,
        nomeCompleto: nome,
        papel: 'usuario_empresa',
        ambiente: 'docs',
      })

      if (resultado.erro) {
        toast.error(resultado.erro)
        return
      }

      toast.success(resultado.mensagem ?? 'E-mail autorizado!')
      definirEmail('')
      definirNome('')
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground -mt-2">
        O convidado receberá um e-mail do Supabase com o link para ativar o acesso a{' '}
        <strong>{nomeEmpresa}</strong>.
      </p>

      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <UserPlus size={16} />
            Autorizar e-mail
          </h2>

          <form onSubmit={aoConvidar} className="grid gap-4 sm:grid-cols-2">
            <Input label="E-mail" type="email" value={email} onChange={(e) => definirEmail(e.target.value)} placeholder="colaborador@empresa.com" required />
            <Input label="Nome (opcional)" value={nome} onChange={(e) => definirNome(e.target.value)} placeholder="Nome completo" />
            <div className="sm:col-span-2">
              <Button type="submit" variant="primary" loading={pendente}>
                <Mail size={15} />
                Autorizar acesso
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Clock size={16} />
            Convites
          </h2>
          {convites.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum convite ainda.</p>
          ) : (
            <ul className="divide-y divide-border">
              {convites.map((c) => (
                <li key={c.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{c.email}</p>
                    {c.nome_completo && <p className="text-xs text-muted-foreground">{c.nome_completo}</p>}
                  </div>
                  {c.usado_em ? (
                    <Badge variant="success" className="text-[10px]">
                      <CheckCircle2 size={10} className="mr-1" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="text-[10px]">Aguardando 1º acesso</Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold mb-3">Equipe com acesso</h2>
          {perfis.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum usuário vinculado.</p>
          ) : (
            <ul className="divide-y divide-border">
              {perfis.map((p) => (
                <li key={p.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{p.nome_completo || p.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.email} · {ROTULO_PAPEL[p.papel]}
                    </p>
                  </div>
                  <Badge variant={p.ativo ? 'success' : 'danger'} className="text-[10px]">
                    {p.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
