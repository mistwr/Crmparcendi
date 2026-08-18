import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/crm/page-header'
import { AdministracaoPanel } from '@/components/crm/administracao-panel'
import { ADMIN_ROLES } from '@/lib/constants'
import type { UserRole } from '@/lib/supabase/types'

export const metadata = { title: 'Administração — CRM PARCENDi' }

export default async function AdministracaoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: caller } = await supabase.from('parcendi_profiles').select('role').eq('id', user.id).maybeSingle()
  const callerProfile = caller as { role: UserRole } | null
  if (!callerProfile || !ADMIN_ROLES.includes(callerProfile.role)) redirect('/crm/dashboard')

  const [roles, permissions, rolePermissions, units, profiles, stages, rules, tariffs] = await Promise.all([
    supabase.from('parcendi_roles').select('*').eq('is_active', true).order('hierarchy_level'),
    supabase.from('parcendi_permissions').select('*').order('module').order('name'),
    supabase.from('parcendi_role_permissions').select('*'),
    supabase.from('parcendi_units').select('*').eq('is_active', true).order('position').order('name'),
    supabase.from('parcendi_profiles').select('id, first_name, last_name, email').eq('is_active', true).order('first_name'),
    supabase.from('parcendi_pipeline_stages').select('*').order('segment').order('position'),
    supabase.from('parcendi_commission_rules').select('*').eq('is_active', true).order('priority', { ascending: false }),
    supabase.from('parcendi_energy_tariffs').select('*').eq('is_active', true).order('supplier').order('plan_name'),
  ])

  return <div className="p-6 lg:p-8"><PageHeader title="Administração do CRM" description="Cargos, permissões, unidades, pipelines, comissões e energia num único painel" /><AdministracaoPanel roles={roles.data ?? []} permissions={permissions.data ?? []} rolePermissions={rolePermissions.data ?? []} units={units.data ?? []} profiles={profiles.data ?? []} stages={stages.data ?? []} rules={rules.data ?? []} tariffs={tariffs.data ?? []} /></div>
}
