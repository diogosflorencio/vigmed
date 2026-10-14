'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Campo, type PropsCampo } from '@/components/vig/Campo'

type Props = Omit<PropsCampo, 'type' | 'sufixo'>

/** Campo de senha com botão mostrar/ocultar */
export function CampoSenha(props: Props) {
  const [visivel, definirVisivel] = useState(false)

  return (
    <Campo
      {...props}
      type={visivel ? 'text' : 'password'}
      sufixo={
        <button
          type="button"
          className="vig-campo-suffix-btn"
          onClick={() => definirVisivel((v) => !v)}
          aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          tabIndex={0}
        >
          {visivel ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      }
    />
  )
}
