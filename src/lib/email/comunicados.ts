import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'
import { urlDoAmbiente } from '@/lib/rotas'
import { enviarEmail } from '@/lib/email/enviar'

function extrairTexto(html: string, limite = 280): string {
  const texto = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (texto.length <= limite) return texto
  return `${texto.slice(0, limite - 1)}…`
}

async function emailsDestinatariosComunicado(comunicadoId: string, paraTodos: boolean) {
  const admin = criarClienteSupabaseAdmin()
  let empresaIds: string[] = []

  if (paraTodos) {
    const { data } = await admin.from('empresas').select('id').eq('status', 'ativo')
    empresaIds = (data ?? []).map((e) => e.id)
  } else {
    const { data } = await admin
      .from('comunicado_empresas')
      .select('empresa_id')
      .eq('comunicado_id', comunicadoId)
    empresaIds = (data ?? []).map((v) => v.empresa_id)
  }

  if (empresaIds.length === 0) return [] as string[]

  const [{ data: empresas }, { data: perfis }] = await Promise.all([
    admin.from('empresas').select('email').in('id', empresaIds),
    admin
      .from('perfis')
      .select('email')
      .in('empresa_id', empresaIds)
      .eq('ativo', true),
  ])

  const emails = new Set<string>()
  for (const e of empresas ?? []) {
    if (e.email?.includes('@')) emails.add(e.email.trim().toLowerCase())
  }
  for (const p of perfis ?? []) {
    if (p.email?.includes('@')) emails.add(p.email.trim().toLowerCase())
  }

  return [...emails]
}

/** Notifica empresas destinatárias sobre comunicado publicado (se e-mail estiver configurado). */
export async function notificarComunicadoPublicado(dados: {
  comunicadoId: string
  titulo: string
  corpo: string
  prioridade: string
  paraTodos: boolean
}) {
  const destinatarios = await emailsDestinatariosComunicado(dados.comunicadoId, dados.paraTodos)
  if (destinatarios.length === 0) {
    return { enviado: false, motivo: 'Nenhum e-mail de destinatário encontrado.', total: 0 }
  }

  const linkPortal = urlDoAmbiente('docs', '/docs/comunicados')
  const resumo = extrairTexto(dados.corpo)
  const prioridade =
    dados.prioridade === 'urgente'
      ? 'Urgente'
      : dados.prioridade === 'importante'
        ? 'Importante'
        : 'Normal'

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#1a1a1a;max-width:560px">
      <p style="margin:0 0 8px;font-size:13px;color:#0d9488;font-weight:600">VIGMED · Comunicado</p>
      <h1 style="margin:0 0 12px;font-size:20px">${dados.titulo}</h1>
      <p style="margin:0 0 16px;font-size:14px;color:#555">Prioridade: ${prioridade}</p>
      <p style="margin:0 0 20px;font-size:15px">${resumo}</p>
      <a href="${linkPortal}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600">
        Abrir no portal
      </a>
      <p style="margin:24px 0 0;font-size:12px;color:#888">Você recebeu este aviso porque sua empresa está cadastrada no VIGMED.</p>
    </div>
  `

  const resultado = await enviarEmail({
    para: destinatarios,
    assunto: `[VIGMED] ${dados.titulo}`,
    html,
    texto: `${dados.titulo}\n\n${resumo}\n\nAcesse: ${linkPortal}`,
  })

  return { ...resultado, total: destinatarios.length }
}
