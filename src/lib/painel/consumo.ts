'use server'

import { unstable_cache } from 'next/cache'
import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'
import { obterConsumoPorEmpresas, obterTotaisArmazenamento } from '@/lib/documentos/armazenamento'
import { CACHE_TAGS } from '@/lib/cache/tags'
import { formatarBytes } from '@/lib/utils'

export interface RankingConsumoEmpresa {
  id: string
  nome: string
  bytes: number
  bytesEmpresa: number
  bytesVigmed: number
  limite: number
  pct: number
}

export interface RankingConsumoUsuario {
  id: string
  nome: string
  email: string
  empresa: string | null
  uploads7d: number
  downloads7d: number
  bytesEnviados: number
}

export interface MetricaInfra {
  id: 'supabase' | 'cloudflare' | 'vercel'
  nome: string
  papel: string
  resumo: string
  itens: { rotulo: string; valor: string }[]
  observacao: string
}

export interface PainelConsumo {
  empresas: RankingConsumoEmpresa[]
  usuarios: RankingConsumoUsuario[]
  infra: MetricaInfra[]
  atualizadoEm: string
}

function desde7d() {
  return new Date(Date.now() - 7 * 86400000).toISOString()
}

async function carregarConsumoBruto(): Promise<PainelConsumo> {
  const admin = criarClienteSupabaseAdmin()
  const desde = desde7d()

  const [
    totais,
    { data: empresas },
    { data: docs },
    { data: auditoria },
    { data: perfis },
    { count: linhasDocumentos },
    { count: linhasMensagens },
    { count: linhasAuditoria },
    { count: linhasPerfis },
  ] = await Promise.all([
    obterTotaisArmazenamento(),
    admin.from('empresas').select('id, nome_fantasia, armazenamento_limite').eq('status', 'ativo'),
    admin.from('documentos').select('enviado_por, tamanho_arquivo').eq('ativo', true).not('enviado_por', 'is', null),
    admin
      .from('auditoria')
      .select('usuario_id, acao')
      .in('acao', ['envio', 'download'])
      .gte('criado_em', desde),
    admin.from('perfis').select('id, nome_completo, email, empresa_id'),
    admin.from('documentos').select('*', { count: 'exact', head: true }),
    admin.from('mensagens').select('*', { count: 'exact', head: true }),
    admin.from('auditoria').select('*', { count: 'exact', head: true }),
    admin.from('perfis').select('*', { count: 'exact', head: true }),
  ])

  const nomeEmpresa = new Map((empresas ?? []).map((e) => [e.id, e.nome_fantasia]))
  const perfilMap = new Map((perfis ?? []).map((p) => [p.id, p]))

  const ids = (empresas ?? []).map((e) => e.id)
  const consumoMap = await obterConsumoPorEmpresas(ids)

  const rankingEmpresas: RankingConsumoEmpresa[] = (empresas ?? [])
    .map((e) => {
      const c = consumoMap.get(e.id)
      const bytes = c?.total ?? 0
      const limite = e.armazenamento_limite ?? 0
      return {
        id: e.id,
        nome: e.nome_fantasia,
        bytes,
        bytesEmpresa: c?.empresa ?? 0,
        bytesVigmed: c?.vigmed ?? 0,
        limite,
        pct: limite > 0 ? Math.min(100, Math.round((bytes / limite) * 100)) : 0,
      }
    })
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 8)

  type AccUser = RankingConsumoUsuario
  const porUsuario = new Map<string, AccUser>()

  function garantirUsuario(uid: string): AccUser {
    const existente = porUsuario.get(uid)
    if (existente) return existente
    const p = perfilMap.get(uid)
    const criado: AccUser = {
      id: uid,
      nome: p?.nome_completo ?? 'Usuário',
      email: p?.email ?? '',
      empresa: p?.empresa_id ? nomeEmpresa.get(p.empresa_id) ?? null : null,
      uploads7d: 0,
      downloads7d: 0,
      bytesEnviados: 0,
    }
    porUsuario.set(uid, criado)
    return criado
  }

  for (const doc of docs ?? []) {
    const uid = doc.enviado_por as string | null
    if (!uid) continue
    const u = garantirUsuario(uid)
    u.bytesEnviados += doc.tamanho_arquivo ?? 0
  }

  for (const ev of auditoria ?? []) {
    const uid = ev.usuario_id as string | null
    if (!uid) continue
    const u = garantirUsuario(uid)
    if (ev.acao === 'envio') u.uploads7d += 1
    if (ev.acao === 'download') u.downloads7d += 1
  }

  const rankingUsuarios = [...porUsuario.values()]
    .map((u) => ({
      ...u,
      score: u.bytesEnviados + u.uploads7d * 50_000_000 + u.downloads7d * 5_000_000,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ score: _s, ...u }) => u)

  const uploads7dTotal = rankingUsuarios.reduce((s, u) => s + u.uploads7d, 0)
  const downloads7dTotal = rankingUsuarios.reduce((s, u) => s + u.downloads7d, 0)

  const infra: MetricaInfra[] = [
    {
      id: 'supabase',
      nome: 'Supabase',
      papel: 'Banco e auth',
      resumo: `${linhasDocumentos ?? 0} docs · ${linhasMensagens ?? 0} msgs`,
      itens: [
        { rotulo: 'Documentos (linhas)', valor: String(linhasDocumentos ?? 0) },
        { rotulo: 'Mensagens (linhas)', valor: String(linhasMensagens ?? 0) },
        { rotulo: 'Auditoria (linhas)', valor: String(linhasAuditoria ?? 0) },
        { rotulo: 'Perfis', valor: String(linhasPerfis ?? 0) },
      ],
      observacao: 'Estimativa pelo volume de linhas do app (Postgres). Não é a fatura do painel Supabase.',
    },
    {
      id: 'cloudflare',
      nome: 'Cloudflare R2',
      papel: 'Arquivos / objetos',
      resumo: formatarBytes(totais.total),
      itens: [
        { rotulo: 'Total objetos (app)', valor: formatarBytes(totais.total) },
        { rotulo: 'Origem VIGMED', valor: formatarBytes(totais.vigmed) },
        { rotulo: 'Origem empresas', valor: formatarBytes(totais.empresa) },
        { rotulo: 'Soma cotas empresas', valor: formatarBytes(totais.limiteEmpresas) },
      ],
      observacao: 'Bytes somados dos documentos ativos no R2 via metadados do app.',
    },
    {
      id: 'vercel',
      nome: 'Vercel',
      papel: 'App / edge hosting',
      resumo: 'Next.js na Vercel',
      itens: [
        { rotulo: 'Uploads 7d (proxy)', valor: String(uploads7dTotal) },
        { rotulo: 'Downloads 7d (proxy)', valor: String(downloads7dTotal) },
        { rotulo: 'Cache painel', valor: '60s' },
        { rotulo: 'Prefetch rotas', valor: 'ativo' },
      ],
      observacao:
        'Sem API Vercel configurada. Usamos atividade do app como proxy de carga; a fatura fica no dashboard Vercel.',
    },
  ]

  return {
    empresas: rankingEmpresas,
    usuarios: rankingUsuarios,
    infra,
    atualizadoEm: new Date().toISOString(),
  }
}

/** Consumo e ranking com cache de 60s (menos pressão no Supabase / Vercel). */
export async function obterPainelConsumoCached(): Promise<PainelConsumo> {
  return unstable_cache(carregarConsumoBruto, ['painel-consumo-v1'], {
    revalidate: 60,
    tags: [CACHE_TAGS.consumo, CACHE_TAGS.painelAdm],
  })()
}
