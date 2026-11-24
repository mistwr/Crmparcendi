import type { Metadata } from 'next'
import { Home } from 'lucide-react'
import { ServicePage } from '@/components/website/service-page'

export const metadata: Metadata = { title: 'Imobiliário' }

export default function ImobiliarioPage() {
  return (
    <ServicePage
      segment="imobiliario"
      icon={Home}
      color="#8B5CF6"
      bg="#F5F3FF"
      title="O imóvel certo para si"
      subtitle="Serviço Imobiliário"
      description="Mediação imobiliária com foco total nas suas necessidades. Compramos, vendemos e arrendamos imóveis em todo o país com total transparência e profissionalismo."
      benefits={[
        'Acompanhamento em parceria com mediadores imobiliários licenciados',
        'Acesso a uma ampla oferta de imóveis através de parceiros',
        'Avaliação gratuita do seu imóvel',
        'Ligação ao crédito habitação e seguros num só sítio',
        'Marketing profissional para venda mais rápida',
        'Negociação especializada em representação do cliente',
      ]}
      products={[
        { name: 'Compra de Imóveis', desc: 'Encontramos o imóvel ideal de acordo com o seu perfil e orçamento.' },
        { name: 'Venda de Imóveis', desc: 'Vendemos o seu imóvel ao melhor preço e no menor prazo possível.' },
        { name: 'Arrendamento', desc: 'Gestão completa do processo de arrendamento para proprietários e inquilinos.' },
        { name: 'Avaliação Imobiliária', desc: 'Estimativa do valor de mercado do seu imóvel com base em comparáveis da zona.' },
      ]}
      faqs={[
        { q: 'Qual a comissão de mediação imobiliária?', a: 'As condições são sempre acordadas por escrito antes de iniciar a mediação, e só são devidas em caso de sucesso.' },
        { q: 'Em que zonas trabalham?', a: 'Com especial foco no Grande Porto e no Minho. Para outras zonas, fale connosco e encaminhamos o seu pedido.' },
        { q: 'Quanto tempo demora a vender um imóvel?', a: 'Depende sobretudo da localização, do estado e do preço. Na avaliação inicial damos-lhe uma estimativa realista para o seu caso.' },
      ]}
      partnerLink={{ label: 'Ver imóveis na TuaCasa', url: 'https://www.tuacasa.pt/' }}
    />
  )
}

