import { LayoutPainelProtegido } from '@/components/layout/LayoutPainelProtegido'

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  return <LayoutPainelProtegido ambiente="adm">{children}</LayoutPainelProtegido>
}
