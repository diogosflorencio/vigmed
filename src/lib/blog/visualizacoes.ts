import { createHash } from 'crypto'

/** Hash anônimo para deduplicar sessões sem armazenar IP bruto */
export function criarHashSessao(ip?: string, userAgent?: string): string {
  return createHash('sha256')
    .update(`${ip ?? 'anon'}|${userAgent ?? ''}`)
    .digest('hex')
    .slice(0, 32)
}
