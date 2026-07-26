import { LayoutPainelProtegido } from '@/components/layout/LayoutPainelProtegido'

export default async function LayoutDocs({ children }: { children: React.ReactNode }) {
  return <LayoutPainelProtegido ambiente="docs">{children}</LayoutPainelProtegido>
}
