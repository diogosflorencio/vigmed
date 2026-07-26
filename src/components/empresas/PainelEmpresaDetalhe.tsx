'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, FolderOpen, Trash2, UserPlus } from 'lucide-react'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel } from '@/components/layout/SecaoPainel'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { Badge, Button, Input } from '@/components/ui'
import { excluirEmpresa, salvarEmpresa } from '@/lib/empresas/acoes'
import { convidarUsuario } from '@/lib/usuarios/acoes'
import { ROTULO_PAPEL } from '@/lib/usuarios/constantes'
import { ROTAS } from '@/lib/rotas'
import { formatarBytes, formatarCnpj } from '@/lib/utils'
import type { ConsumoArmazenamentoEmpresa } from '@/lib/documentos/armazenamento'
import type { Empresa, PapelUsuario, StatusEmpresa } from '@/types'

interface UsuarioResumo {
  id: string
  email: string
  nome_completo: string
  papel: PapelUsuario
  ativo: boolean
  ultimo_login_em: string | null
}

interface ConviteResumo {
  id: string
  email: string
  nome_completo: string
  papel: PapelUsuario
  usado_em: string | null
  criado_em: string
}

interface Props {
  empresa: Empresa
  consumo: ConsumoArmazenamentoEmpresa
  perfis: UsuarioResumo[]
  convites: ConviteResumo[]
}

