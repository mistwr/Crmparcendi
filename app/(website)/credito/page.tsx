import type { Metadata } from 'next'
import { CreditCard } from 'lucide-react'
import { ServicePage } from '@/components/website/service-page'

export const metadata: Metadata = { title: 'Crédito' }

export default function CreditoPage() {
  return (
    <ServicePage
      segment="credito"
      icon={CreditCard}
      color="#10B981"
      bg="#ECFDF5"
      title="Crédito com as melhores condições"
      subtitle="Serviço de Crédito"
      description="Ajudamos a encontrar e comparar soluções de crédito habitação, pessoal e consolidação, com processo acompanhado por parceiros registados para a intermediação de crédito."
      benefits={[
        'Trabalhamos com parceiros habilitados para a intermediação de crédito',
        'Comparação de propostas de várias instituições financeiras',
        'Processo simples, com a documentação organizada por nós',
        'Análise gratuita da sua situação financeira',
        'Apoio na negociação de spread e condições',
        'Acompanhamento até à escritura',
      ]}
      products={[
        { name: 'Crédito Habitação', desc: 'Taxa fixa, variável ou mista. Análise personalizada para a compra da sua casa.' },
        { name: 'Crédito Pessoal', desc: 'Para férias, obras, automóvel ou qualquer outro objetivo pessoal.' },
        { name: 'Crédito Automóvel', desc: 'Financiamento de viatura nova ou usada com condições competitivas.' },
        { name: 'Consolidação de Créditos', desc: 'Reduza a sua prestação mensal juntando todos os seus créditos num só.' },
      ]}
      faqs={[
        { q: 'Quem faz a intermediação de crédito?', a: 'A intermediação é realizada em parceria com entidades habilitadas para o efeito. Indicamos-lhe sempre, antes de avançar, a entidade responsável pelo seu processo.' },
        { q: 'Qual o custo do serviço?', a: 'A análise inicial é gratuita. Qualquer custo associado ao processo é-lhe comunicado por escrito antes de avançar.' },
        { q: 'Quanto tempo demora o processo de crédito habitação?', a: 'O processo completo demora em média 4 a 8 semanas, desde a submissão dos documentos até à escritura.' },
      ]}
      partnerLink={{ label: 'Simular no MyCredit', url: 'https://my-credit.pt/' }}
    />
  )
}
