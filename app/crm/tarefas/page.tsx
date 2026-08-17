import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/crm/page-header'
import { TarefasBoard } from '@/components/crm/tarefas-board'
import { NewTarefaButton } from '@/components/crm/new-tarefa-button'

export const metadata: Metadata = { title: 'Tarefas — CRM PARCENDi' }

export default async function TarefasPage() {
  const supabase = await createClient()

  const [tasksRes, profilesRes] = await Promise.all([
    supabase
      .from('parcendi_tasks')
      .select(`
        id, title, description, status, priority, due_date, completed_at, created_at,
        profiles:parcendi_profiles!parcendi_tasks_assigned_to_fkey (first_name, last_name)
      `)
      .order('due_date', { ascending: true, nullsFirst: false }),
    supabase.from('parcendi_profiles').select('id, first_name, last_name').eq('is_active', true),
  ])

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Tarefas"
        description="Gestão de tarefas e lembretes"
        action={<NewTarefaButton profiles={profilesRes.data ?? []} />}
      />
      <TarefasBoard tasks={tasksRes.data ?? []} />
    </div>
  )
}
