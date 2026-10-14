import { enviarEmail } from '@/lib/email/enviar'
import { urlDoAmbiente } from '@/lib/rotas'
import type { AmbienteConvite } from '@/lib/auth/convites'

/** Envia e-mail com link de cadastro para convite criado (se Resend estiver configurado). */
export async function notificarConviteCriado(dados: {
  email: string
  nome?: string
  ambiente: AmbienteConvite
  linkRelativo: string
  origem?: string
}) {
  const link = urlDoAmbiente(dados.ambiente === 'adm' ? 'adm' : 'docs', dados.linkRelativo)
  const portal = dados.ambiente === 'adm' ? 'painel administrativo' : 'portal de empresas'

  return enviarEmail({
    para: dados.email,
    assunto: '[VIGMED] Convite de acesso',
    html: `
      <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#1a1a1a;max-width:560px">
        <p style="margin:0 0 8px;font-size:13px;color:#0d9488;font-weight:600">VIGMED · Convite</p>
        <h1 style="margin:0 0 12px;font-size:20px">Você foi convidado</h1>
        <p style="margin:0 0 16px;font-size:15px">
          Olá${dados.nome ? `, ${dados.nome}` : ''}! Foi criado um acesso ao ${portal} da VIGMED
          ${dados.origem ? ` (${dados.origem})` : ''}.
        </p>
        <a href="${link}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600">
          Criar minha senha
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#888">Se não reconhece este convite, ignore este e-mail.</p>
      </div>
    `,
    texto: `Acesse ${link} para criar sua conta no VIGMED.`,
  })
}
