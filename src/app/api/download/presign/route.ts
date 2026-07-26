import { NextResponse } from 'next/server'
import { exigirAutenticacao, registrarAuditoria } from '@/lib/auth/sessao'
import { gerarUrlDownloadAssinada } from '@/lib/r2/cliente'
import { criarClienteSupabaseServidor } from '@/lib/supabase/servidor'

/**
 * Gera URL assinada temporária para download seguro.
 * Registra acesso na auditoria e incrementa contador de downloads.
 */
export async function POST(requisicao: Request) {
  try {
    const perfil = await exigirAutenticacao()
    const { documentoId } = await requisicao.json()

    if (!documentoId) {
      return NextResponse.json({ erro: 'Documento não informado' }, { status: 400 })
    }

    const supabase = await criarClienteSupabaseServidor()

    const { data: documento, error } = await supabase
      .from('documentos')
      .select('*, documento_empresas(empresa_id)')
      .eq('id', documentoId)
      .eq('ativo', true)
      .single()

    if (error || !documento) {
      return NextResponse.json({ erro: 'Documento não encontrado' }, { status: 404 })
    }

    const urlDownload = await gerarUrlDownloadAssinada(documento.chave_arquivo, documento.nome_arquivo)

    await supabase
      .from('documentos')
      .update({ total_downloads: documento.total_downloads + 1 })
      .eq('id', documentoId)

    await supabase.from('documento_acessos').insert({
      documento_id: documentoId,
      usuario_id: perfil.id,
      empresa_id: perfil.empresa_id,
      acao: 'download',
    })

    await registrarAuditoria({
      acao: 'download',
      usuarioId: perfil.id,
      empresaId: perfil.empresa_id ?? undefined,
      recurso: 'documento',
      recursoId: documentoId,
    })

    return NextResponse.json({ urlDownload })
  } catch {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }
}
