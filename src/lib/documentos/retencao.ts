import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'
import { obterValorConfiguracao } from '@/lib/configuracoes/acoes'
import { excluirArquivoR2 } from '@/lib/r2/cliente'
import { recalcularArmazenamentoEmpresa } from '@/lib/documentos/armazenamento'

type DocumentoRetencao = {
  id: string
  chave_arquivo: string
  titulo: string
  valido_ate: string | null
  criado_em: string
  documento_empresas: { empresa_id: string }[]
}

async function desativarDocumentoRetencao(documento: DocumentoRetencao) {
  const admin = criarClienteSupabaseAdmin()
  const empresaIds = documento.documento_empresas.map((de) => de.empresa_id)

  try {
    await excluirArquivoR2(documento.chave_arquivo)
  } catch {
    // Arquivo pode já ter sido removido do bucket
  }

  const { error } = await admin.from('documentos').update({ ativo: false }).eq('id', documento.id)
  if (error) {
    console.error('[retencao] desativar', documento.id, error.message)
    return false
  }

  for (const empresaId of empresaIds) {
    await recalcularArmazenamentoEmpresa(empresaId)
  }

  return true
}

async function listarCandidatosRetencao() {
  const diasRetencao = await obterValorConfiguracao<number>('dias_retencao', 0)
  const admin = criarClienteSupabaseAdmin()
  const hoje = new Date().toISOString().slice(0, 10)

  const { data: porValidade } = await admin
    .from('documentos')
    .select('id, chave_arquivo, titulo, valido_ate, criado_em, documento_empresas(empresa_id)')
    .eq('ativo', true)
    .not('valido_ate', 'is', null)
    .lt('valido_ate', hoje)

  let candidatos: DocumentoRetencao[] = (porValidade ?? []) as DocumentoRetencao[]

  if (diasRetencao > 0) {
    const limiteCriacao = new Date()
    limiteCriacao.setDate(limiteCriacao.getDate() - diasRetencao)
    const limiteIso = limiteCriacao.toISOString()

    const { data: porIdade } = await admin
      .from('documentos')
      .select('id, chave_arquivo, titulo, valido_ate, criado_em, documento_empresas(empresa_id)')
      .eq('ativo', true)
      .is('valido_ate', null)
      .lt('criado_em', limiteIso)

    const idsJa = new Set(candidatos.map((d) => d.id))
    for (const doc of (porIdade ?? []) as DocumentoRetencao[]) {
      if (!idsJa.has(doc.id)) candidatos.push(doc)
    }
  }

  return { candidatos, diasRetencao }
}

/** Conta documentos que seriam removidos sem excluir. */
export async function simularRetencaoDocumentos() {
  const { candidatos, diasRetencao } = await listarCandidatosRetencao()
  return { candidatos: candidatos.length, diasRetencao }
}

/**
 * Aplica política de retenção:
 * - valido_ate no passado → exclusão
 * - sem valido_ate e criado há mais de dias_retencao → exclusão (se dias > 0)
 */
export async function aplicarRetencaoDocumentos() {
  const { candidatos, diasRetencao } = await listarCandidatosRetencao()

  if (candidatos.length === 0) {
    return { excluidos: 0, candidatos: 0, diasRetencao }
  }

  let excluidos = 0
  for (const documento of candidatos) {
    const ok = await desativarDocumentoRetencao(documento)
    if (ok) excluidos += 1
  }

  return { excluidos, candidatos: candidatos.length, diasRetencao }
}
