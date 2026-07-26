import { NextResponse } from 'next/server'
import { registrarVisualizacaoPost } from '@/lib/blog/acoes'
import { criarHashSessao } from '@/lib/blog/visualizacoes'

export async function POST(requisicao: Request) {
  try {
    const { postId } = await requisicao.json()
    if (!postId || typeof postId !== 'string') {
      return NextResponse.json({ erro: 'postId obrigatório' }, { status: 400 })
    }

    const origem = requisicao.headers.get('referer') ?? undefined
    const ip = requisicao.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    const userAgent = requisicao.headers.get('user-agent') ?? ''
    const sessaoHash = criarHashSessao(ip, userAgent)

    await registrarVisualizacaoPost(postId, origem, sessaoHash)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ erro: 'Falha ao registrar' }, { status: 500 })
  }
}
