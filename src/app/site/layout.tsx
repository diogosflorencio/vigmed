import { ForcarTemaClaro } from '@/components/site/ForcarTemaClaro'
import { PingSupabase } from '@/components/site/PingSupabase'

export const metadata = {
  title: 'VIGMED · Gestão segura de documentos corporativos',
  description: 'Plataforma premium para organização, distribuição e controle de documentos empresariais.',
}

export default function LayoutSite({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ForcarTemaClaro />
      <PingSupabase />
      {children}
    </>
  )
}
