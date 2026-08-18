import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/crm/page-header'
import { EnergySimulator } from '@/components/crm/energy-simulator'

export const metadata = { title: 'Simulador de Energia — CRM PARCENDi' }

export default async function SimuladorEnergiaPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('parcendi_energy_tariffs').select('id, supplier, plan_name, tariff_type, power_kva, energy_price_kwh, daily_fixed_price, source_url, last_verified_at').eq('is_active', true).or(`valid_until.is.null,valid_until.gte.${new Date().toISOString().slice(0,10)}`)
  return <div className="p-6 lg:p-8"><PageHeader title="Simulador de Energia" description="Compare os tarifários ativos e estime a poupança do cliente" /><EnergySimulator tariffs={data ?? []} /></div>
}
