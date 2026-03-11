import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TransporterShipmentsClient from './client'
import TransporterShipmentsMobile from './mobile-client'

export default async function TransporterShipmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shipments } = await supabase
    .from('shipments')
    .select(`
      id,
      origin_city,
      origin_country,
      origin_address,
      destination_city,
      destination_country,
      destination_address,
      container_type,
      cargo_weight,
      cargo_type,
      transport_type,
      pickup_date,
      delivery_date,
      budget,
      budget_visible,
      currency,
      special_instructions,
      status,
      created_at,
      client:profiles!shipments_client_id_fkey(id, company_name, full_name, company_country, kyc_status),
      offers(count)
    `)
    .in('status', ['pending', 'offer_received'])
    .order('created_at', { ascending: false })

  const { data: myOffers } = await supabase
    .from('offers')
    .select('shipment_id, status')
    .eq('transporter_id', user.id)

  const myOffersMap: Record<string, string> = {}
  ;(myOffers || []).forEach((offer: any) => {
    myOffersMap[offer.shipment_id] = offer.status
  })

  // Transform client array to object (Supabase returns array for foreign key relations)
  const transformedShipments = (shipments || []).map((s: any) => ({
    ...s,
    client: Array.isArray(s.client) ? s.client[0] : s.client
  }))

  return (
    <>
      {/* Mobile View */}
      <div className="block lg:hidden">
        <TransporterShipmentsMobile
          shipments={transformedShipments}
          myOffers={myOffersMap}
        />
      </div>
      
      {/* Desktop View */}
      <div className="hidden lg:block">
        <TransporterShipmentsClient
          shipments={transformedShipments}
          myOffers={myOffersMap}
        />
      </div>
    </>
  )
}
