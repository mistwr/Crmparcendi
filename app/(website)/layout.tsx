import { WebsiteHeader } from '@/components/website/header'
import { WebsiteFooter } from '@/components/website/footer'
import { WhatsAppButton } from '@/components/website/whatsapp-button'
import { SITE } from '@/lib/site'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: SITE.name,
  description: 'Consultoria multisserviços em Energia, Telecom, Crédito, Imobiliário e Seguros.',
  url: SITE.url,
  telephone: SITE.phone.replace(/\s/g, ''),
  email: SITE.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: SITE.street,
    addressLocality: SITE.locality,
    addressRegion: SITE.city,
    addressCountry: 'PT',
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:30' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '13:00' },
  ],
  areaServed: 'PT',
}

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-white">Saltar para o conteúdo</a>
      <WebsiteHeader />
      <main id="conteudo" className="flex-1">{children}</main>
      <WebsiteFooter />
      <WhatsAppButton />
    </div>
  )
}
