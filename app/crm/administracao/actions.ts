'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ADMIN_ROLES } from '@/lib/constants'
import type { UserRole } from '@/lib/supabase/types'

type Result = { ok: true } | { ok: false; error: string }

async function requireAdmin() {
  const client = await createClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return null
  const { data } = await client.from('parcendi_profiles').select('id, role').eq('id', user.id).maybeSingle()
  const profile = data as { id: string; role: UserRole } | null
  if (!profile || !ADMIN_ROLES.includes(profile.role)) return null
  return profile
}

// The generated database types lag behind the isolated parcendi_* schema.
// Keep the admin client server-only and use a narrow action boundary meanwhile.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function run(work: (admin: any, userId: string) => Promise<string | null>): Promise<Result> {
  const caller = await requireAdmin()
  if (!caller) return { ok: false, error: 'Sem permissões para esta ação.' }
  const error = await work(createAdminClient(), caller.id)
  if (error) return { ok: false, error }
  revalidatePath('/crm/administracao')
  revalidatePath('/crm/configuracoes')
  revalidatePath('/crm/unidades')
  return { ok: true }
}

export async function saveRole(input: { id?: string; name: string; slug: string; description?: string; parent_role_id?: string; hierarchy_level: number }) {
  return run(async (admin) => {
    const row = { name: input.name.trim(), slug: input.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'), description: input.description?.trim() || null, parent_role_id: input.parent_role_id || null, hierarchy_level: Number(input.hierarchy_level) || 0, is_active: true }
    const query = input.id ? admin.from('parcendi_roles').update(row).eq('id', input.id) : admin.from('parcendi_roles').insert(row)
    const { error } = await query
    return error?.message ?? null
  })
}

export async function toggleRolePermission(input: { role_id: string; permission_id: string; allowed: boolean }) {
  return run(async (admin) => {
    const { error } = await admin.from('parcendi_role_permissions').upsert(input, { onConflict: 'role_id,permission_id' })
    return error?.message ?? null
  })
}

export async function saveUnit(input: { id?: string; name: string; code: string; type: string; parent_unit_id?: string; manager_id?: string; address?: string; city?: string; postal_code?: string; phone?: string; email?: string; position: number }) {
  return run(async (admin) => {
    const row = { name: input.name.trim(), code: input.code.trim().toUpperCase(), type: input.type, parent_unit_id: input.parent_unit_id || null, manager_id: input.manager_id || null, address: input.address?.trim() || null, city: input.city?.trim() || null, postal_code: input.postal_code?.trim() || null, phone: input.phone?.trim() || null, email: input.email?.trim() || null, position: Number(input.position) || 0, is_active: true }
    const query = input.id ? admin.from('parcendi_units').update(row).eq('id', input.id) : admin.from('parcendi_units').insert(row)
    const { error } = await query
    return error?.message ?? null
  })
}

export async function savePipelineStage(input: { id?: string; segment: string; name: string; position: number; color: string; is_won: boolean; is_lost: boolean; is_active: boolean }) {
  return run(async (admin) => {
    const row = { segment: input.segment, name: input.name.trim(), position: Number(input.position) || 0, color: input.color || '#64748B', is_won: input.is_won, is_lost: input.is_lost, is_active: input.is_active }
    const query = input.id ? admin.from('parcendi_pipeline_stages').update(row).eq('id', input.id) : admin.from('parcendi_pipeline_stages').insert(row)
    const { error } = await query
    return error?.message ?? null
  })
}

export async function deletePipelineStage(id: string) {
  return run(async (admin) => {
    const { count } = await admin.from('parcendi_deals').select('id', { count: 'exact', head: true }).eq('stage_id', id)
    if (count) {
      const { error } = await admin.from('parcendi_pipeline_stages').update({ is_active: false }).eq('id', id)
      return error?.message ?? null
    }
    const { error } = await admin.from('parcendi_pipeline_stages').delete().eq('id', id)
    return error?.message ?? null
  })
}

export async function saveCommissionRule(input: { id?: string; name: string; segment: string; scope_type: string; role_id?: string; unit_id?: string; profile_id?: string; percentage: number; fixed_value?: number; priority: number }) {
  return run(async (admin) => {
    const row = { name: input.name.trim(), segment: input.segment, scope_type: input.scope_type, role_id: input.scope_type === 'role' ? input.role_id || null : null, unit_id: input.scope_type === 'unit' ? input.unit_id || null : null, profile_id: input.scope_type === 'user' ? input.profile_id || null : null, percentage: Number(input.percentage) || 0, fixed_value: input.fixed_value ? Number(input.fixed_value) : null, priority: Number(input.priority) || 0, is_active: true }
    const query = input.id ? admin.from('parcendi_commission_rules').update(row).eq('id', input.id) : admin.from('parcendi_commission_rules').insert(row)
    const { error } = await query
    return error?.message ?? null
  })
}

export async function saveEnergyTariff(input: { id?: string; supplier: string; plan_name: string; tariff_type: string; power_kva?: number; energy_price_kwh: number; daily_fixed_price: number; source_url?: string; valid_from: string; valid_until?: string }) {
  return run(async (admin) => {
    const row = { supplier: input.supplier.trim(), plan_name: input.plan_name.trim(), tariff_type: input.tariff_type, power_kva: input.power_kva ? Number(input.power_kva) : null, energy_price_kwh: Number(input.energy_price_kwh), daily_fixed_price: Number(input.daily_fixed_price) || 0, source_url: input.source_url?.trim() || null, valid_from: input.valid_from, valid_until: input.valid_until || null, last_verified_at: new Date().toISOString(), is_active: true }
    const query = input.id ? admin.from('parcendi_energy_tariffs').update(row).eq('id', input.id) : admin.from('parcendi_energy_tariffs').insert(row)
    const { error } = await query
    return error?.message ?? null
  })
}
