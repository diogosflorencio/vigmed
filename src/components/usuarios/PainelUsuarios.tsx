'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Mail, UserPlus } from 'lucide-react'
import { Button, Input, Badge } from '@/components/ui'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel } from '@/components/layout/SecaoPainel'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { convidarUsuario } from '@/lib/usuarios/acoes'
import { ROTULO_PAPEL } from '@/lib/usuarios/constantes'
import type { PapelUsuario } from '@/types'
import type { AmbienteConvite } from '@/lib/auth/convites'
import toast from 'react-hot-toast'

interface ConviteComEmpresa {
  id: string
  email: string
  nome_completo: string
  papel: PapelUsuario
  ambiente: AmbienteConvite
  usado_em: string | null
  criado_em: string
  empresas?: { nome_fantasia: string } | { nome_fantasia: string }[] | null
}

function nomeEmpresa(empresas: ConviteComEmpresa['empresas']): string | undefined {
  if (!empresas) return undefined
  if (Array.isArray(empresas)) return empresas[0]?.nome_fantasia
  return empresas.nome_fantasia
}

interface PerfilResumo {
  id: string
  email: string
  nome_completo: string
  papel: PapelUsuario
  ativo: boolean
  ultimo_login_em: string | null
  empresas?: { nome_fantasia: string } | { nome_fantasia: string }[] | null
}

interface EmpresaResumo {
  id: string
  nome_fantasia: string
}

interface Props {
  convites: ConviteComEmpresa[]
  perfis: PerfilResumo[]
  empresas: EmpresaResumo[]
}

export function PainelUsuarios({ convites, perfis, empresas }: Props) {
  const [email, definirEmail] = useState('')
  const [nome, definirNome] = useState('')
  const [papel, definirPapel] = useState<PapelUsuario>('usuario_empresa')
  const [ambiente, definirAmbiente] = useState<AmbienteConvite>('docs')
  const [empresaId, definirEmpresaId] = useState('')
  const [pendente, iniciarTransicao] = useTransition()

  function aoConvidar(e: React.FormEvent) {
    e.preventDefault()
    iniciarTransicao(async () => {
      const resultado = await convidarUsuario({
        email, nomeCompleto: nome, papel, ambiente,
        empresaId: ambiente === 'docs' ? empresaId || null : null,
      })
      if (resultado.erro) { toast.error(resultado.erro); return }
      toast.success(resultado.mensagem ?? 'Convite criado!')
      definirEmail('')
      definirNome('')
    })
  }

  return (
    <SecaoPainel>
      <CabecalhoPagina
        titulo="Usuários"
        descricao="Convide usuários e gerencie acessos à plataforma."
      />

      <RevelarScroll>
        <div className="painel-form-lateral">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <UserPlus size={16} style={{ color: 'var(--color-text-2)' }} />
            <span className="painel-form-titulo">Novo convite</span>
          </div>

          <p style={{ fontSize: '0.77rem', color: 'var(--color-text-3)', marginTop: '-0.4rem' }}>
            O convidado receberá um e-mail com o link para ativar o acesso.
          </p>

          <form onSubmit={aoConvidar} className="grid gap-3 sm:grid-cols-2">
            <Input label="E-mail" type="email" value={email} onChange={(e) => definirEmail(e.target.value)} placeholder="usuario@empresa.com" required />
            <Input label="Nome (opcional)" value={nome} onChange={(e) => definirNome(e.target.value)} placeholder="Nome completo" />

            <div className="painel-campo">
              <label className="painel-label">Ambiente</label>
              <select
                className="painel-select"
                style={{ width: '100%' }}
                value={ambiente}
                onChange={(e) => {
                  const novo = e.target.value as AmbienteConvite
                  definirAmbiente(novo)
                  if (novo === 'adm') definirPapel('administrador')
                  else definirPapel('usuario_empresa')
                }}
              >
                <option value="docs">Portal docs (empresas)</option>
                <option value="adm">Painel administrativo</option>
              </select>
            </div>

            <div className="painel-campo">
              <label className="painel-label">Papel</label>
              <select className="painel-select" style={{ width: '100%' }} value={papel} onChange={(e) => definirPapel(e.target.value as PapelUsuario)}>
                {ambiente === 'adm' ? (
                  <option value="administrador">Administrador do sistema</option>
                ) : (
                  <>
                    <option value="usuario_empresa">Usuário empresa</option>
                    <option value="administrador_empresa">Administrador empresa</option>
                  </>
                )}
              </select>
            </div>

            {ambiente === 'docs' && (
              <div className="painel-campo sm:col-span-2">
                <label className="painel-label">Empresa</label>
                <select className="painel-select" style={{ width: '100%' }} value={empresaId} onChange={(e) => definirEmpresaId(e.target.value)} required>
                  <option value="">Selecione a empresa</option>
                  {empresas.map((e) => <option key={e.id} value={e.id}>{e.nome_fantasia}</option>)}
                </select>
              </div>
            )}

            <div className="sm:col-span-2">
              <Button type="submit" variant="primary" size="sm" loading={pendente}>
                <Mail size={14} />
                Autorizar e-mail
              </Button>
            </div>
          </form>
        </div>
      </RevelarScroll>

      <RevelarScroll atraso={0.06}>
        <div className="painel-tabela-wrap">
          <div style={{ padding: '0.65rem 0.85rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-2)' }}>
            Convites recentes
          </div>
          {convites.length === 0 ? (
            <div className="painel-vazio">Nenhum convite ainda.</div>
          ) : (
            <div>
              {convites.map((c) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '0.6rem 0.85rem', borderBottom: '1px solid var(--color-border)' }}
                  className="last:border-0">
                  <div>
                    <p className="tabela-nome" style={{ maxWidth: 'none' }}>{c.email}</p>
                    <p className="tabela-sub">{ROTULO_PAPEL[c.papel]} · {c.ambiente}{nomeEmpresa(c.empresas) ? ` · ${nomeEmpresa(c.empresas)}` : ''}</p>
                  </div>
                  {c.usado_em ? (
                    <Badge variant="success" className="text-[10px] shrink-0">
                      <CheckCircle2 size={10} className="mr-1" /> Ativado
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="text-[10px] shrink-0">Pendente</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </RevelarScroll>

      <RevelarScroll atraso={0.09}>
        <div className="painel-tabela-wrap">
          <div style={{ padding: '0.65rem 0.85rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-2)' }}>
            Usuários cadastrados
          </div>
          {perfis.length === 0 ? (
            <div className="painel-vazio">Nenhum usuário ainda.</div>
          ) : (
            <div>
              {perfis.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '0.6rem 0.85rem', borderBottom: '1px solid var(--color-border)' }}
                  className="last:border-0">
                  <div>
                    <p className="tabela-nome" style={{ maxWidth: 'none' }}>{p.nome_completo || p.email}</p>
                    <p className="tabela-sub">{p.email} · {ROTULO_PAPEL[p.papel]}</p>
                  </div>
                  <Badge variant={p.ativo ? 'success' : 'danger'} className="text-[10px] shrink-0">
                    {p.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </RevelarScroll>
    </SecaoPainel>
  )
}
