import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const allowedSegments = ['energia', 'telecom', 'credito', 'imobiliario', 'seguros'] as const

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(180),
  phone: z.string().max(40).optional().nullable(),
  segment: z.string().optional().nullable(),
  message: z.string().min(10).max(4000),
  rgpd_consent: z.literal(true),
  page: z.string().max(200).optional().nullable(),
  source_campaign: z.string().max(120).optional().nullable(),
})

function normalizeSegment(value?: string | null): typeof allowedSegments[number] {
  const normalized = String(value ?? '').trim().toLowerCase()
  return (allowedSegments as readonly string[]).includes(normalized)
    ? normalized as typeof allowedSegments[number]
    : 'telecom'
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    const admin = createAdminClient()
    const segment = normalizeSegment(data.segment)
    const consentDate = new Date().toISOString()

    // 1) Criar primeiro a lead operacional. O pedido do site entra logo no CRM como lead quente.
    const { data: lead, error: leadError } = await (admin.from('parcendi_leads') as any)
      .insert({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        origin: 'website',
        segment,
        status: 'nova',
        score: 90,
        notes: data.message.trim(),
        rgpd_consent: true,
        rgpd_consent_date: consentDate,
        source_campaign: data.source_campaign?.trim() || 'consultoria_site',
        source_medium: 'website',
        external_source: 'parcendi.pt',
      })
      .select('id')
      .single()

    if (leadError || !lead) {
      console.error('[contact api] lead error', leadError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // 2) Guardar também a submissão original para auditoria e ligar ao registo da lead.
    const { error: submissionError } = await (admin.from('parcendi_contact_submissions') as any).insert({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || null,
      segment,
      message: data.message.trim(),
      rgpd_consent: true,
      origin: 'website',
      page: data.page || '/contactos',
      lead_id: lead.id,
      processed: false,
    })

    if (submissionError) {
      console.error('[contact api] submission error', submissionError)
      // A lead já existe e não deve ser perdida por falha no registo auxiliar.
    }

    return NextResponse.json({ success: true, lead_id: lead.id })
  } catch (err) {
    console.error('[contact api] validation error', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
