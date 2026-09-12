import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/crm/page-header'
import { SiteManager } from '@/components/crm/site-manager'

export const metadata: Metadata = { title: 'Site e Branding — CRM PARCENDi' }

const ADMIN_ROLES = ['superadmin', 'admin', 'ceo', 'direcao']

export default async function SiteAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('parcendi_profiles')
    .select('id, role, is_active')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_active || !ADMIN_ROLES.includes(profile.role)) {
    redirect('/crm/dashboard')
  }

  const [{ data: settings }, { data: campaigns }] = await Promise.all([
    (supabase.from('parcendi_site_settings') as any).select('*').eq('id', 'main').single(),
    (supabase.from('parcendi_site_campaigns') as any).select('*').order('position').order('created_at', { ascending: false }),
  ])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Site e Branding"
        description="Gere o aspeto do site, campanhas e ligações sem mexer no código"
      />
      <SiteManager settings={settings} campaigns={campaigns ?? []} userId={user.id} />
    </div>
  )
}
