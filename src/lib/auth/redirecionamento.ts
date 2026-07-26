import { headers } from 'next/headers'
import { obterUrlBaseDoAmbiente } from '@/lib/ambiente'
import type { AmbienteApp } from '@/lib/ambiente'
import { ehAdministrador } from '@/lib/auth/sessao'
import { ROTAS } from '@/lib/rotas'
import type { PapelUsuario } from '@/types'

/** URL base para telas de autenticação unificadas (fallback por env). */
export function urlBaseAuth(): string {
  return obterUrlBaseDoAmbiente('site')
}

/**
 * URL base do host atual (OAuth, reset de senha).
 * Evita redirect relativo quando env/dashboard não batem com o domínio acessado.
 */
export async function urlBaseAuthDaRequisicao(): Promise<string> {
  const h = await headers()
  const host = h.get('x-forwarded-host')?.split(',')[0]?.trim() ?? h.get('host')

  if (host) {
    const proto =
      h.get('x-forwarded-proto')?.split(',')[0]?.trim() ??
      (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https')
    return `${proto}://${host}`
  }

  return urlBaseAuth()
}

/** Ambiente do painel conforme o papel do usuário */
export function ambienteDoPapel(papel: PapelUsuario): AmbienteApp {
  return ehAdministrador(papel) ? 'adm' : 'docs'
}

/** Caminho interno do painel (mesmo host) */
export function caminhoPainelPorPapel(papel: PapelUsuario): string {
  return ehAdministrador(papel) ? ROTAS.adm.painel : ROTAS.docs.painel
}

/** URL absoluta do painel; respeita subdomínio em produção */
export function urlPainelPorPapel(papel: PapelUsuario): string {
  const ambiente = ambienteDoPapel(papel)
  const base = obterUrlBaseDoAmbiente(ambiente)
  return `${base}${caminhoPainelPorPapel(papel)}`
}

/** Painel no mesmo host do login (mantém cookies Supabase após OAuth). */
export function urlPainelNaOrigem(papel: PapelUsuario, origem: string): string {
  return `${origem.replace(/\/+$/, '')}${caminhoPainelPorPapel(papel)}`
}
