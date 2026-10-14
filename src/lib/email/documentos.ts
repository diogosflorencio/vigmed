import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'
import { urlDoAmbiente, hrefPublico, ROTAS } from '@/lib/rotas'
import { enviarEmail } from '@/lib/email/enviar'
import { formatarData } from '@/lib/utils'

type DocAlerta = {
  id: string
  titulo: string
  valido_ate: string
  metadados: Record<string, unknown> | null
  documento_empresas: { empresa_id: string }[]
}

/** Documentos que vencem nos próximos N dias e ainda não receberam alerta por e-mail. */
export async function listarDocumentosParaAlertaValidade(diasAntecedencia = 7) {
  const admin = criarClienteSupabaseAdmin()
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const limite = new Date(hoje)
  limite.setDate(limite.getDate() + diasAntecedencia)

  const { data } = await admin
    .from('documentos')
    .select('id, titulo, valido_ate, metadados, documento_empresas(empresa_id)')
    .eq('ativo', true)
    .not('valido_ate', 'is', null)
    .gte('valido_ate', hoje.toISOString().slice(0, 10))
    .lte('valido_ate', limite.toISOString().slice(0, 10))

  return (data ?? []) as DocAlerta[]
}

async function emailsPorEmpresas(empresaIds: string[]): Promise<Map<string, Set<string>>> {
  if (!empresaIds.length) return new Map<string, Set<string>>()

  const admin = criarClienteSupabaseAdmin()
  const [{ data: empresas }, { data: perfis }] = await Promise.all([
    admin.from('empresas').select('id, email').in('id', empresaIds),
    admin.from('perfis').select('email, empresa_id').in('empresa_id', empresaIds).eq('ativo', true),
  ])

  const emailsPorEmpresa = new Map<string, Set<string>>()
  for (const e of empresas ?? []) {
    if (!e.email?.includes('@')) continue
    emailsPorEmpresa.set(e.id, new Set([e.email.trim().toLowerCase()]))
  }
  for (const p of perfis ?? []) {
    if (!p.empresa_id || !p.email?.includes('@')) continue
    const set = emailsPorEmpresa.get(p.empresa_id) ?? new Set<string>()
    set.add(p.email.trim().toLowerCase())
    emailsPorEmpresa.set(p.empresa_id, set)
  }

  return emailsPorEmpresa
}

/** Envia alertas de validade próxima (cron diário). */
export async function enviarAlertasValidadeDocumentos(diasAntecedencia = 7) {
  const candidatos = await listarDocumentosParaAlertaValidade(diasAntecedencia)
  const pendentes = candidatos.filter((d) => {
    const enviado = (d.metadados as { alerta_vencimento_em?: string })?.alerta_vencimento_em
    return enviado !== d.valido_ate
  })

  if (pendentes.length === 0) {
    return { enviados: 0, documentos: 0, emails: 0 }
  }

  const admin = criarClienteSupabaseAdmin()
  const porEmail = new Map<string, { titulo: string; valido_ate: string; id: string }[]>()

  for (const doc of pendentes) {
    const empresaIds = doc.documento_empresas.map((de) => de.empresa_id)
    const mapaEmails = await emailsPorEmpresas(empresaIds)
    const emails = new Set<string>()
    for (const set of mapaEmails.values()) {
      for (const e of set) emails.add(e)
    }
    for (const email of emails) {
      const lista = porEmail.get(email) ?? []
      lista.push({ id: doc.id, titulo: doc.titulo, valido_ate: doc.valido_ate })
      porEmail.set(email, lista)
    }
  }

  let emailsEnviados = 0
  const linkBase = urlDoAmbiente('docs', hrefPublico(ROTAS.docs.documentos))

  for (const [email, docs] of porEmail) {
    const linhas = docs
      .map(
        (d) =>
          `<li><strong>${d.titulo}</strong>: vence em ${formatarData(d.valido_ate)}</li>`,
      )
      .join('')

    const html = `
      <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#1a1a1a;max-width:560px">
        <p style="margin:0 0 8px;font-size:13px;color:#0d9488;font-weight:600">VIGMED · Validade de documentos</p>
        <h1 style="margin:0 0 12px;font-size:20px">Documentos próximos do vencimento</h1>
        <p style="margin:0 0 16px;font-size:14px;color:#555">${docs.length} arquivo${docs.length > 1 ? 's' : ''} vence${docs.length > 1 ? 'm' : ''} nos próximos ${diasAntecedencia} dias:</p>
        <ul style="margin:0 0 20px;padding-left:1.2rem;font-size:15px">${linhas}</ul>
        <a href="${linkBase}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600">
          Abrir documentos
        </a>
      </div>
    `

    const texto = docs.map((d) => `• ${d.titulo}: ${formatarData(d.valido_ate)}`).join('\n')
    const resultado = await enviarEmail({
      para: email,
      assunto: `[VIGMED] ${docs.length} documento${docs.length > 1 ? 's' : ''} vence${docs.length > 1 ? 'm' : ''} em breve`,
      html,
      texto: `Documentos a vencer:\n${texto}\n\nAcesse: ${linkBase}`,
    })
    if (resultado.enviado) emailsEnviados += 1
  }

  for (const doc of pendentes) {
    const meta = { ...(doc.metadados ?? {}), alerta_vencimento_em: doc.valido_ate }
    await admin.from('documentos').update({ metadados: meta }).eq('id', doc.id)
  }

  return { enviados: emailsEnviados, documentos: pendentes.length, emails: porEmail.size }
}
