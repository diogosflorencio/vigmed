import { NextResponse } from 'next/server'
import { exigirAutenticacao, ehUsuarioEmpresa } from '@/lib/auth/sessao'
import { recalcularArmazenamentoEmpresa } from '@/lib/documentos/armazenamento'
import { origemPublicacaoDocumento } from '@/lib/documentos/upload'
import { gerarUrlUploadAssinada, montarChaveArquivo } from '@/lib/r2/cliente'
import { criarClienteSupabaseServidor } from '@/lib/supabase/servidor'
import { randomUUID } from 'crypto'

/**
 * Gera URL assinada para upload direto ao R2.
 * Cria o registro do documento no Supabase antes de retornar a URL.
 */
export async function POST(requisicao: Request) {
  try {
    const perfil = await exigirAutenticacao([
      'administrador',
      'administrador_empresa',
      'usuario_empresa',
    ])

    const corpo = await requisicao.json()
    const { nomeArquivo, tipoMime, tamanho, titulo, empresaIds, categoriaId } = corpo

    if (!nomeArquivo || !tipoMime || !titulo) {
      return NextResponse.json({ erro: 'Dados incompletos' }, { status: 400 })
    }

    const documentoId = randomUUID()
    const empresaUsuario = ehUsuarioEmpresa(perfil.papel) ? perfil.empresa_id : null
    const empresaPrincipal = empresaUsuario ?? empresaIds?.[0] ?? perfil.empresa_id

    if (!empresaPrincipal) {
      return NextResponse.json({ erro: 'Empresa não informada' }, { status: 400 })
    }

    if (empresaUsuario && empresaIds?.some((id: string) => id !== empresaUsuario)) {
      return NextResponse.json({ erro: 'Sem permissão para esta empresa.' }, { status: 403 })
    }

    const supabase = await criarClienteSupabaseServidor()
    const tamanhoArquivo = tamanho ?? 0

    const { data: empresa } = await supabase
      .from('empresas')
      .select('armazenamento_usado, armazenamento_limite')
      .eq('id', empresaPrincipal)
      .single()

    if (empresa && empresa.armazenamento_usado + tamanhoArquivo > empresa.armazenamento_limite) {
      return NextResponse.json({ erro: 'Limite de armazenamento da empresa atingido.' }, { status: 400 })
    }

    const chaveArquivo = montarChaveArquivo(empresaPrincipal, documentoId, nomeArquivo)
    const origem = origemPublicacaoDocumento(perfil)

    const { error: erroInsert } = await supabase.from('documentos').insert({
      id: documentoId,
      titulo,
      chave_arquivo: chaveArquivo,
      nome_arquivo: nomeArquivo,
      tamanho_arquivo: tamanhoArquivo,
      tipo_mime: tipoMime,
      extensao: nomeArquivo.split('.').pop()?.toLowerCase(),
      categoria_id: categoriaId ?? null,
      enviado_por: perfil.id,
      origem_publicacao: origem,
    })

    if (erroInsert) {
      return NextResponse.json({ erro: 'Erro ao registrar documento' }, { status: 500 })
    }

    const idsEmpresas = empresaUsuario ? [empresaUsuario] : (empresaIds ?? [empresaPrincipal])
    await supabase.from('documento_empresas').insert(
      idsEmpresas.map((empresaId: string) => ({
        documento_id: documentoId,
        empresa_id: empresaId,
      })),
    )

    for (const empresaId of [...new Set(idsEmpresas as string[])]) {
      await recalcularArmazenamentoEmpresa(empresaId)
    }

    const urlUpload = await gerarUrlUploadAssinada(chaveArquivo, tipoMime, tamanhoArquivo)

    return NextResponse.json({
      urlUpload,
      documentoId,
      chaveArquivo,
    })
  } catch {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }
}
