import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const origin = searchParams.get('origin') || ''
  const destination = searchParams.get('destination') || ''
  const date = searchParams.get('date') || ''
  const containerType = searchParams.get('containerType') || ''
  const shippingType = searchParams.get('shippingType') || ''

  const supabase = await createClient()

  let query = supabase
    .from('shipments')
    .select(`
      id,
      origin_city,
      origin_country,
      destination_city,
      destination_country,
      container_type,
      transport_type,
      pickup_date,
      delivery_date,
      budget,
      budget_visible,
      currency,
      status,
      client:profiles!shipments_client_id_fkey(company_name, full_name, kyc_status)
    `)
    .in('status', ['pending', 'offer_received'])
    .order('created_at', { ascending: false })
    .limit(10)

  // Apply filters
  if (origin) {
    query = query.ilike('origin_city', `%${origin}%`)
  }
  if (destination) {
    query = query.ilike('destination_city', `%${destination}%`)
  }
  if (date) {
    query = query.gte('pickup_date', date)
  }
  if (containerType) {
    query = query.eq('container_type', containerType)
  }
  if (shippingType && (shippingType === 'fcl' || shippingType === 'lcl')) {
    query = query.eq('transport_type', shippingType)
  }

  const { data: shipments, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform data for frontend
  const results = (shipments || []).map((s: any) => ({
    id: s.id,
    type: 'shipment',
    company: s.client?.company_name || s.client?.full_name || 'Anonymous Client',
    verified: s.client?.kyc_status === 'approved',
    route: `${s.origin_city}, ${s.origin_country} → ${s.destination_city}, ${s.destination_country}`,
    pickup: s.pickup_date?.split('T')[0],
    delivery: s.delivery_date?.split('T')[0],
    containerType: s.container_type,
    transportType: s.transport_type,
    price: s.budget,
    priceVisible: s.budget_visible,
    currency: s.currency,
    status: s.status
  }))

  return NextResponse.json({ results })
}
