import { NextResponse } from 'next/server'
import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'

/** Ping leve para manter o projeto Supabase ativo (free tier). */
export async function GET() {
  try {
    const admin = criarClienteSupabaseAdmin()
    const { error } = await admin.from('configuracoes').select('chave').limit(1)
    if (error) {
      return NextResponse.json({ ok: false }, { status: 503 })
    }
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
