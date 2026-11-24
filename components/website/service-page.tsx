import Link from 'next/link'
import { ArrowRight, CheckCircle2, Phone, ExternalLink, ChevronDown, MessageCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ContactForm } from '@/components/website/contact-form'
import { SERVICES, SITE, type ServiceKey } from '@/lib/site'

interface ServicePageProps {
  segment: ServiceKey
  icon: LucideIcon
  color: string
  bg: string
  title: string
  subtitle: string
  description: string
  benefits: string[]
  products: { name: string; desc: string }[]
  faqs: { q: string; a: string }[]
  partnerLink?: { label: string; url: string }
}

export function ServicePage({ segment, icon: Icon, color, bg, title, subtitle, description, benefits, products, faqs, partnerLink }: ServicePageProps) {
  const others = SERVICES.filter((s) => s.key !== segment)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ backgroundColor: bg }}>
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl" style={{ backgroundColor: color }} />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <nav className="mb-6 text-sm text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-slate-900">Início</Link> <span className="mx-1.5">/</span> <span className="font-medium text-slate-700">{subtitle.replace('Serviço de ', '').replace('Serviço ', '')}</span>
          </nav>
          <div className="mb-5 inline-flex items-center gap-2.5 rounded-full bg-white px-4 py-1.5 shadow-sm">
            <Icon size={18} style={{ color }} />
            <span className="text-sm font-semibold" style={{ color }}>{subtitle}</span>
          </div>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">{description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#pedido" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-7 font-semibold text-white shadow-lg transition hover:brightness-95" style={{ backgroundColor: color }}>
              Pedir consultoria gratuita <ArrowRight size={18} />
            </a>
            <a href={SITE.phoneHref} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-7 font-semibold text-slate-800 transition hover:border-slate-400">
              <Phone size={18} /> {SITE.phoneShort}
            </a>
            {partnerLink && (
              <a href={partnerLink.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-7 font-semibold text-slate-800 transition hover:border-slate-400">
                {partnerLink.label} <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">O que fazemos por si</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <div key={p.name} className="rounded-2xl border border-slate-200 p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="mb-4 h-1.5 w-10 rounded-full" style={{ backgroundColor: color }} />
                <h3 className="mb-2 text-lg font-bold text-slate-900">{p.name}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits + form */}
      <section id="pedido" className="scroll-mt-24 bg-slate-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Porquê a PARCENDi?</h2>
            <ul className="mt-8 space-y-4">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 size={22} className="mt-0.5 shrink-0" style={{ color }} />
                  <span className="text-[17px] leading-relaxed text-slate-700">{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white"><MessageCircle size={17} /> Falar no WhatsApp</a>
              <a href={`mailto:${SITE.email}`} className="inline-flex h-11 items-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700">{SITE.email}</a>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
            <h3 className="text-xl font-bold text-slate-900">Peça a sua análise gratuita</h3>
            <p className="mb-6 mt-1 text-sm text-slate-500">Preencha em 30 segundos. Um especialista entra em contacto consigo.</p>
            <ContactForm defaultSegment={segment} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Perguntas frequentes</h2>
            <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200">
              {faqs.map((faq) => (
                <details key={faq.q} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-slate-900">
                    {faq.q}
                    <ChevronDown size={20} className="shrink-0 text-slate-400 transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 leading-relaxed text-slate-600">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cross-sell */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Outros serviços PARCENDi</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((s) => (
              <Link key={s.key} href={s.href} className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-md">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: s.bg }}><s.icon size={20} style={{ color: s.color }} /></span>
                <span>
                  <span className="block font-semibold text-slate-900">{s.title}</span>
                  <span className="block text-xs text-slate-500">{s.short}</span>
                </span>
                <ArrowRight size={16} className="ml-auto text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
