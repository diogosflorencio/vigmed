import { NextResponse } from 'next/server'
import { gerarUrlDownloadAssinada } from '@/lib/r2/cliente'
import { urlPublicaR2 } from '@/lib/r2/cliente'

/** Redireciona para imagem do blog (URL pública ou presign temporário) */
export async function GET(requisicao: Request) {
  const chave = new URL(requisicao.url).searchParams.get('chave')
  if (!chave || !chave.startsWith('blog/')) {
    return NextResponse.json({ erro: 'Chave inválida' }, { status: 400 })
  }

  const publica = urlPublicaR2(chave)
  if (publica) return NextResponse.redirect(publica)

  try {
    const url = await gerarUrlDownloadAssinada(chave)
    return NextResponse.redirect(url)
  } catch {
    return NextResponse.json({ erro: 'Imagem não encontrada' }, { status: 404 })
  }
}
