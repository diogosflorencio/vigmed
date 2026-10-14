import { Sora, Unbounded } from 'next/font/google'
import { ForcarTemaClaro } from '@/components/site/ForcarTemaClaro'
import { PingSupabase } from '@/components/site/PingSupabase'
import '@/styles/landing.css'

const fonteTitulo = Unbounded({
  subsets: ['latin'],
  variable: '--fonte-vm-titulo',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
})

const fonteCorpo = Sora({
  subsets: ['latin'],
  variable: '--fonte-vm-corpo',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata = {
  title: 'VIGMED | Medicina e segurança do trabalho',
  description:
    'Medicina ocupacional, PCMSO, exames e portal digital para empresas com laudos, comunicados e auditoria.',
}

export default function LayoutSite({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${fonteTitulo.variable} ${fonteCorpo.variable}`}
      style={{ background: '#05070c', minHeight: '100svh' }}
    >
      <ForcarTemaClaro />
      <PingSupabase />
      {children}
    </div>
  )
}
