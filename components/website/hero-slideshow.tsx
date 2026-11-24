'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Phone, CheckCircle2 } from 'lucide-react'
import { SERVICES, SITE } from '@/lib/site'
import { ContactForm } from '@/components/website/contact-form'
import { cn } from '@/lib/utils'

const HEADLINES: Record<string, { title: string; highlight: string }> = {
  energia: { title: 'Pague menos pela sua', highlight: 'energia' },
  telecom: { title: 'Internet e TV ao preço', highlight: 'certo' },
  credito: { title: 'Crédito com condições', highlight: 'claras' },
  imobiliario: { title: 'O seu imóvel em', highlight: 'boas mãos' },
  seguros: { title: 'Proteja o que é', highlight: 'importante' },
}

const DURATION = 6000

export function HeroSlideshow() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const s = SERVICES[current]
  const Icon = s.icon

  useEffect(() => {
    if (paused) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const t = setInterval(() => setCurrent((c) => (c + 1) % SERVICES.length), DURATION)
    return () => clearInterval(t)
  }, [paused])

  return (
    <section className="relative overflow-hidden bg-[#F6F8FC]">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full opacity-25 blur-3xl transition-colors duration-1000" style={{ backgroundColor: s.color }} />
        <div className="absolute -bottom-48 -left-32 h-[480px] w-[480px] rounded-full bg-brand opacity-[0.12] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: 'linear-gradient(#E3E8F2 1px, transparent 1px), linear-gradient(90deg, #E3E8F2 1px, transparent 1px)', backgroundSize: '56px 56px', maskImage: 'radial-gradient(ellipse at 30% 40%, black 20%, transparent 70%)' }} />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-8 lg:py-24">
        <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-white px-4 py-1.5 text-sm font-semibold text-brand shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand" /> Consultoria gratuita · 5 áreas, 1 só parceiro
          </div>

          <div className="min-h-[200px] sm:min-h-[220px]" aria-live="polite">
            <h1 key={s.key} className="animate-in fade-in slide-in-from-bottom-2 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 duration-700 sm:text-5xl lg:text-6xl">
              {HEADLINES[s.key].title}{' '}
              <span className="relative whitespace-nowrap" style={{ color: s.color }}>{HEADLINES[s.key].highlight}</span>
            </h1>
            <p key={`${s.key}-p`} className="animate-in fade-in mt-5 max-w-xl text-lg leading-relaxed text-slate-600 duration-700">{s.description}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={`/contactos?servico=${s.key}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-7 font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark">
              Pedir consultoria gratuita <ArrowRight size={18} />
            </Link>
            <a href={SITE.phoneHref} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-7 font-semibold text-slate-800 transition hover:border-brand hover:text-brand">
              <Phone size={18} /> {SITE.phoneShort}
            </a>
          </div>

          {/* Service tabs */}
          <div className="mt-10 flex flex-wrap gap-2" role="tablist" aria-label="Serviços">
            {SERVICES.map((svc, i) => {
              const I = svc.icon
              const active = i === current
              return (
                <button
                  key={svc.key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => { setCurrent(i); setPaused(true) }}
                  className={cn(
                    'relative inline-flex items-center gap-2 overflow-hidden rounded-full border px-4 py-2 text-sm font-semibold transition',
                    active ? 'border-transparent text-white shadow-md' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
                  )}
                  style={active ? { backgroundColor: svc.color } : undefined}
                >
                  <I size={16} /> {svc.title}
                  {active && !paused && (
                    <span key={current} className="absolute bottom-0 left-0 h-0.5 bg-white/70" style={{ animation: `hero-progress ${DURATION}ms linear forwards` }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Quick contact card */}
        <div className="relative" onFocusCapture={() => setPaused(true)}>
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl shadow-slate-900/10 sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl transition-colors" style={{ backgroundColor: s.bg }}>
                <Icon size={22} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">Ligamos-lhe nós</p>
                <p className="text-sm text-slate-500">Resposta em horário útil, sem compromisso</p>
              </div>
            </div>
            <ul className="mb-5 grid gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              {s.points.map((p) => (
                <li key={p} className="flex items-center gap-2"><CheckCircle2 size={16} style={{ color: s.color }} /> {p}</li>
              ))}
            </ul>
            <ContactForm variant="quick" defaultSegment={s.key} />
          </div>
        </div>
      </div>
    </section>
  )
}
