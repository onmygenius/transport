import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TransporterOffersClient from './client'

export default async function TransporterOffersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: offers } = await supabase
    .from('offers')
    .select(`
      *,
      shipment:shipments(
        id, origin_city, origin_country, destination_city, destination_country,
        container_type, pickup_date, status,
        client:profiles!shipments_client_id_fkey(id, company_name, full_name)
      )
    `)
    .eq('transporter_id', user.id)
    .order('created_at', { ascending: false })

  return <TransporterOffersClient offers={offers || []} />
}
