import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const allowedSegments = ['energia', 'telecom', 'credito', 'imobiliario', 'seguros'] as const
type AllowedSegment = typeof allowedSegments[number]

const optionalText = (max: number) =>
  z.string().max(max).optional().nullable().transform((v) => (v ?? '').trim() || null)

const schema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: optionalText(180),
    phone: optionalText(40),
    segment: optionalText(40),
    message: optionalText(4000),
    rgpd_consent: z.literal(true),
    page: optionalText(200),
    source_campaign: optionalText(120),
    website: optionalText(200), // honeypot — must stay empty
  })
  .refine((d) => !d.email || z.string().email().safeParse(d.email).success, { path: ['email'], message: 'Email inválido' })
  .refine((d) => !d.phone || d.phone.replace(/\D/g, '').length >= 9, { path: ['phone'], message: 'Telefone inválido' })
  .refine((d) => d.email || d.phone, { path: ['phone'], message: 'Indique telefone ou email' })

const SEGMENT_LABEL: Record<string, string> = {
  energia: 'Energia', telecom: 'Telecom', credito: 'Crédito', imobiliario: 'Imobiliário', seguros: 'Seguros', outro: 'Outro',
}

function normalizeSegment(value?: string | null): { segment: AllowedSegment; label: string } {
  const normalized = String(value ?? '').trim().toLowerCase()
  if ((allowedSegments as readonly string[]).includes(normalized)) {
    return { segment: normalized as AllowedSegment, label: SEGMENT_LABEL[normalized] }
  }
  // A coluna segment é obrigatória no CRM; pedidos "Outro"/sem serviço ficam em energia
  // mas com a indicação explícita nas notas para triagem.
  return { segment: 'energia', label: normalized ? SEGMENT_LABEL[normalized] ?? normalized : 'Não indicado' }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return NextResponse.json({ error: first?.message || 'Dados inválidos', field: first?.path?.[0] }, { status: 400 })
  }
  const data = parsed.data

  // Bot preencheu o honeypot: responder como sucesso sem gravar nada.
  if (data.website) return NextResponse.json({ success: true })

  try {
    const admin = createAdminClient()
    const { segment, label } = normalizeSegment(data.segment)
    const consentDate = new Date().toISOString()
    const email = data.email?.toLowerCase() ?? null
    const page = data.page || '/contactos'
    const notes = [`Interesse: ${label}`, `Página: ${page}`, data.message ? `Mensagem: ${data.message}` : 'Pedido de contacto rápido (sem mensagem).'].join('\n')

    const { data: lead, error: leadError } = await (admin.from('parcendi_leads') as any)
      .insert({
        name: data.name,
        email,
        phone: data.phone,
        origin: 'website',
        segment,
        status: 'nova',
        score: 90,
        notes,
        rgpd_consent: true,
        rgpd_consent_date: consentDate,
        source_campaign: data.source_campaign || 'consultoria_site',
        source_medium: 'website',
        external_source: 'parcendi.pt',
      })
      .select('id')
      .single()

    if (leadError || !lead) {
      console.error('[contact api] lead error', leadError)
      return NextResponse.json({ error: 'Não foi possível registar o pedido. Ligue-nos para 961 383 587.' }, { status: 500 })
    }

    const { error: submissionError } = await (admin.from('parcendi_contact_submissions') as any).insert({
      name: data.name,
      email: email ?? '',
      phone: data.phone,
      segment,
      message: data.message ?? `Pedido de contacto rápido — interesse: ${label}`,
      rgpd_consent: true,
      origin: 'website',
      page,
      lead_id: lead.id,
      processed: false,
    })
    if (submissionError) console.error('[contact api] submission error', submissionError)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact api] unexpected error', err)
    return NextResponse.json({ error: 'Erro inesperado. Tente novamente ou ligue-nos.' }, { status: 500 })
  }
}
