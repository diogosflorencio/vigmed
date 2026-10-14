'use client'

import { forwardRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

export const ThemeToggle = forwardRef<HTMLButtonElement, Props>(function ThemeToggle(
  { className, onMouseEnter, onMouseLeave, onFocus, onBlur, ...rest },
  ref,
) {
  const { tema, alternarTema, montado } = useTheme()

  const rotulo = !montado
    ? 'Alternar tema'
    : tema === 'dark'
      ? 'Ativar tema claro'
      : 'Ativar tema escuro'

  return (
    <button
      ref={ref}
      type="button"
      onClick={alternarTema}
      aria-label={rotulo}
      title={rotulo}
      suppressHydrationWarning
      className={cn(
        'theme-toggle inline-flex items-center justify-center',
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
        <span className="theme-toggle-ico" aria-hidden />
      ) : (
        <span
          className={cn('theme-toggle-ico', tema === 'dark' ? 'theme-toggle-ico--sol' : 'theme-toggle-ico--lua')}
          aria-hidden
        />
      )}
    </button>
  )
})
