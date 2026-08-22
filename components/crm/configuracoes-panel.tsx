'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { SEGMENT_LABELS, ROLE_LABELS, ADMIN_ROLES } from '@/lib/constants'
import type { Profile, CommissionConfig, Segment } from '@/lib/supabase/types'
import { formatPercent } from '@/lib/format'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save, UserCircle, Percent, Workflow, GripVertical, Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'

interface PipelineStage {
  id: string
  segment: Segment
  name: string
  position: number
  color: string
  is_won: boolean
  is_lost: boolean
  is_active: boolean
}

interface Props {
  profile: Profile | null
  commissionConfigs: CommissionConfig[]
  pipelineStages: PipelineStage[]
}

export function ConfiguracoesPanel({ profile, commissionConfigs, pipelineStages }: Props) {
  const isAdmin = profile?.role && ADMIN_ROLES.includes(profile.role)

  return (
    <Tabs defaultValue="perfil" className="space-y-6">
      <TabsList className="bg-secondary">
        <TabsTrigger value="perfil" className="gap-2"><UserCircle size={14} /> Perfil</TabsTrigger>
        {isAdmin && <TabsTrigger value="comissoes" className="gap-2"><Percent size={14} /> Comissões</TabsTrigger>}
        {isAdmin && <TabsTrigger value="pipeline" className="gap-2"><Workflow size={14} /> Pipeline</TabsTrigger>}
      </TabsList>

      <TabsContent value="perfil">
        <ProfileTab profile={profile} />
      </TabsContent>
      {isAdmin && (
        <TabsContent value="comissoes">
          <CommissionsTab configs={commissionConfigs} />
        </TabsContent>
      )}
      {isAdmin && (
        <TabsContent value="pipeline">
          <PipelineTab stages={pipelineStages} />
        </TabsContent>
      )}
    </Tabs>
  )
}

function ProfileTab({ profile }: { profile: Profile | null }) {
  const [form, setForm] = useState({
    first_name: profile?.first_name ?? '',
    last_name: profile?.last_name ?? '',
    phone: profile?.phone ?? '',
    nif: profile?.nif ?? '',
    iban: profile?.iban ?? '',
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('parcendi_profiles') as any).update({
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone || null,
      nif: form.nif || null,
      iban: form.iban || null,
    }).eq('id', profile.id)
    setLoading(false)
    if (error) { toast.error('Erro ao guardar perfil'); return }
    toast.success('Perfil atualizado com sucesso')
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 max-w-xl">
      <h2 className="font-semibold text-sm mb-4">Dados Pessoais</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Primeiro Nome</Label>
            <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Apelido</Label>
            <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={profile?.email ?? ''} disabled className="opacity-60 cursor-not-allowed" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Telefone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+351 9XX XXX XXX" />
          </div>
          <div className="space-y-1.5">
            <Label>NIF</Label>
            <Input value={form.nif} onChange={(e) => setForm({ ...form, nif: e.target.value })} placeholder="000 000 000" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>IBAN</Label>
          <Input value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} placeholder="PT50 0000 0000 0000 0000 0000 0" />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">
            Função: <span className="font-medium text-foreground">{profile?.role ? ROLE_LABELS[profile.role] : '—'}</span>
          </div>
          <Button type="submit" disabled={loading} size="sm" className="ml-auto gap-1.5 bg-brand hover:bg-brand-dark text-white">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Guardar
          </Button>
        </div>
      </form>
    </div>
  )
}

