import { redirect } from 'next/navigation'
import { obterAmbienteDoHost } from '@/lib/ambiente'
import { headers } from 'next/headers'

/**
 * Roteia a raiz para o ambiente correto conforme subdomínio.
 * Em dev, use VIGMED_DEV_TENANT no .env.local.
 */
export default async function PaginaRaiz() {
  const cabecalhos = await headers()
  const host = cabecalhos.get('host') ?? 'localhost'
  const ambiente = obterAmbienteDoHost(host)

  switch (ambiente) {
    case 'adm':
      redirect('/adm/painel')
    case 'docs':
      redirect('/docs/painel')
    case 'blog':
      redirect('/blog')
    default:
      redirect('/site')
  }
}