export function PainelEmpresaDetalhe({ empresa, consumo, perfis, convites }: Props) {
  const router = useRouter()
  const [pendente, iniciarTransicao] = useTransition()
  const [form, definirForm] = useState({
    razaoSocial: empresa.razao_social,
    nomeFantasia: empresa.nome_fantasia,
    cnpj: empresa.cnpj,
    email: empresa.email,
    telefone: empresa.telefone ?? '',
    responsavel: empresa.responsavel ?? '',
    status: empresa.status,
  })
  const [emailConvite, definirEmailConvite] = useState('')
  const [nomeConvite, definirNomeConvite] = useState('')

  function salvar() {
    iniciarTransicao(async () => {
      const r = await salvarEmpresa({ id: empresa.id, ...form })
      if (r.erro) {
        toast.error(r.erro)
        return
      }
      toast.success('Empresa atualizada.')
      router.refresh()
    })
  }

  function convidar(e: React.FormEvent) {
    e.preventDefault()
    iniciarTransicao(async () => {
      const r = await convidarUsuario({
        email: emailConvite,
        nomeCompleto: nomeConvite,
        papel: 'usuario_empresa',
        ambiente: 'docs',
        empresaId: empresa.id,
      })
      if (r.erro) {
        toast.error(r.erro)
        return
      }
      toast.success(r.mensagem ?? 'Convite enviado.')
      definirEmailConvite('')
      definirNomeConvite('')
      router.refresh()
    })
  }

  function excluir() {
    if (!confirm(`Excluir a empresa "${empresa.nome_fantasia}"? Esta ação não pode ser desfeita.`)) return
    iniciarTransicao(async () => {
      const r = await excluirEmpresa(empresa.id)
      if (r.erro) {
        toast.error(r.erro)
        return
      }
      toast.success('Empresa excluída.')
      router.push(ROTAS.adm.empresas)
    })
  }

  return (
    <SecaoPainel>
      <div className="mb-4">
        <Link
          href={ROTAS.adm.empresas}
          className="inline-flex items-center gap-1 text-sm text-(--color-text-3) hover:text-(--color-text-1)"
        >
          <ArrowLeft size={14} />
          Voltar para empresas
        </Link>
      </div>

      <CabecalhoPagina
        titulo={empresa.nome_fantasia}
        descricao={`${formatarCnpj(empresa.cnpj)} · ${formatarBytes(consumo.total)} em arquivos`}
        acoes={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" render={<Link href={ROTAS.adm.empresaDocumentos(empresa.id)} />}>
              <FolderOpen size={14} />
              Documentos
            </Button>
            <Button variant="ghost" size="sm" className="text-(--color-danger)" onClick={excluir} loading={pendente}>
              <Trash2 size={14} />
              Excluir
            </Button>
          </div>
        }
      />

      <RevelarScroll>
        <div className="grid gap-3 sm:grid-cols-3 mb-6">
          <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
            <p className="text-xs text-(--color-text-3)">VIGMED</p>
            <p className="text-lg font-semibold">{formatarBytes(consumo.vigmed)}</p>
          </div>
          <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
            <p className="text-xs text-(--color-text-3)">Enviado pela empresa</p>
            <p className="text-lg font-semibold">{formatarBytes(consumo.empresa)}</p>
          </div>
          <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
            <p className="text-xs text-(--color-text-3)">Cota</p>
            <p className="text-lg font-semibold">{formatarBytes(empresa.armazenamento_limite)}</p>
          </div>
        </div>
      </RevelarScroll>

      <RevelarScroll atraso={0.04}>
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 mb-6">
          <h2 className="text-sm font-semibold mb-3">Dados da empresa</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input label="Razão social" value={form.razaoSocial} onChange={(e) => definirForm({ ...form, razaoSocial: e.target.value })} />
            <Input label="Nome fantasia" value={form.nomeFantasia} onChange={(e) => definirForm({ ...form, nomeFantasia: e.target.value })} />
            <Input label="CNPJ" value={form.cnpj} onChange={(e) => definirForm({ ...form, cnpj: e.target.value })} />
            <Input label="E-mail" type="email" value={form.email} onChange={(e) => definirForm({ ...form, email: e.target.value })} />
            <Input label="Telefone" value={form.telefone} onChange={(e) => definirForm({ ...form, telefone: e.target.value })} />
            <Input label="Responsável" value={form.responsavel} onChange={(e) => definirForm({ ...form, responsavel: e.target.value })} />
            <div className="painel-campo sm:col-span-2">
              <label className="painel-label">Status</label>
              <select
                className="painel-select w-full"
                value={form.status}
                onChange={(e) => definirForm({ ...form, status: e.target.value as StatusEmpresa })}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="suspenso">Suspenso</option>
              </select>
            </div>
          </div>
          <Button variant="primary" size="sm" className="mt-3" loading={pendente} onClick={salvar}>
            Salvar alterações
          </Button>
        </div>
      </RevelarScroll>

      <RevelarScroll atraso={0.08}>
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <UserPlus size={15} />
            Usuários da empresa
          </h2>

          <form onSubmit={convidar} className="grid gap-2 sm:grid-cols-3 mb-4">
            <Input label="E-mail" type="email" value={emailConvite} onChange={(e) => definirEmailConvite(e.target.value)} required />
            <Input label="Nome" value={nomeConvite} onChange={(e) => definirNomeConvite(e.target.value)} />
            <div className="flex items-end">
              <Button type="submit" variant="outline" size="sm" loading={pendente} className="w-full sm:w-auto">
                Convidar
              </Button>
            </div>
          </form>

          <div className="painel-tabela-wrap">
            <table className="painel-tabela">
              <thead className="painel-tabela-thead">
                <tr>
                  <th>Usuário</th>
                  <th>Papel</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="painel-tabela-tbody">
                {perfis.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="tabela-nome">{p.nome_completo || p.email}</span>
                      <span className="tabela-sub">{p.email}</span>
                    </td>
                    <td>{ROTULO_PAPEL[p.papel]}</td>
                    <td>
                      <Badge variant={p.ativo ? 'success' : 'default'} className="text-[10px] py-0">
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {convites
                  .filter((c) => !c.usado_em)
                  .map((c) => (
                    <tr key={c.id} className="opacity-70">
                      <td>
                        <span className="tabela-nome">{c.nome_completo || c.email}</span>
                        <span className="tabela-sub">Convite pendente</span>
                      </td>
                      <td>{ROTULO_PAPEL[c.papel]}</td>
                      <td>
                        <Badge variant="default" className="text-[10px] py-0">
                          Pendente
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {perfis.length === 0 && convites.length === 0 && (
              <div className="painel-vazio text-sm">Nenhum usuário vinculado.</div>
            )}
          </div>
        </div>
      </RevelarScroll>
    </SecaoPainel>
  )
}
