import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'PARCENDi — Consultoria Multisserviços',
    template: '%s | PARCENDi',
  },
  description:
    'A PARCENDi é uma consultora multisserviços especializada em Energia, Telecom, Crédito, Imobiliário e Seguros. Soluções personalizadas para particulares e empresas.',
  keywords: ['consultoria', 'energia', 'telecom', 'crédito', 'imobiliário', 'seguros', 'PARCENDi', 'Barcelos'],
  authors: [{ name: 'PARCENDi' }],
  creator: 'PARCENDi',
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    siteName: 'PARCENDi',
    title: 'PARCENDi — Consultoria Multisserviços',
    description: 'Soluções personalizadas em Energia, Telecom, Crédito, Imobiliário e Seguros.',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0057FF',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-PT" className="bg-background light">
      <body className="antialiased font-sans">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
