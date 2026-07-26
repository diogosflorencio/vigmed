'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ROTAS } from '@/lib/rotas'
import { Building2, FolderOpen, Pencil, Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel } from '@/components/layout/SecaoPainel'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@/components/ui'
import { salvarEmpresa } from '@/lib/empresas/acoes'
import type { ConsumoArmazenamentoEmpresa } from '@/lib/documentos/armazenamento'
import { cn, formatarBytes, formatarCnpj } from '@/lib/utils'
import type { Empresa, StatusEmpresa } from '@/types'

const FILTROS_STATUS: { id: StatusEmpresa | 'todos'; rotulo: string }[] = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'ativo', rotulo: 'Ativo' },
  { id: 'inativo', rotulo: 'Inativo' },
  { id: 'suspenso', rotulo: 'Suspenso' },
]

const ROTULO_STATUS: Record<StatusEmpresa, { rotulo: string; variant: 'success' | 'default' | 'danger' }> = {
  ativo: { rotulo: 'Ativo', variant: 'success' },
  inativo: { rotulo: 'Inativo', variant: 'default' },
  suspenso: { rotulo: 'Suspenso', variant: 'danger' },
}

interface Props {
  empresasIniciais: Empresa[]
  consumoPorEmpresa: Record<string, ConsumoArmazenamentoEmpresa>
}

