'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Check, UserPlus, X } from 'lucide-react'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel } from '@/components/layout/SecaoPainel'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { Botao } from '@/components/vig/Botao'
import { Campo } from '@/components/vig/Campo'
import { Seletor } from '@/components/vig/Seletor'
import { Selo } from '@/components/vig/Selo'
import { Metrica } from '@/components/vig/Metrica'
import { Cartao } from '@/components/vig/Cartao'
import { useAcaoPendente } from '@/hooks/use-acao-pendente'
import { excluirEmpresa, salvarEmpresa } from '@/lib/empresas/acoes'
import { convidarUsuario } from '@/lib/usuarios/acoes'
import { ROTULO_PAPEL } from '@/lib/usuarios/constantes'
import { ROTAS, hrefPublico } from '@/lib/rotas'
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
  const { pendente, executar } = useAcaoPendente<'salvar' | 'convidar' | 'excluir'>()
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
  const [excluindo, definirExcluindo] = useState<{ tipo: 'empresa'; id: string } | null>(null)

  function salvar() {
    void executar('salvar', async () => {
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
    void executar('convidar', async () => {
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
      const path = r.linkAtivacao ?? `/cadastro?email=${encodeURIComponent(emailConvite)}`
      const link = `${window.location.origin}${path}`
      try {
        await navigator.clipboard.writeText(link)
        toast.success(
          r.emailEnviado
            ? 'Convite criado, link copiado e e-mail enviado.'
            : 'E-mail autorizado. Link copiado.',
        )
      } catch {
        toast.success(r.emailEnviado ? 'Convite criado e e-mail enviado.' : (r.mensagem ?? 'E-mail autorizado.'))
      }
      definirEmailConvite('')
      definirNomeConvite('')
      router.refresh()
    })
  }

  function confirmarExclusao() {
    if (!excluindo || excluindo.tipo !== 'empresa') return
    definirExcluindo(null)
    void executar('excluir', async () => {
      const r = await excluirEmpresa(empresa.id)
      if (r.erro) { toast.error(r.erro); return }
      toast.success('Empresa excluída.')
      router.push(hrefPublico(ROTAS.adm.empresas))
    })
  }

  return (
    <SecaoPainel>
      <div className="mb-4">
        <Link
          href={hrefPublico(ROTAS.adm.empresas)}
          className="inline-flex items-center gap-1 text-sm text-(--color-text-3) hover:text-(--color-text-1)"
        >
          <ArrowLeft size={14} />
          Voltar para empresas
        </Link>
      </div>

      <CabecalhoPagina
        rotulo="Empresa"
        titulo={empresa.nome_fantasia}
        descricao={`${formatarCnpj(empresa.cnpj)} · ${formatarBytes(consumo.total)} em arquivos`}
        acoes={
          <div className="flex gap-2">
            <Botao
              variante="secundario"
              tamanho="sm"
              href={hrefPublico(ROTAS.adm.empresaDocumentos(empresa.id))}
            >
              Documentos
            </Botao>
            {excluindo?.tipo === 'empresa' ? (
              <div className="inline-flex items-center gap-0.5">
                <Botao
                  type="button"
                  variante="fantasma"
                  tamanho="sm"
                  className="text-emerald-600"
                  disabled={pendente('excluir')}
                  onClick={confirmarExclusao}
                  aria-label="Confirmar exclusão da empresa"
                  icone={<Check size={15} />}
                />
                <Botao
                  type="button"
                  variante="fantasma"
                  tamanho="sm"
                  disabled={pendente('excluir')}
                  onClick={() => definirExcluindo(null)}
                  aria-label="Cancelar"
                  icone={<X size={15} />}
                />
              </div>
            ) : (
              <Botao
                variante="fantasma"
                tamanho="sm"
                className="text-(--color-danger)"
                disabled={pendente('excluir')}
                onClick={() => definirExcluindo({ tipo: 'empresa', id: empresa.id })}
              >
                Excluir
              </Botao>
            )}
          </div>
        }
      />

      <RevelarScroll>
        <div className="grid gap-3 sm:grid-cols-3 mb-4">
          <Metrica rotulo="VIGMED" valor={formatarBytes(consumo.vigmed)} />
          <Metrica rotulo="Enviado pela empresa" valor={formatarBytes(consumo.empresa)} />
          <Metrica rotulo="Cota" valor={formatarBytes(empresa.armazenamento_limite)} destaque />
        </div>
        {empresa.armazenamento_limite > 0 && (
          <div className="vig-dashboard-detalhe mb-6">
            {(() => {
              const pct = Math.min((consumo.empresa / empresa.armazenamento_limite) * 100, 100)
              return (
                <>
                  <p>
                    Uso da cota empresa: <strong>{Math.round(pct)}%</strong> (
                    {formatarBytes(consumo.empresa)} de {formatarBytes(empresa.armazenamento_limite)})
                  </p>
                  <div className="vig-barra-progresso mt-2">
                    <div
                      className={`vig-barra-progresso-fill${pct >= 90 ? ' vig-barra-progresso-fill--alerta' : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {pct >= 90 && (
                    <p className="vig-dashboard-detalhe-sub text-(--color-danger) mt-2">
                      Cota quase esgotada: considere aumentar o limite ou remover arquivos antigos.
                    </p>
                  )}
                </>
              )
            })()}
          </div>
        )}
      </RevelarScroll>

      <RevelarScroll atraso={0.04}>
        <Cartao titulo="Dados da empresa" className="mb-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo rotulo="Razão social" value={form.razaoSocial} onChange={(e) => definirForm({ ...form, razaoSocial: e.target.value })} />
            <Campo rotulo="Nome fantasia" value={form.nomeFantasia} onChange={(e) => definirForm({ ...form, nomeFantasia: e.target.value })} />
            <Campo rotulo="CNPJ" value={form.cnpj} onChange={(e) => definirForm({ ...form, cnpj: e.target.value })} />
            <Campo rotulo="E-mail" type="email" value={form.email} onChange={(e) => definirForm({ ...form, email: e.target.value })} />
            <Campo rotulo="Telefone" value={form.telefone} onChange={(e) => definirForm({ ...form, telefone: e.target.value })} />
            <Campo rotulo="Responsável" value={form.responsavel} onChange={(e) => definirForm({ ...form, responsavel: e.target.value })} />
            <div className="sm:col-span-2">
              <Seletor
                rotulo="Status"
                value={form.status}
                onChange={(e) => definirForm({ ...form, status: e.target.value as StatusEmpresa })}
                opcoes={[
                  { valor: 'ativo', rotulo: 'Ativo' },
                  { valor: 'inativo', rotulo: 'Inativo' },
                  { valor: 'suspenso', rotulo: 'Suspenso' },
                ]}
              />
            </div>
          </div>
          <Botao variante="primario" tamanho="sm" className="mt-4" carregando={pendente('salvar')} onClick={salvar}>
            Salvar alterações
          </Botao>
        </Cartao>
      </RevelarScroll>

      <RevelarScroll atraso={0.08}>
        <Cartao>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2 text-[var(--vig-navy)]">
              <UserPlus size={15} />
              Pessoas ({perfis.length} contas · {convites.filter((c) => !c.usado_em).length} pendentes)
            </h2>
            <Botao variante="secundario" tamanho="sm" href={hrefPublico(ROTAS.adm.usuarios)}>
              Abrir Pessoas
            </Botao>
          </div>

          <form onSubmit={convidar} className="grid gap-3 sm:grid-cols-3 mb-4">
            <Campo rotulo="E-mail" type="email" value={emailConvite} onChange={(e) => definirEmailConvite(e.target.value)} required />
            <Campo rotulo="Nome" value={nomeConvite} onChange={(e) => definirNomeConvite(e.target.value)} />
            <div className="flex items-end">
              <Botao type="submit" variante="secundario" tamanho="sm" carregando={pendente('convidar')} className="w-full sm:w-auto">
                Autorizar e copiar link
              </Botao>
            </div>
          </form>

          <ul className="divide-y divide-(--color-border) text-sm">
            {perfis.slice(0, 5).map((p) => (
              <li key={p.id} className="py-2 flex justify-between gap-2">
                <span className="truncate">{p.nome_completo || p.email}</span>
                <span className="text-xs text-(--color-text-3) shrink-0">{ROTULO_PAPEL[p.papel]}</span>
              </li>
            ))}
            {convites.filter((c) => !c.usado_em).slice(0, 3).map((c) => (
              <li key={c.id} className="py-2 flex justify-between gap-2 opacity-70">
                <span className="truncate">{c.email}</span>
                <Selo variante="alerta" className="text-[10px]">Pendente</Selo>
              </li>
            ))}
            {perfis.length === 0 && convites.length === 0 && (
              <li className="py-3 text-(--color-text-3)">Ninguém vinculado ainda.</li>
            )}
          </ul>
        </Cartao>
      </RevelarScroll>
    </SecaoPainel>
  )
}
