import { obterUrlBaseDoAmbiente } from '@/lib/ambiente'
import type { AmbienteApp } from '@/lib/ambiente'
import { ehAdministrador } from '@/lib/auth/sessao'
import { ROTAS } from '@/lib/rotas'
import type { PapelUsuario } from '@/types'

/** Ambiente do painel conforme o papel do usuário */
export function ambienteDoPapel(papel: PapelUsuario): AmbienteApp {
  return ehAdministrador(papel) ? 'adm' : 'docs'
}

/** Caminho interno do painel (mesmo host) */
export function caminhoPainelPorPapel(papel: PapelUsuario): string {
  return ehAdministrador(papel) ? ROTAS.adm.painel : ROTAS.docs.painel
}

/** URL absoluta do painel — respeita subdomínio em produção */
export function urlPainelPorPapel(papel: PapelUsuario): string {
  const ambiente = ambienteDoPapel(papel)
  const base = obterUrlBaseDoAmbiente(ambiente)
  return `${base}${caminhoPainelPorPapel(papel)}`
}

/** URL base para telas de autenticação unificadas */
export function urlBaseAuth(): string {
  return obterUrlBaseDoAmbiente('site')
}
