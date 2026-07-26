import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { exigirAutenticacao } from '@/lib/auth/sessao'
import {
  gerarUrlUploadAssinada,
  montarChaveBlogImagem,
  urlImagemBlog,
} from '@/lib/r2/cliente'

/** Presign para upload de imagens do blog (admin) */
export async function POST(requisicao: Request) {
  try {
    await exigirAutenticacao(['administrador'])

    const corpo = await requisicao.json()
    const { nomeArquivo, tipoMime, tamanho, postId } = corpo

    if (!nomeArquivo || !tipoMime) {
      return NextResponse.json({ erro: 'Dados incompletos' }, { status: 400 })
    }

    if (!tipoMime.startsWith('image/')) {
      return NextResponse.json({ erro: 'Apenas imagens são permitidas' }, { status: 400 })
    }

    const idPost = postId || randomUUID()
    const chaveArquivo = montarChaveBlogImagem(idPost, nomeArquivo)
    const urlUpload = await gerarUrlUploadAssinada(chaveArquivo, tipoMime, tamanho ?? 5 * 1024 * 1024)
    const urlExibicao = urlImagemBlog(chaveArquivo)

    return NextResponse.json({ urlUpload, chaveArquivo, urlExibicao, postId: idPost })
  } catch {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }
}
