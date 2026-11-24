import type { Metadata } from 'next'
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react'
import { ContactForm } from '@/components/website/contact-form'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contactos',
  description: 'Fale com a PARCENDi: consultoria gratuita em Energia, Telecom, Crédito, Imobiliário e Seguros.',
}

const VALID = ['energia', 'telecom', 'credito', 'imobiliario', 'seguros', 'outro']

export default async function ContactosPage({ searchParams }: { searchParams: Promise<{ servico?: string }> }) {
  const { servico } = await searchParams
  const defaultSegment = servico && VALID.includes(servico) ? servico : ''
  const mapQuery = encodeURIComponent(`${SITE.street}, ${SITE.locality}, ${SITE.city}`)

  const channels = [
    { icon: Phone, label: 'Telefone', value: SITE.phone, href: SITE.phoneHref },
    { icon: MessageCircle, label: 'WhatsApp', value: 'Enviar mensagem', href: SITE.whatsapp, external: true },
    { icon: Mail, label: 'Email', value: SITE.email, href: `mailto:${SITE.email}` },
  ]

  return (
    <>
      <section className="bg-[#F6F8FC]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand">Contactos</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Fale connosco</h1>
          <p className="mt-4 max-w-xl text-lg text-slate-600">Consultoria gratuita e sem compromisso. Escolha a forma mais cómoda para si.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <div className="grid gap-4">
              {channels.map((c) => (
                <a key={c.label} href={c.href} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-brand hover:shadow-md">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-light"><c.icon size={20} className="text-brand" /></span>
                  <span>
                    <span className="block text-sm text-slate-500">{c.label}</span>
                    <span className="block font-semibold text-slate-900 group-hover:text-brand">{c.value}</span>
                  </span>
                </a>
              ))}
              <div className="flex items-start gap-4 rounded-2xl border border-slate-200 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-light"><MapPin size={20} className="text-brand" /></span>
                <span>
                  <span className="block text-sm text-slate-500">Morada</span>
                  <span className="block font-semibold text-slate-900">{SITE.street}<br />{SITE.locality}, {SITE.city}</span>
                </span>
              </div>
              <div className="flex items-start gap-4 rounded-2xl border border-slate-200 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-light"><Clock size={20} className="text-brand" /></span>
                <span>
                  <span className="block text-sm text-slate-500">Horário</span>
                  {SITE.hours.map((h) => <span key={h.days} className="block font-semibold text-slate-900">{h.days}: {h.time}</span>)}
                </span>
              </div>
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <iframe
                title="Mapa — PARCENDi"
                src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`}
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-10">
            <h2 className="text-2xl font-bold text-slate-900">Enviar pedido</h2>
            <p className="mb-8 mt-1 text-slate-500">Responderemos em horário útil.</p>
            <ContactForm defaultSegment={defaultSegment} />
          </div>
        </div>
      </section>
    </>
  )
}
