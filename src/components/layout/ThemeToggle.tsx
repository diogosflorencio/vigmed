'use client'

import { forwardRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'
import { IconeAnimado } from '@/components/ui/icone-animado'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

export const ThemeToggle = forwardRef<HTMLButtonElement, Props>(function ThemeToggle(
  { className, onMouseEnter, onMouseLeave, onFocus, onBlur, ...rest },
  ref,
) {
  const { tema, alternarTema, montado } = useTheme()

  return (
    <button
      ref={ref}
      type="button"
      onClick={alternarTema}
      aria-label={tema === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
      className={cn(
        'inline-flex items-center justify-center',
        'text-(--color-text-2)',
        'transition-colors hover:text-(--color-text-1)',
        className,
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      {...rest}
    >
      {!montado ? (
        <span className="h-4 w-4" />
      ) : tema === 'dark' ? (
        <IconeAnimado nome="sun" tamanho={18} />
      ) : (
        <IconeAnimado nome="moon" tamanho={18} />
      )}
    </button>
  )
})
