import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TransporterShipmentsClient from './client'

export default async function TransporterShipmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shipments } = await supabase
    .from('shipments')
    .select(`
      *,
      client:profiles!shipments_client_id_fkey(id, company_name, full_name, company_country, kyc_status),
      offers(count)
    `)
    .in('status', ['pending', 'offer_received'])
    .order('created_at', { ascending: false })

  const { data: myOffers } = await supabase
    .from('offers')
    .select('shipment_id')
    .eq('transporter_id', user.id)
    .in('status', ['pending', 'accepted'])

  const myOfferShipmentIds = new Set((myOffers || []).map(o => o.shipment_id))

  return (
    <TransporterShipmentsClient
      shipments={shipments || []}
      myOfferShipmentIds={Array.from(myOfferShipmentIds)}
    />
  )
}
