import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { aplicarRetencaoDocumentos } from '@/lib/documentos/retencao'
import { ROTAS } from '@/lib/rotas'

/** Cron diário: GET /api/cron/retencao com Authorization: Bearer CRON_SECRET */
export async function GET(requisicao: Request) {
  const segredo = process.env.CRON_SECRET?.trim()
  if (!segredo) {
    return NextResponse.json({ erro: 'CRON_SECRET não configurado.' }, { status: 503 })
  }

  const auth = requisicao.headers.get('authorization')
  if (auth !== `Bearer ${segredo}`) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
  }

  const resultado = await aplicarRetencaoDocumentos()
  if (resultado.excluidos > 0) {
    revalidatePath(ROTAS.adm.documentos)
    revalidatePath(ROTAS.docs.documentos)
  }
  return NextResponse.json({ ok: true, ...resultado })
}