function CommissionsTab({ configs }: { configs: CommissionConfig[] }) {
  const bySegment: Partial<Record<Segment, CommissionConfig[]>> = {}
  configs.forEach((c) => {
    if (!bySegment[c.segment]) bySegment[c.segment] = []
    bySegment[c.segment]!.push(c)
  })

  return (
    <div className="space-y-6">
      {Object.entries(SEGMENT_LABELS).map(([seg, label]) => {
        const segConfigs = bySegment[seg as Segment] ?? []
        return (
          <div key={seg} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-secondary">
              <h3 className="font-semibold text-sm">{label}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Função</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">%</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Franquia</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Marketing</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Recrutamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {segConfigs.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-3 text-xs text-muted-foreground">Sem configuração definida</td></tr>
                  ) : (
                    segConfigs.map((c) => (
                      <tr key={c.id} className="hover:bg-secondary/30">
                        <td className="px-4 py-2.5 text-sm">{ROLE_LABELS[c.role] ?? c.role}</td>
                        <td className="px-4 py-2.5 font-medium">{formatPercent(c.percentage)}</td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{formatPercent(c.franquia_percentage)}</td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{formatPercent(c.marketing_percentage)}</td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{formatPercent(c.recrutamento_percentage)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PipelineTab({ stages: initialStages }: { stages: PipelineStage[] }) {
  const [activeSegment, setActiveSegment] = useState<Segment>('energia')
  const [stagesBySegment, setStagesBySegment] = useState<Record<string, PipelineStage[]>>(() => {
    const grouped: Record<string, PipelineStage[]> = {}
    for (const s of initialStages) {
      if (!grouped[s.segment]) grouped[s.segment] = []
      grouped[s.segment].push(s)
    }
    return grouped
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const stages = (stagesBySegment[activeSegment] ?? []).sort((a, b) => a.position - b.position)

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return
    const items = Array.from(stages)
    const [moved] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, moved)

    const reordered = items.map((s, i) => ({ ...s, position: i }))
    setStagesBySegment((prev) => ({ ...prev, [activeSegment]: reordered }))

    try {
      await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reordered.map((s) => (supabase.from('parcendi_pipeline_stages') as any).update({ position: s.position }).eq('id', s.id))
      )
    } catch {
      toast.error('Erro ao guardar nova ordem')
    }
  }

  async function createStage() {
    if (!newName.trim()) return
    setSaving(true)
    const nextPosition = stages.length > 0 ? Math.max(...stages.map((s) => s.position)) + 1 : 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('parcendi_pipeline_stages') as any).insert({
      segment: activeSegment, name: newName.trim(), position: nextPosition, color: '#64748B', is_won: false, is_lost: false, is_active: true,
    }).select().single()
    setSaving(false)
    if (error) { toast.error('Erro ao criar etapa'); return }
    setStagesBySegment((prev) => ({ ...prev, [activeSegment]: [...(prev[activeSegment] ?? []), data] }))
    setNewName('')
    setShowNew(false)
    toast.success('Etapa criada')
  }

  async function renameStage(id: string) {
    if (!editName.trim()) return
    setSaving(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('parcendi_pipeline_stages') as any).update({ name: editName.trim() }).eq('id', id)
    setSaving(false)
    if (error) { toast.error('Erro ao renomear'); return }
    setStagesBySegment((prev) => ({
      ...prev,
      [activeSegment]: (prev[activeSegment] ?? []).map((s) => (s.id === id ? { ...s, name: editName.trim() } : s)),
    }))
    setEditingId(null)
  }

  async function deleteStage(id: string) {
    if (!confirm('Apagar esta etapa? Os negocios que estiverem nela ficam sem etapa atribuida.')) return
    setSaving(true)
    await (supabase.from('parcendi_deals') as any).update({ stage_id: null }).eq('stage_id', id)
    const { error } = await (supabase.from('parcendi_pipeline_stages') as any).delete().eq('id', id)
    setSaving(false)
    if (error) { toast.error('Erro ao apagar etapa'); return }
    setStagesBySegment((prev) => ({ ...prev, [activeSegment]: (prev[activeSegment] ?? []).filter((s) => s.id !== id) }))
  }

  async function toggleFlag(stage: PipelineStage, flag: 'is_won' | 'is_lost') {
    setSaving(true)
    const updates: Partial<PipelineStage> = { [flag]: !stage[flag] }
    if (flag === 'is_won' && !stage.is_won) updates.is_lost = false
    if (flag === 'is_lost' && !stage.is_lost) updates.is_won = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('parcendi_pipeline_stages') as any).update(updates).eq('id', stage.id)
    setSaving(false)
    if (error) { toast.error('Erro ao atualizar'); return }
    setStagesBySegment((prev) => ({
      ...prev,
      [activeSegment]: (prev[activeSegment] ?? []).map((s) => (s.id === stage.id ? { ...s, ...updates } : s)),
    }))
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Arrasta as etapas (pelo ícone à esquerda) para mudar a ordem em que aparecem no funil de cada segmento.
      </p>

      <div className="flex gap-2 flex-wrap">
        {Object.entries(SEGMENT_LABELS).map(([seg, label]) => (
          <button
            key={seg}
            onClick={() => setActiveSegment(seg as Segment)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              activeSegment === seg ? 'bg-brand text-white border-brand' : 'bg-card border-border text-foreground hover:bg-secondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-secondary flex items-center justify-between">
          <h3 className="font-semibold text-sm">Etapas — {SEGMENT_LABELS[activeSegment]}</h3>
          <span className="text-xs text-muted-foreground">{stages.length} etapas</span>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="stages">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {stages.map((stage, index) => (
                  <Draggable key={stage.id} draggableId={stage.id} index={index}>
                    {(dragProvided, snapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 bg-card ${snapshot.isDragging ? 'shadow-lg ring-1 ring-brand/40' : ''}`}
                      >
                        <div {...dragProvided.dragHandleProps} className="cursor-grab text-muted-foreground/50 hover:text-muted-foreground">
                          <GripVertical size={16} />
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                        {editingId === stage.id ? (
                          <input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') renameStage(stage.id); if (e.key === 'Escape') setEditingId(null) }}
                            className="flex-1 text-sm border border-brand rounded-md px-2 py-1 outline-none"
                          />
                        ) : (
                          <span className="flex-1 text-sm font-medium text-foreground">{stage.name}</span>
                        )}
                        <button
                          onClick={() => toggleFlag(stage, 'is_won')}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stage.is_won ? 'bg-green-100 text-green-700' : 'bg-secondary text-muted-foreground'}`}
                        >
                          Ganho
                        </button>
                        <button
                          onClick={() => toggleFlag(stage, 'is_lost')}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stage.is_lost ? 'bg-red-100 text-red-700' : 'bg-secondary text-muted-foreground'}`}
                        >
                          Perdido
                        </button>
                        {editingId === stage.id ? (
                          <button onClick={() => renameStage(stage.id)} className="text-green-600 p-1"><Check size={14} /></button>
                        ) : (
                          <button onClick={() => { setEditingId(stage.id); setEditName(stage.name) }} className="text-muted-foreground p-1"><Pencil size={13} /></button>
                        )}
                        <button onClick={() => deleteStage(stage.id)} className="text-red-500 p-1"><Trash2 size={13} /></button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="p-3">
          {!showNew ? (
            <button
              onClick={() => setShowNew(true)}
              className="w-full flex items-center justify-center gap-2 border border-dashed border-border rounded-lg py-2 text-xs font-semibold text-muted-foreground hover:border-brand hover:text-brand transition-colors"
            >
              <Plus size={14} /> Nova Etapa
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') createStage(); if (e.key === 'Escape') setShowNew(false) }}
                placeholder="Nome da etapa"
                className="flex-1 text-sm border border-brand rounded-md px-3 py-1.5 outline-none"
              />
              <Button onClick={createStage} disabled={saving} size="sm" className="bg-brand hover:bg-brand-dark text-white">Adicionar</Button>
              <Button onClick={() => setShowNew(false)} size="sm" variant="ghost"><X size={14} /></Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
