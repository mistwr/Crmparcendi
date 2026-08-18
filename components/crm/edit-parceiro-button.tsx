'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import type { PartnerType } from '@/lib/supabase/types'

const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  individual: 'Individual', empresa: 'Empresa', franquia: 'Franquia', agente: 'Agente',
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
  unit_id?: string | null
}

interface Props {
  partner: Partner
  units: { id: string; name: string }[]
}

export function EditParceiroButton({ partner, units }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: partner.name,
    email: partner.email ?? '',
    phone: partner.phone ?? '',
    nif: partner.nif ?? '',
    type: (partner.type as PartnerType) ?? 'individual',
    commission_rate: partner.commission_rate?.toString() ?? '',
    unit_id: partner.unit_id ?? '',
    is_active: partner.is_active ?? true,
  })
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Nome obrigatório'); return }
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('parcendi_partners') as any)
      .update({
        name: form.name.trim(),
        email: form.email || null,
        phone: form.phone || null,
        nif: form.nif || null,
        type: form.type,
        commission_rate: form.commission_rate ? parseFloat(form.commission_rate) : null,
        unit_id: form.unit_id || null,
        is_active: form.is_active,
      })
      .eq('id', partner.id)
    setLoading(false)
    if (error) { toast.error('Erro ao atualizar parceiro'); return }
    toast.success('Parceiro atualizado')
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-md text-muted-foreground hover:text-brand hover:bg-secondary transition-colors"
        title="Editar parceiro"
      >
        <Pencil size={14} />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar Parceiro</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as PartnerType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PARTNER_TYPE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Comissão (%)</Label>
                <Input type="number" step="0.01" value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>NIF</Label>
                <Input value={form.nif} onChange={(e) => setForm({ ...form, nif: e.target.value })} />
              </div>
              {units.length > 0 && (
                <div className="space-y-1.5">
                  <Label>Unidade</Label>
                  <Select value={form.unit_id || 'none'} onValueChange={(v) => setForm({ ...form, unit_id: !v || v === 'none' ? '' : v })}>
                    <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {units.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
              Parceiro ativo
            </label>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancelar</Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-brand hover:bg-brand-dark text-white">
                {loading && <Loader2 size={14} className="animate-spin mr-1" />}
                Guardar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
