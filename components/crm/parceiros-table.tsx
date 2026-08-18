'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Phone, Mail, Trash2 } from 'lucide-react'
import { formatDate, formatPercent } from '@/lib/format'
import type { PartnerType } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { EditParceiroButton } from '@/components/crm/edit-parceiro-button'

const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  individual: 'Individual',
  empresa: 'Empresa',
  franquia: 'Franquia',
  agente: 'Agente',
}

const TYPE_COLORS: Record<PartnerType, string> = {
  individual: 'bg-blue-100 text-blue-700',
  empresa: 'bg-violet-100 text-violet-700',
  franquia: 'bg-amber-100 text-amber-700',
  agente: 'bg-teal-100 text-teal-700',
}

interface Partner {
  id: string
  name: string
  email: string | null
  phone: string | null
  type: string
  nif: string | null
  commission_rate: number | null
  is_active: boolean | null
  created_at: string
  unit_id?: string | null
  units?: { name: string } | null
}

interface Props {
  partners: Partner[]
  units: { id: string; name: string }[]
}

export function ParceirosTable({ partners, units }: Props) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const filtered = partners.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch = !search || p.name.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || p.phone?.includes(q)
    const matchType = typeFilter === 'all' || p.type === typeFilter
    return matchSearch && matchType
  })

  async function handleDelete(p: Partner) {
    if (!confirm(`Apagar o parceiro "${p.name}"? Esta ação não pode ser desfeita.`)) return
    setDeletingId(p.id)
    const { error } = await supabase.from('parcendi_partners').delete().eq('id', p.id)
    setDeletingId(null)
    if (error) { toast.error('Erro ao apagar parceiro'); return }
    toast.success('Parceiro apagado')
    router.refresh()
  }

  return (
    <div>
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Pesquisar parceiros..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(PARTNER_TYPE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground flex items-center">{filtered.length} parceiro{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                {['Nome', 'Tipo', 'Contacto', 'NIF', 'Unidade', 'Comissão', 'Ativo', 'Desde', 'Ações'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">Nenhum parceiro encontrado</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', TYPE_COLORS[p.type as PartnerType] ?? 'bg-secondary text-foreground')}>
                        {PARTNER_TYPE_LABELS[p.type as PartnerType] ?? p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        {p.phone && <a href={`tel:${p.phone}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-brand"><Phone size={11} /> {p.phone}</a>}
                        {p.email && <a href={`mailto:${p.email}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-brand"><Mail size={11} /> {p.email}</a>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.nif ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.units?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs font-medium">{formatPercent(p.commission_rate)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-medium', p.is_active ? 'text-green-600' : 'text-muted-foreground')}>
                        {p.is_active ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <EditParceiroButton partner={p} units={units} />
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={deletingId === p.id}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors disabled:opacity-50"
                          title="Apagar parceiro"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
