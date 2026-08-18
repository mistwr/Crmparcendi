import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CRMSidebar } from '@/components/crm/sidebar'

export default async function CRMLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('parcendi_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // A valid Supabase auth session isn't enough here: this CRM is an isolated
  // tenant, so the user also needs an active row in parcendi_profiles. Without
  // one (e.g. an SD Dialer account that was never linked to Parcendi, or one
  // that's marked inactive), send them back with a clear reason instead of
  // rendering a dashboard with no data and no permissions.
  if (!profile || !profile.is_active) {
    redirect('/auth/login?erro=sem-acesso-parcendi')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-secondary">
      <CRMSidebar profile={profile} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