export function PainelEmpresas({ empresasIniciais, consumoPorEmpresa }: Props) {
  const router = useRouter()
  const [busca, definirBusca] = useState('')
  const [statusFiltro, definirStatusFiltro] = useState<StatusEmpresa | 'todos'>('todos')
  const [dialogAberto, definirDialogAberto] = useState(false)
  const [editando, definirEditando] = useState<Empresa | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  const [form, definirForm] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    email: '',
    telefone: '',
    responsavel: '',
    status: 'ativo' as StatusEmpresa,
  })

  const empresas = useMemo(() => {
    return empresasIniciais.filter((e) => {
      if (statusFiltro !== 'todos' && e.status !== statusFiltro) return false
      if (!busca.trim()) return true
      const termo = busca.toLowerCase()
      return (
        e.nome_fantasia.toLowerCase().includes(termo) ||
        e.razao_social.toLowerCase().includes(termo) ||
        e.cnpj.includes(termo.replace(/\D/g, ''))
      )
    })
  }, [empresasIniciais, busca, statusFiltro])

  function abrirNova() {
    definirEditando(null)
    definirForm({ razaoSocial: '', nomeFantasia: '', cnpj: '', email: '', telefone: '', responsavel: '', status: 'ativo' })
    definirDialogAberto(true)
  }

  function abrirEditar(empresa: Empresa) {
    definirEditando(empresa)
    definirForm({
      razaoSocial: empresa.razao_social,
      nomeFantasia: empresa.nome_fantasia,
      cnpj: empresa.cnpj,
      email: empresa.email,
      telefone: empresa.telefone ?? '',
      responsavel: empresa.responsavel ?? '',
      status: empresa.status,
    })
    definirDialogAberto(true)
  }

  function aoSalvar() {
    iniciarTransicao(async () => {
      const resultado = await salvarEmpresa({ id: editando?.id, ...form })
      if (resultado.erro) { toast.error(resultado.erro); return }
      toast.success(editando ? 'Empresa atualizada.' : 'Empresa criada.')
      definirDialogAberto(false)
      router.refresh()
    })
  }

  return (
    <SecaoPainel>
      <CabecalhoPagina
        titulo="Empresas"
        descricao="Clientes e consumo de armazenamento (VIGMED vs empresa)."
        acoes={
          <Button variant="primary" size="sm" onClick={abrirNova}>
            <Plus size={15} />
            Nova empresa
          </Button>
        }
      />

      <RevelarScroll>
        <div className="painel-filtros">
          <div className="painel-busca" style={{ minWidth: 180 }}>
            <Search size={13} className="painel-busca-icone" />
            <input
              className="painel-busca-input"
              placeholder="Razão social ou CNPJ..."
              value={busca}
              onChange={(e) => definirBusca(e.target.value)}
            />
          </div>
          <div className="painel-pilulas">
            {FILTROS_STATUS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => definirStatusFiltro(f.id)}
                className={cn('painel-pilula', statusFiltro === f.id && 'painel-pilula--ativo')}
              >
                {f.rotulo}
              </button>
            ))}
          </div>
        </div>
      </RevelarScroll>

      <RevelarScroll atraso={0.06}>
        <div className="painel-tabela-wrap">
          <div className="overflow-x-auto">
            <table className="painel-tabela">
              <thead className="painel-tabela-thead">
                <tr>
                  <th>Empresa</th>
                  <th className="hidden md:table-cell">CNPJ</th>
                  <th>Status</th>
                  <th className="text-right">VIGMED</th>
                  <th className="text-right">Empresa</th>
                  <th className="text-right">Total</th>
                  <th className="hidden lg:table-cell" style={{ minWidth: '9rem' }}>Uso</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="painel-tabela-tbody">
                {empresas.map((empresa) => {
                  const status = ROTULO_STATUS[empresa.status]
                  const consumo = consumoPorEmpresa[empresa.id] ?? {
                    empresaId: empresa.id, total: empresa.armazenamento_usado,
                    vigmed: empresa.armazenamento_usado, empresa: 0,
                  }
                  const pct = empresa.armazenamento_limite
                    ? Math.min((consumo.total / empresa.armazenamento_limite) * 100, 100)
                    : 0
                  return (
                    <tr key={empresa.id} className={cn(empresa.status === 'inativo' && 'opacity-60')}>
                      <td>
                        <span className="tabela-nome">{empresa.nome_fantasia}</span>
                        <span className="tabela-sub md:hidden">{formatarCnpj(empresa.cnpj)}</span>
                      </td>
                      <td className="hidden md:table-cell tabela-mono">{formatarCnpj(empresa.cnpj)}</td>
                      <td>
                        <Badge variant={status.variant} className="text-[10px] py-0">{status.rotulo}</Badge>
                      </td>
                      <td className="text-right tabela-mono">{formatarBytes(consumo.vigmed)}</td>
                      <td className="text-right tabela-mono">{formatarBytes(consumo.empresa)}</td>
                      <td className="text-right tabela-mono" style={{ fontWeight: 500, color: 'var(--color-text-1)' }}>
                        {formatarBytes(consumo.total)}
                      </td>
                      <td className="hidden lg:table-cell">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div className="barra-uso">
                            <div
                              className={cn('barra-uso-fill', pct >= 90 && 'barra-uso-fill--alerta')}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="tabela-mono">{pct.toFixed(0)}% de {formatarBytes(empresa.armazenamento_limite)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <button type="button" className="tabela-acao" onClick={() => abrirEditar(empresa)} title="Editar">
                            <Pencil size={13} />
                          </button>
                          <Link href={`${ROTAS.adm.documentos}?empresa=${empresa.id}`} className="tabela-acao" title="Documentos">
                            <FolderOpen size={13} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {empresas.length === 0 && (
            <div className="painel-vazio">
              <Building2 size={22} style={{ opacity: 0.35 }} />
              Nenhuma empresa encontrada.
            </div>
          )}
        </div>
      </RevelarScroll>

      <Dialog open={dialogAberto} onOpenChange={definirDialogAberto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar empresa' : 'Nova empresa'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-1">
            <Input label="Razão social" value={form.razaoSocial} onChange={(e) => definirForm({ ...form, razaoSocial: e.target.value })} />
            <Input label="Nome fantasia" value={form.nomeFantasia} onChange={(e) => definirForm({ ...form, nomeFantasia: e.target.value })} />
            <Input label="CNPJ" value={form.cnpj} onChange={(e) => definirForm({ ...form, cnpj: e.target.value })} />
            <Input label="E-mail" type="email" value={form.email} onChange={(e) => definirForm({ ...form, email: e.target.value })} />
            <Input label="Telefone" value={form.telefone} onChange={(e) => definirForm({ ...form, telefone: e.target.value })} />
            <Input label="Responsável" value={form.responsavel} onChange={(e) => definirForm({ ...form, responsavel: e.target.value })} />
            <div className="painel-campo">
              <label className="painel-label">Status</label>
              <select
                className="painel-select"
                style={{ width: '100%' }}
                value={form.status}
                onChange={(e) => definirForm({ ...form, status: e.target.value as StatusEmpresa })}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="suspenso">Suspenso</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => definirDialogAberto(false)}>Cancelar</Button>
            <Button variant="primary" loading={pendente} onClick={aoSalvar}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SecaoPainel>
  )
}
