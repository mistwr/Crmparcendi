import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Users, Award, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Sobre nós', description: 'Conheça a PARCENDi, consultora multisserviços em Energia, Telecom, Crédito, Imobiliário e Seguros.' }

const steps = [
  { n: '01', t: 'Ouvir', d: 'Percebemos a sua situação atual e o que é importante para si.' },
  { n: '02', t: 'Comparar', d: 'Analisamos as alternativas no mercado e explicamos as diferenças com clareza.' },
  { n: '03', t: 'Acompanhar', d: 'Tratamos do processo e continuamos disponíveis depois da contratação.' },
]

const values = [
  { icon: Users, title: 'Foco no Cliente', desc: 'O cliente é sempre o centro de tudo o que fazemos. O nosso sucesso é medido pela satisfação das pessoas que servimos.' },
  { icon: Award, title: 'Excelência', desc: 'Formamos a nossa equipa de forma contínua e trabalhamos com rigor em todos os serviços.' },
  { icon: MapPin, title: 'Proximidade', desc: 'Atendimento próximo e personalizado, presencialmente, por telefone ou WhatsApp.' },
  { icon: Clock, title: 'Disponibilidade', desc: 'Estamos sempre disponíveis para os nossos clientes, antes, durante e após a contratação de qualquer serviço.' },
]

export default function BarcelosPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-light py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-brand text-sm font-medium mb-4">
              <MapPin size={16} /> Sobre a PARCENDi
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-5 text-balance">
              A PARCENDi — quem somos
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Somos uma consultora multisserviços especializada em Energia, Telecom, Crédito,
              Imobiliário e Seguros. A nossa missão é simplificar a vida de famílias e empresas,
              encontrando a melhor solução para cada necessidade — com um único interlocutor.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold mb-10 text-center">Os nossos valores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => {
            const Icon = v.icon
            return (
              <div key={v.title} className="border border-border rounded-xl p-6">
                <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center mb-4">
                  <Icon size={20} className="text-brand" />
                </div>
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Como trabalhamos */}
      <section className="bg-[#0B1220] py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center mb-12">Como trabalhamos</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((st) => (
              <div key={st.n} className="rounded-2xl border border-white/10 bg-white/[0.04] p-7">
                <span className="text-sm font-extrabold text-blue-400">{st.n}</span>
                <h3 className="mt-2 text-xl font-bold">{st.t}</h3>
                <p className="mt-2 leading-relaxed text-slate-300">{st.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Pronto para conhecer-nos?</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Visite-nos na nossa sede ou fale com a nossa equipa. Estamos disponíveis para si.
        </p>
        <Link href="/contactos">
          <Button size="lg" className="bg-brand hover:bg-brand-dark text-white gap-2 h-12 px-8">
            Contactar agora <ArrowRight size={18} />
          </Button>
        </Link>
      </section>
    </>
  )
}
