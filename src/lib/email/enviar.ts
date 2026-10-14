export type ResultadoEnvioEmail =
  | { enviado: true }
  | { enviado: false; motivo: string }

function emailsUnicos(destinatarios: string[]): string[] {
  const vistos = new Set<string>()
  const lista: string[] = []
  for (const bruto of destinatarios) {
    const email = bruto.trim().toLowerCase()
    if (!email.includes('@') || vistos.has(email)) continue
    vistos.add(email)
    lista.push(email)
  }
  return lista
}

/** Envia e-mail via Resend (RESEND_API_KEY + EMAIL_FROM). Falha silenciosa se não configurado. */
export async function enviarEmail(opcoes: {
  para: string | string[]
  assunto: string
  html: string
  texto?: string
}): Promise<ResultadoEnvioEmail> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const remetente = process.env.EMAIL_FROM?.trim()

  if (!apiKey || !remetente) {
    return { enviado: false, motivo: 'RESEND_API_KEY ou EMAIL_FROM não configurados.' }
  }

  const para = emailsUnicos(Array.isArray(opcoes.para) ? opcoes.para : [opcoes.para])
  if (para.length === 0) {
    return { enviado: false, motivo: 'Nenhum destinatário válido.' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: remetente,
        to: para,
        subject: opcoes.assunto,
        html: opcoes.html,
        text: opcoes.texto,
      }),
    })

    if (!res.ok) {
      const corpo = await res.text().catch(() => '')
      console.error('[enviarEmail]', res.status, corpo)
      return { enviado: false, motivo: `Falha ao enviar (${res.status}).` }
    }

    return { enviado: true }
  } catch (erro) {
    console.error('[enviarEmail]', erro)
    return { enviado: false, motivo: 'Erro de rede ao enviar e-mail.' }
  }
}
