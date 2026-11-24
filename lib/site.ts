import { Zap, Wifi, CreditCard, Home, Shield, type LucideIcon } from 'lucide-react'

export const SITE = {
  name: 'PARCENDi',
  tagline: 'Consultoria Multisserviços',
  url: 'https://parcendi.pt',
  phone: '+351 961 383 587',
  phoneHref: 'tel:+351961383587',
  phoneShort: '961 383 587',
  whatsapp: 'https://wa.me/351961383587?text=Ol%C3%A1%20PARCENDi%2C%20gostaria%20de%20uma%20consultoria%20gratuita.',
  email: 'geral@parcendi.pt',
  privacyEmail: 'rgpd@parcendi.pt',
  street: 'Rua Nova do Seixo 964',
  locality: 'São Mamede de Infesta',
  city: 'Porto',
  postal: '',
  country: 'Portugal',
  hours: [
    { days: 'Segunda a Sexta', time: '9h00 – 18h30' },
    { days: 'Sábado', time: '9h00 – 13h00' },
  ],
  energySimulatorUrl: 'https://simuladorsolucoesdiferentes.netlify.app/',
}

export type ServiceKey = 'energia' | 'telecom' | 'credito' | 'imobiliario' | 'seguros'

export const SERVICES: {
  key: ServiceKey
  icon: LucideIcon
  title: string
  short: string
  description: string
  href: string
  color: string
  bg: string
  points: string[]
}[] = [
  {
    key: 'energia', icon: Zap, title: 'Energia', short: 'Eletricidade e gás natural',
    description: 'Comparamos comercializadoras de eletricidade e gás natural e encontramos o tarifário certo para o seu consumo.',
    href: '/energia', color: '#F59E0B', bg: '#FFFBEB',
    points: ['Análise da fatura atual', 'Mudança sem cortes', 'Particulares e empresas'],
  },
  {
    key: 'telecom', icon: Wifi, title: 'Telecom', short: 'Internet, TV, fixo e móvel',
    description: 'Pacotes de fibra, televisão e móvel ajustados ao seu uso real — sem pagar por aquilo de que não precisa.',
    href: '/telecom', color: '#3B82F6', bg: '#EFF6FF',
    points: ['Comparação entre operadores', 'Portabilidade do número', 'Instalação acompanhada'],
  },
  {
    key: 'credito', icon: CreditCard, title: 'Crédito', short: 'Habitação, pessoal e consolidação',
    description: 'Apoio na procura e comparação de soluções de crédito habitação, pessoal e consolidação de créditos.',
    href: '/credito', color: '#10B981', bg: '#ECFDF5',
    points: ['Análise gratuita', 'Comparação de propostas', 'Apoio até à escritura'],
  },
  {
    key: 'imobiliario', icon: Home, title: 'Imobiliário', short: 'Compra, venda e arrendamento',
    description: 'Acompanhamento em todas as fases da compra, venda ou arrendamento do seu imóvel.',
    href: '/imobiliario', color: '#8B5CF6', bg: '#F5F3FF',
    points: ['Avaliação do imóvel', 'Divulgação profissional', 'Apoio na negociação'],
  },
  {
    key: 'seguros', icon: Shield, title: 'Seguros', short: 'Vida, casa, saúde e automóvel',
    description: 'Comparamos coberturas e prémios para proteger a sua família, a sua casa e o seu negócio.',
    href: '/seguros', color: '#EF4444', bg: '#FEF2F2',
    points: ['Coberturas comparadas', 'Revisão das apólices atuais', 'Apoio em sinistros'],
  },
]
