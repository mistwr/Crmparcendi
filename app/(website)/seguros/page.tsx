import type { Metadata } from 'next'
import { Shield } from 'lucide-react'
import { ServicePage } from '@/components/website/service-page'

export const metadata: Metadata = { title: 'Seguros' }

export default function SegurosPage() {
  return (
    <ServicePage
      segment="seguros"
      icon={Shield}
      color="#EF4444"
      bg="#FEF2F2"
      title="Seguros com a melhor cobertura"
      subtitle="Serviço de Seguros"
      description="Comparamos propostas de várias seguradoras, com parceiros habilitados para a mediação de seguros, para encontrar a cobertura certa ao melhor preço para si, a sua família ou a sua empresa."
      benefits={[
        'Trabalhamos com parceiros habilitados para a mediação de seguros',
        'Comparação entre várias seguradoras',
        'Análise personalizada das suas necessidades de proteção',
        'Revisão das suas apólices atuais para evitar pagar a mais',
        'Apoio na participação e acompanhamento de sinistros',
        'Lembrete e revisão nas renovações',
      ]}
      products={[
        { name: 'Seguro de Vida', desc: 'Proteção financeira para si e para a sua família em caso de imprevistos.' },
        { name: 'Seguro Habitação', desc: 'Proteção completa para o seu imóvel contra incêndio, inundações e outros riscos.' },
        { name: 'Seguro Saúde', desc: 'Acesso a cuidados de saúde privados com os melhores planos do mercado.' },
        { name: 'Seguro Automóvel', desc: 'De responsabilidade civil a multirriscos, encontramos a melhor opção para o seu veículo.' },
      ]}
      faqs={[
        { q: 'Quem faz a mediação dos seguros?', a: 'A mediação é feita em parceria com mediadores habilitados. Antes de contratar, indicamos-lhe sempre o mediador e a seguradora responsáveis.' },
        { q: 'Quando devo contratar um seguro de vida?', a: 'O seguro de vida é especialmente recomendado quando tem dependentes financeiros, crédito habitação ou responsabilidades financeiras a longo prazo.' },
        { q: 'O que acontece se tiver um sinistro?', a: 'A nossa equipa acompanha todo o processo de sinistro, desde a participação até à resolução.' },
      ]}
    />
  )
}
