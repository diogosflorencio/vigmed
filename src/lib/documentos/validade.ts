export type StatusValidade = 'ok' | 'vencendo' | 'vencido' | 'indefinido'

const MS_DIA = 86400000

/** Interpreta valido_ate (YYYY-MM-DD) e retorna status para badges e filtros. */
export function statusValidade(validoAte: string | null, diasAlerta = 30): StatusValidade {
  if (!validoAte) return 'indefinido'

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const limite = new Date(`${validoAte}T00:00:00`)
  if (Number.isNaN(limite.getTime())) return 'indefinido'

  if (limite.getTime() < hoje.getTime()) return 'vencido'

  const alerta = new Date(hoje.getTime() + diasAlerta * MS_DIA)
  if (limite.getTime() <= alerta.getTime()) return 'vencendo'

  return 'ok'
}

/** Calcula valido_ate a partir de dias de retenção configurados. */
export function calcularValidoAtePorRetencao(diasRetencao: number, base = new Date()): string | null {
  if (!Number.isFinite(diasRetencao) || diasRetencao <= 0) return null
  const fim = new Date(base)
  fim.setDate(fim.getDate() + Math.round(diasRetencao))
  return fim.toISOString().slice(0, 10)
}

export function rotuloStatusValidade(status: StatusValidade): string {
  switch (status) {
    case 'vencido':
      return 'Vencido'
    case 'vencendo':
      return 'Vence em breve'
    case 'ok':
      return 'Válido'
    default:
      return 'Sem prazo'
  }
}

export function varianteSeloValidade(status: StatusValidade): 'erro' | 'alerta' | 'sucesso' | 'padrao' {
  switch (status) {
    case 'vencido':
      return 'erro'
    case 'vencendo':
      return 'alerta'
    case 'ok':
      return 'sucesso'
    default:
      return 'padrao'
  }
}
