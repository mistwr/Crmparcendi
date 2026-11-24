'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckCircle2, Loader2, Send, ShieldCheck } from 'lucide-react'
import { SITE } from '@/lib/site'
import { cn } from '@/lib/utils'

const SEGMENTS = [
  { value: 'energia', label: 'Energia' },
  { value: 'telecom', label: 'Telecom' },
  { value: 'credito', label: 'Crédito' },
  { value: 'imobiliario', label: 'Imobiliário' },
  { value: 'seguros', label: 'Seguros' },
  { value: 'outro', label: 'Outro assunto' },
]

type Errors = Partial<Record<'name' | 'email' | 'phone' | 'message' | 'rgpd' | 'form', string>>

const field =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15'

export function ContactForm({
  defaultSegment = '',
  variant = 'full',
  className,
}: {
  defaultSegment?: string
  variant?: 'full' | 'quick'
  className?: string
}) {
  const pathname = usePathname()
  const quick = variant === 'quick'
  const [segment, setSegment] = useState(defaultSegment)
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const touched = useRef(false)

  useEffect(() => {
    if (!touched.current) setSegment(defaultSegment)
  }, [defaultSegment])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const v = (k: string) => String(fd.get(k) ?? '').trim()
    const payload = {
      name: v('name'),
      email: v('email'),
      phone: v('phone'),
      message: v('message'),
      segment: segment || null,
      rgpd_consent: fd.get('rgpd') === 'on',
      website: v('website'),
      page: pathname,
      source_campaign: quick ? 'pedido_rapido_site' : 'consultoria_site',
    }

    const next: Errors = {}
    if (payload.name.length < 2) next.name = 'Indique o seu nome.'
    if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) next.email = 'Email inválido.'
    if (payload.phone && payload.phone.replace(/\D/g, '').length < 9) next.phone = 'Telefone inválido.'
    if (!payload.phone && !payload.email) next.phone = quick ? 'Indique o seu telefone.' : 'Indique telefone ou email.'
    if (!payload.rgpd_consent) next.rgpd = 'É necessário aceitar a Política de Privacidade.'
    setErrors(next)
    if (Object.keys(next).length) return

    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrors({ form: json?.error || 'Não foi possível enviar. Tente novamente.' })
        return
      }
      setDone(true)
    } catch {
      setErrors({ form: `Sem ligação. Tente novamente ou ligue ${SITE.phoneShort}.` })
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className={cn('flex flex-col items-center justify-center rounded-2xl py-10 text-center', className)} role="status">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 size={28} className="text-emerald-600" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-slate-900">Pedido recebido!</h3>
        <p className="max-w-xs text-sm leading-relaxed text-slate-600">
          Um especialista PARCENDi vai contactá-lo brevemente, em horário útil. Se preferir, ligue já para{' '}
          <a href={SITE.phoneHref} className="font-semibold text-brand">{SITE.phoneShort}</a>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className={cn('space-y-4', className)}>
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className={cn('grid gap-4', !quick && 'sm:grid-cols-2')}>
        <div>
          <label htmlFor={`${variant}-name`} className="mb-1.5 block text-sm font-semibold text-slate-800">Nome *</label>
          <input id={`${variant}-name`} name="name" autoComplete="name" placeholder="O seu nome" className={field} aria-invalid={!!errors.name} />
          {errors.name && <p className="mt-1 text-xs font-medium text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor={`${variant}-phone`} className="mb-1.5 block text-sm font-semibold text-slate-800">Telefone {quick && '*'}</label>
          <input id={`${variant}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="9XX XXX XXX" className={field} aria-invalid={!!errors.phone} />
          {errors.phone && <p className="mt-1 text-xs font-medium text-red-600">{errors.phone}</p>}
        </div>
      </div>

      {!quick && (
        <div>
          <label htmlFor="full-email" className="mb-1.5 block text-sm font-semibold text-slate-800">Email</label>
          <input id="full-email" name="email" type="email" autoComplete="email" placeholder="email@exemplo.pt" className={field} aria-invalid={!!errors.email} />
          {errors.email && <p className="mt-1 text-xs font-medium text-red-600">{errors.email}</p>}
        </div>
      )}

      <div>
        <label htmlFor={`${variant}-segment`} className="mb-1.5 block text-sm font-semibold text-slate-800">Serviço de interesse</label>
        <select
          id={`${variant}-segment`}
          value={segment}
          onChange={(e) => { touched.current = true; setSegment(e.target.value) }}
          className={cn(field, 'appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M4%206l4%204%204-4%22/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10')}
        >
          <option value="">Selecionar serviço</option>
          {SEGMENTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {!quick && (
        <div>
          <label htmlFor="full-message" className="mb-1.5 block text-sm font-semibold text-slate-800">Mensagem</label>
          <textarea id="full-message" name="message" rows={4} placeholder="Conte-nos o que precisa (ex.: valor da fatura atual, tipo de crédito, imóvel…)" className={cn(field, 'resize-y')} />
        </div>
      )}

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-slate-600">
          <input type="checkbox" name="rgpd" className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-[#0057FF]" />
          <span>
            Aceito a <Link href="/privacidade" className="font-medium text-brand underline underline-offset-2">Política de Privacidade</Link> e autorizo o contacto para resposta ao meu pedido. *
          </span>
        </label>
        {errors.rgpd && <p className="mt-1 text-xs font-medium text-red-600">{errors.rgpd}</p>}
      </div>

      {errors.form && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">{errors.form}</p>}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-[15px] font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark disabled:opacity-70"
      >
        {loading ? <><Loader2 size={18} className="animate-spin" /> A enviar…</> : <><Send size={17} /> {quick ? 'Quero ser contactado' : 'Enviar pedido'}</>}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
        <ShieldCheck size={14} /> Gratuito, sem compromisso e conforme o RGPD.
      </p>
    </form>
  )
}
