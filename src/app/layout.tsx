import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { gerarScriptTemaInicial } from '@/lib/tema/rotas-publicas'
import { obterMapaVariaveisInline } from '@/lib/tema/definicoes'
import { Toaster } from 'react-hot-toast'

const dominioRaiz = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'vigmed.com.br'

const themeInitScript = gerarScriptTemaInicial(dominioRaiz, obterMapaVariaveisInline())

export const metadata: Metadata = {
  title: 'VIGMED',
  description: 'Gestão segura de documentos corporativos',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <meta name="robots" content="noindex, nofollow, noarchive" />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'var(--color-surface)',
                color: 'var(--color-text-1)',
                fontSize: '13px',
                fontFamily: 'var(--font-sans)',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                padding: '10px 14px',
                boxShadow: 'none',
              },
              success: {
                iconTheme: { primary: 'var(--color-text-1)', secondary: 'var(--color-surface)' },
              },
              error: {
                iconTheme: { primary: 'var(--color-danger)', secondary: 'var(--color-surface)' },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
