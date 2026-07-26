import type { Metadata } from 'next'
import { ForcarTemaClaro } from '@/components/site/ForcarTemaClaro'

/** Layout do blog público - SEO indexável (sobrescreve noindex do root) */
export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function LayoutBlog({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ForcarTemaClaro />
      {children}
    </>
  )
}
