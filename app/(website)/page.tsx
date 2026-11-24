import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Phone, Sparkles, FileSearch, Scale, Handshake, BadgeEuro, UserCheck, Layers, Clock, MessageCircle } from 'lucide-react'
import { HeroSlideshow } from '@/components/website/hero-slideshow'
import { createClient } from '@/lib/supabase/server'
import { SERVICES, SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: { absolute: 'PARCENDi — Consultoria em Energia, Telecom, Crédito, Imobiliário e Seguros' },
}

export const revalidate = 300

const highlights = [
  { icon: BadgeEuro, value: '0 €', label: 'Custo da consultoria' },
  { icon: Layers, value: '5', label: 'Áreas num só parceiro' },
  { icon: UserCheck, value: '1', label: 'Gestor dedicado' },
  { icon: Clock, value: 'Rápido', label: 'Resposta em horário útil' },
]

const steps = [
  { icon: FileSearch, title: 'Analisamos', text: 'Envie-nos a sua fatura, apólice ou necessidade. Estudamos a sua situação atual sem qualquer custo.' },
  { icon: Scale, title: 'Comparamos', text: 'Comparamos as alternativas disponíveis e apresentamos a mais vantajosa, com números claros.' },
  { icon: Handshake, title: 'Tratamos de tudo', text: 'Cuidamos da papelada e acompanhamos o processo até ao fim — e depois dele.' },
]

const reasons = [
  'Serviço de consultoria gratuito para o cliente',
  'Comparação transparente, com a poupança explicada',
  'Um único interlocutor para todas as áreas',
  'Acompanhamento antes, durante e após a contratação',
  'Processo simples, sem burocracia desnecessária',
  'Particulares, famílias e empresas',
]

async function getSiteData() {
  try {
    const supabase = await createClient()
    const [{ data: settings }, { data: campaigns }] = await Promise.all([
      (supabase.from('parcendi_site_settings') as any).select('*').eq('id', 'main').maybeSingle(),
      (supabase.from('parcendi_site_campaigns') as any)
        .select('*')
        .eq('is_active', true)
        .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
        .order('is_featured', { ascending: false })
        .order('position'),
    ])
    return { settings, campaigns: (campaigns ?? []) as any[] }
  } catch {
    return { settings: null, campaigns: [] as any[] }
  }
}

export default async function HomePage() {
  const { settings, campaigns } = await getSiteData()
  const primary = settings?.primary_color || '#0057FF'
  const visibleCampaigns = campaigns.slice(0, 6)

  return (
    <>
      <HeroSlideshow />

      {/* Highlights */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-slate-200 px-4 sm:px-6 lg:grid-cols-4 lg:divide-x lg:px-8">
          {highlights.map((h) => (
            <div key={h.label} className="flex items-center gap-4 px-2 py-6 sm:px-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light"><h.icon size={20} className="text-brand" /></div>
              <div>
                <p className="text-xl font-extrabold text-slate-900">{h.value}</p>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">{h.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand">Serviços</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">Cinco áreas. Um só parceiro.</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">Reduza custos e tome melhores decisões em energia, telecomunicações, crédito, imobiliário e seguros.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <Link key={s.key} href={s.href} className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-2xl hover:shadow-slate-900/10">
                <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" style={{ backgroundColor: s.color }} />
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: s.bg }}>
                  <s.icon size={26} style={{ color: s.color }} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{s.title}</h3>
                <p className="mb-1 text-sm font-medium" style={{ color: s.color }}>{s.short}</p>
                <p className="mb-6 mt-2 flex-1 text-[15px] leading-relaxed text-slate-600">{s.description}</p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition-all group-hover:gap-3">Saber mais <ArrowRight size={16} /></span>
              </Link>
            ))}
            <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-brand to-[#1D3FD8] p-7 text-white">
              <div>
                <Sparkles size={26} className="mb-5 opacity-90" />
                <h3 className="text-xl font-bold">Não sabe por onde começar?</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-blue-100">Fazemos um check-up gratuito às suas despesas fixas e mostramos onde pode poupar.</p>
              </div>
              <Link href="/contactos" className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-brand transition hover:bg-blue-50">
                Pedir check-up gratuito <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Campaigns from CRM */}
      {visibleCampaigns.length > 0 && (
        <section className="bg-slate-50 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest" style={{ color: primary }}><Sparkles size={16} /> Campanhas em vigor</p>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Ofertas atuais</h2>
              </div>
              <Link href="/contactos" className="text-sm font-semibold" style={{ color: primary }}>Pedir análise personalizada →</Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visibleCampaigns.map((campaign: any) => (
                <article key={campaign.id} className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  {campaign.is_featured && <span className="absolute right-4 top-4 rounded-full px-2.5 py-1 text-[11px] font-bold text-white" style={{ backgroundColor: primary }}>Destaque</span>}
                  <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">{campaign.operator || campaign.segment}</div>
                  <h3 className="pr-16 text-xl font-bold text-slate-900">{campaign.title}</h3>
                  {campaign.subtitle && <p className="mt-2 text-sm leading-relaxed text-slate-600">{campaign.subtitle}</p>}
                  {campaign.price != null && <div className="mt-5 text-3xl font-extrabold" style={{ color: primary }}>{Number(campaign.price).toFixed(2).replace('.', ',')}€ <span className="text-sm font-normal text-slate-500">{campaign.price_suffix || '/mês'}</span></div>}
                  {Array.isArray(campaign.features) && campaign.features.length > 0 && (
                    <ul className="mt-5 space-y-2 text-sm text-slate-700">
                      {campaign.features.slice(0, 5).map((f: string) => <li key={f} className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: primary }} />{f}</li>)}
                    </ul>
                  )}
                  <div className="mt-auto pt-6">
                    <Link href={campaign.cta_url || `/contactos?servico=${campaign.segment ?? ''}`} className="inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-bold text-white" style={{ backgroundColor: primary }}>
                      {campaign.cta_label || 'Pedir proposta'}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-[#0B1220] py-20 text-white lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-400">Como funciona</p>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">Simples, transparente e sem custos.</h2>
              <p className="mt-5 text-lg leading-relaxed text-slate-300">Em três passos, sabe quanto pode poupar e o que muda — antes de decidir.</p>
              <ul className="mt-8 grid gap-3">
                {reasons.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-slate-200"><CheckCircle2 size={20} className="mt-0.5 shrink-0 text-blue-400" />{r}</li>
                ))}
              </ul>
            </div>
            <ol className="grid gap-5">
              {steps.map((st, i) => (
                <li key={st.title} className="flex gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-7">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand">
                    <st.icon size={22} />
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-extrabold text-brand">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{st.title}</h3>
                    <p className="mt-1.5 leading-relaxed text-slate-300">{st.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-[#1D4ED8] to-[#1E3A8A] px-6 py-14 text-center text-white sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
            <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">Pronto para pagar menos?</h2>
            <p className="relative mx-auto mb-8 mt-4 max-w-2xl text-lg text-blue-100">Fale com um especialista PARCENDi. Consultoria gratuita e sem compromisso.</p>
            <div className="relative flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/contactos" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 font-bold text-brand transition hover:bg-blue-50">
                {settings?.consultation_cta_label || 'Pedir consultoria gratuita'} <ArrowRight size={18} />
              </Link>
              <a href={SITE.phoneHref} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-white/60 px-8 font-bold text-white transition hover:bg-white/10">
                <Phone size={18} /> {SITE.phoneShort}
              </a>
              <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-white/60 px-8 font-bold text-white transition hover:bg-white/10">
                <MessageCircle size={18} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
