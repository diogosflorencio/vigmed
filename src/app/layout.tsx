import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, Sora, Unbounded } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { gerarScriptTemaInicial } from '@/lib/tema/rotas-publicas'
import { obterMapaVariaveisInline } from '@/lib/tema/definicoes'
import { Toaster } from 'react-hot-toast'

const dominioRaiz = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'vigmed.com.br'

const themeInitScript = gerarScriptTemaInicial(dominioRaiz, obterMapaVariaveisInline())

const fonteInterface = Sora({
  subsets: ['latin'],
  variable: '--fonte-interface',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const fonteDisplay = Unbounded({
  subsets: ['latin'],
  variable: '--fonte-display',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
})

const fonteDados = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--fonte-dados',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f4f7f9',
}

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
      <body className={`${fonteInterface.variable} ${fonteDisplay.variable} ${fonteDados.variable}`}>
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            containerClassName="app-toaster"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'var(--app-elevated, var(--color-surface))',
                color: 'var(--app-text, var(--color-text-1))',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-sans)',
                borderRadius: '14px',
                border: '1px solid color-mix(in srgb, var(--color-border) 70%, transparent)',
                padding: '12px 16px',
                boxShadow: 'var(--app-shadow-md, 0 6px 20px rgba(0,0,0,0.08))',
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
