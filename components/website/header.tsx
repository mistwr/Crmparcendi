'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X, Phone, ChevronDown, LogIn } from 'lucide-react'
import { SERVICES, SITE } from '@/lib/site'
import { cn } from '@/lib/utils'

const companyLinks = [
  { href: '/barcelos', label: 'Sobre nós' },
  { href: '/unidades', label: 'Unidades' },
  { href: '/contactos', label: 'Contactos' },
]

export function WebsiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isActive = (href: string) => pathname === href

  return (
    <header className={cn('sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md transition-shadow', scrolled ? 'border-slate-200 shadow-sm' : 'border-transparent')}>
      {/* Top bar */}
      <div className="hidden bg-[#0B1220] text-xs text-slate-300 md:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <p>Consultoria gratuita em Energia, Telecom, Crédito, Imobiliário e Seguros</p>
          <div className="flex items-center gap-5">
            <a href={`mailto:${SITE.email}`} className="hover:text-white">{SITE.email}</a>
            <a href={SITE.phoneHref} className="font-semibold text-white">{SITE.phone}</a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label="PARCENDi — página inicial">
          <Image src="/logo-parcendi-mark.png" alt="PARCENDi 5.0" width={640} height={198} className="h-10 w-auto lg:h-12" priority />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {SERVICES.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={cn('rounded-lg px-3 py-2 text-sm font-semibold transition-colors', isActive(s.href) ? 'bg-brand-light text-brand' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}
            >
              {s.title}
            </Link>
          ))}
          <div className="group relative">
            <button className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900" aria-haspopup="true">
              Empresa <ChevronDown size={15} className="transition group-hover:rotate-180" />
            </button>
            <div className="invisible absolute right-0 top-full w-48 translate-y-1 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                {companyLinks.map((l) => (
                  <Link key={l.href} href={l.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">{l.label}</Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/auth/login" className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900">
            <LogIn size={16} /> Área CRM
          </Link>
          <Link href="/contactos" className="inline-flex h-10 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-md shadow-brand/20 transition hover:bg-brand-dark">
            Consultoria gratuita
          </Link>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <a href={SITE.phoneHref} className="flex h-10 w-10 items-center justify-center rounded-lg text-brand" aria-label="Ligar">
            <Phone size={20} />
          </a>
          <button className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100" onClick={() => setOpen(!open)} aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-slate-200 bg-white px-4 pb-8 pt-4 lg:hidden">
          <p className="px-3 pb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Serviços</p>
          <div className="grid gap-1">
            {SERVICES.map((s) => (
              <Link key={s.href} href={s.href} className={cn('flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold', isActive(s.href) ? 'bg-brand-light text-brand' : 'text-slate-800 hover:bg-slate-50')}>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: s.bg }}><s.icon size={18} style={{ color: s.color }} /></span>
                {s.title}
                <span className="ml-auto text-xs font-normal text-slate-500">{s.short}</span>
              </Link>
            ))}
          </div>
          <p className="px-3 pb-2 pt-6 text-xs font-bold uppercase tracking-widest text-slate-400">Empresa</p>
          {companyLinks.map((l) => (
            <Link key={l.href} href={l.href} className="block rounded-xl px-3 py-3 text-base font-semibold text-slate-800 hover:bg-slate-50">{l.label}</Link>
          ))}
          <div className="mt-6 grid gap-3">
            <Link href="/contactos" className="inline-flex h-12 items-center justify-center rounded-xl bg-brand font-semibold text-white">Consultoria gratuita</Link>
            <Link href="/auth/login" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 font-semibold text-slate-700"><LogIn size={16} /> Área CRM</Link>
          </div>
        </div>
      )}
    </header>
  )
}
