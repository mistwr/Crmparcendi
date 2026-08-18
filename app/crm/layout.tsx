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
    .single()

  let permissionCodes: string[] = []
  const roleId = (profile as { role_id?: string | null } | null)?.role_id
  if (roleId) {
    const { data } = await supabase.from('parcendi_role_permissions').select('allowed, permission:parcendi_permissions(code)').eq('role_id', roleId).eq('allowed', true)
    permissionCodes = (data ?? []).flatMap((row: { permission?: { code?: string } | { code?: string }[] | null }) => Array.isArray(row.permission) ? row.permission.map((p) => p.code).filter(Boolean) as string[] : row.permission?.code ? [row.permission.code] : [])
  }

  return (
    <div className="flex h-screen overflow-hidden bg-secondary">
      <CRMSidebar profile={profile} permissionCodes={permissionCodes} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
