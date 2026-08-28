import type { ReactNode } from 'react'
import { ForcarTemaAuth } from '@/components/auth/ForcarTemaAuth'
import { IconeAnimado } from '@/components/ui/icone-animado'
import Link from 'next/link'
import type { AmbienteApp } from '@/lib/ambiente'

interface Props {
  children: ReactNode
}

/** Wrapper visual das páginas de autenticação, layout split com marca VIGMED */
export function CascaAuth({ children }: Props) {
  return (
    <div className="vig-auth">
      <ForcarTemaAuth />

      <aside className="vig-auth-brand" aria-hidden={false}>
        <div className="vig-auth-brand-conteudo">
          <Link href="/" className="vig-landing-logo vig-landing-logo--claro">
            <span className="vig-landing-logo-icone">
              <IconeAnimado nome="shield" tamanho={18} />
            </span>
            VIGMED
          </Link>

          <h2 className="vig-auth-brand-titulo">
            Portal VIGMED para laudos, comunicados e mensagens.
          </h2>
          <p className="vig-auth-brand-texto">
            Entre com o e-mail autorizado pela administração. Cada empresa enxerga apenas seus arquivos.
          </p>

          <ul className="vig-auth-brand-lista">
            {[
              { icone: 'shield' as const, texto: 'Acesso isolado por empresa' },
              { icone: 'lock' as const, texto: 'Login com e-mail autorizado' },
              { icone: 'file-text' as const, texto: 'Laudos e documentos digitais' },
            ].map((item) => (
              <li key={item.texto}>
                <IconeAnimado nome={item.icone} tamanho={16} />
                {item.texto}
              </li>
            ))}
          </ul>
        </div>
        <div className="vig-auth-brand-orbs" aria-hidden />
      </aside>

      <main className="vig-auth-form-area">
        <div className="vig-auth-form-wrap">{children}</div>
        <p className="vig-auth-voltar">
          <Link href="/">← Voltar ao site</Link>
        </p>
      </main>
    </div>
  )
}

export function tituloAuth(ambiente: AmbienteApp, tipo: 'entrar' | 'cadastro' | 'recuperar') {
  const portal = ambiente === 'adm' ? 'VIGMED Admin' : 'VIGMED Docs'
  const acoes = {
    entrar: 'Entrar',
    cadastro: 'Ativar conta',
    recuperar: 'Recuperar senha',
  }
  return `${acoes[tipo]} · ${portal}`
}
