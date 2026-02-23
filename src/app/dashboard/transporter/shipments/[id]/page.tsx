import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ShipmentDetailsClient from './client'

export default async function TransporterShipmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params

  const { data: shipment } = await supabase
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
      container_count,
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
      client:profiles!shipments_client_id_fkey(
        id,
        company_name,
        full_name,
        company_country,
        email,
        kyc_status
      )
    `)
    .eq('id', id)
    .single()

  if (!shipment) notFound()

  // Check if transporter already has an offer for this shipment
  const { data: existingOffer } = await supabase
    .from('offers')
    .select('id, status, price, estimated_days, available_from, message, created_at')
    .eq('shipment_id', id)
    .eq('transporter_id', user.id)
    .single()

  // Transform client array to object
  const transformedShipment = {
    ...shipment,
    client: Array.isArray(shipment.client) ? shipment.client[0] : shipment.client
  }

  return (
    <ShipmentDetailsClient
      shipment={transformedShipment}
      existingOffer={existingOffer || null}
    />
  )
}
