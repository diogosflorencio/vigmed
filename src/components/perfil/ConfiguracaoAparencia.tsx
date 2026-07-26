'use client'

import { useTheme } from '@/contexts/ThemeContext'
import type { ModoTema } from '@/lib/tema/tipos'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { IconeAnimado } from '@/components/ui/icone-animado'
import { SeletorTemaVisual } from '@/components/perfil/SeletorTemaVisual'
import type { NomeIcone } from '@/lib/icones-animados'

const MODOS: { id: ModoTema; rotulo: string; icone: NomeIcone }[] = [
  { id: 'light', rotulo: 'Claro', icone: 'sun' },
  { id: 'dark', rotulo: 'Escuro', icone: 'moon' },
  { id: 'system', rotulo: 'Sistema', icone: 'monitor' },
]

/** Seletor de aparência: modo claro/escuro + tema visual completo */
export function ConfiguracaoAparencia() {
  const { modo, definirModo, montado } = useTheme()

  if (!montado) return null

  return (
    <Card className="surface-card border-[var(--glass-border)] overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-base font-semibold">Aparência</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Personalize fundo, texto, botões e navegação do painel.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-5">
        <div className="space-y-2.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Modo
          </Label>
          <div className="inline-flex flex-wrap gap-1 rounded-full border border-border bg-muted/30 p-1">
            {MODOS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => definirModo(item.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-all duration-300',
                  modo === item.id
                    ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80',
                )}
              >
                {item.icone && <IconeAnimado nome={item.icone} tamanho={15} />}
                {item.rotulo}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Tema do painel
          </Label>
          <SeletorTemaVisual />
        </div>
      </CardContent>
    </Card>
  )
}
