import Link from 'next/link'
import Image from 'next/image'
import { Mail, MapPin, Phone, Clock } from 'lucide-react'
import { SERVICES, SITE } from '@/lib/site'

const company = [
  { href: '/barcelos', label: 'Sobre nós' },
  { href: '/unidades', label: 'Unidades' },
  { href: '/contactos', label: 'Contactos' },
  { href: '/auth/login', label: 'Área CRM' },
]
const legal = [
  { href: '/privacidade', label: 'Política de Privacidade' },
  { href: '/termos', label: 'Termos de Uso' },
  { href: '/rgpd', label: 'RGPD' },
  { href: 'https://www.livroreclamacoes.pt', label: 'Livro de Reclamações', external: true },
]

export function WebsiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#0B1220] text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
          <div>
            <Image src="/logo-parcendi-mark-white.png" alt="PARCENDi 5.0" width={640} height={198} className="h-12 w-auto" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed">
              Consultoria multisserviços em Energia, Telecom, Crédito, Imobiliário e Seguros, para particulares e empresas.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li><a href={SITE.phoneHref} className="flex items-center gap-3 hover:text-white"><Phone size={16} className="text-blue-400" /> {SITE.phone}</a></li>
              <li><a href={`mailto:${SITE.email}`} className="flex items-center gap-3 hover:text-white"><Mail size={16} className="text-blue-400" /> {SITE.email}</a></li>
              <li className="flex items-start gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-blue-400" /> {SITE.street}, {SITE.locality}, {SITE.city}</li>
              <li className="flex items-start gap-3"><Clock size={16} className="mt-0.5 shrink-0 text-blue-400" /> <span>{SITE.hours.map((h) => `${h.days}: ${h.time}`).join(' · ')}</span></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Serviços</h3>
            <ul className="space-y-2.5 text-sm">
              {SERVICES.map((s) => <li key={s.href}><Link href={s.href} className="hover:text-white">{s.title}</Link></li>)}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Empresa</h3>
            <ul className="space-y-2.5 text-sm">
              {company.map((l) => <li key={l.href}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>)}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Legal</h3>
            <ul className="space-y-2.5 text-sm">
              {legal.map((l) => (
                <li key={l.href}>
                  {l.external
                    ? <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">{l.label}</a>
                    : <Link href={l.href} className="hover:text-white">{l.label}</Link>}
                </li>
              ))}
            </ul>
            <Link href="/contactos" className="mt-6 inline-flex h-10 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark">
              Consultoria gratuita
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© {year} PARCENDi. Todos os direitos reservados.</p>
          <p>Serviço de consultoria e intermediação em parceria com entidades e operadores do mercado.</p>
        </div>
      </div>
    </footer>
  )
}
