import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/crm/page-header'
import { ConfiguracoesPanel } from '@/components/crm/configuracoes-panel'

export const metadata: Metadata = { title: 'Configurações — CRM PARCENDi' }

export default async function ConfiguracoesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, configsRes, stagesRes] = await Promise.all([
    supabase.from('parcendi_profiles').select('*').eq('id', user.id).single(),
    supabase.from('parcendi_commission_configs').select('*').eq('is_active', true).order('segment').order('role'),
    supabase.from('parcendi_pipeline_stages').select('*').eq('is_active', true).order('segment').order('position'),
  ])

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Configurações"
        description="Perfil, comissões e pipelines"
      />
      <ConfiguracoesPanel
        profile={profileRes.data}
        commissionConfigs={configsRes.data ?? []}
        pipelineStages={stagesRes.data ?? []}
      />
    </div>
  )
}
