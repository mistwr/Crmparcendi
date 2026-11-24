import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://parcendi.pt'),
  title: {
    default: 'PARCENDi — Consultoria Multisserviços',
    template: '%s | PARCENDi',
  },
  description:
    'A PARCENDi é uma consultora multisserviços especializada em Energia, Telecom, Crédito, Imobiliário e Seguros. Soluções personalizadas para particulares e empresas.',
  keywords: ['consultoria', 'energia', 'telecom', 'crédito', 'imobiliário', 'seguros', 'PARCENDi', 'Porto', 'consultoria gratuita'],
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
    <html lang="pt-PT" className={`bg-background light ${inter.variable}`}>
      <body className="antialiased font-sans">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
