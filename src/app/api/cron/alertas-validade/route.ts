import { NextResponse } from 'next/server'
import { enviarAlertasValidadeDocumentos } from '@/lib/email/documentos'

/** Cron diário: alertas de validade. GET /api/cron/alertas-validade */
export async function GET(requisicao: Request) {
  const segredo = process.env.CRON_SECRET?.trim()
  if (!segredo) {
    return NextResponse.json({ erro: 'CRON_SECRET não configurado.' }, { status: 503 })
  }

  const auth = requisicao.headers.get('authorization')
  if (auth !== `Bearer ${segredo}`) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
  }

  const resultado = await enviarAlertasValidadeDocumentos(7)
  return NextResponse.json({ ok: true, ...resultado })
}
