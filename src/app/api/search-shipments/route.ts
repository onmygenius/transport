import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const originCountry = searchParams.get('originCountry') || ''
  const originCity = searchParams.get('originCity') || ''
  const destinationCountry = searchParams.get('destinationCountry') || ''
  const destinationCity = searchParams.get('destinationCity') || ''
  const date = searchParams.get('date') || ''
  const containerType = searchParams.get('containerType') || ''
  const shippingType = searchParams.get('shippingType') || ''
  const searchType = searchParams.get('searchType') || 'transporter'
  const sortBy = searchParams.get('sortBy') || 'relevance'

  const supabase = await createClient()

  // Check if user is authenticated and has active subscription
  const { data: { user } } = await supabase.auth.getUser()
  let hasActiveSubscription = false

  if (user) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, expires_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subscription && new Date(subscription.expires_at) > new Date()) {
      hasActiveSubscription = true
    }
  }

  let results: any[] = []
  let error: any = null

  if (searchType === 'client') {
    let query = supabase
      .from('truck_availability')
      .select(`
        id,
        origin_city,
        origin_country,
        destination_city,
        destination_country,
        equipment_type,
        available_from,
        available_until,
        price_per_km,
        notes,
        is_active,
        transporter:profiles!truck_availability_transporter_id_fkey(company_name, full_name, kyc_status)
      `)
      .eq('is_active', true)
      .limit(10)

    if (originCountry) {
      query = query.eq('origin_country', originCountry)
    }
    if (originCity) {
      query = query.ilike('origin_city', `%${originCity}%`)
    }
    if (destinationCountry) {
      query = query.eq('destination_country', destinationCountry)
    }
    if (destinationCity) {
      query = query.ilike('destination_city', `%${destinationCity}%`)
    }
    if (date) {
      query = query.lte('available_from', date)
      query = query.gte('available_until', date)
    }
    if (containerType) {
      query = query.eq('equipment_type', containerType)
    }

    if (sortBy === 'price-low') {
      query = query.order('price_per_km', { ascending: true })
    } else if (sortBy === 'price-high') {
      query = query.order('price_per_km', { ascending: false })
    } else if (sortBy === 'date') {
      query = query.order('available_from', { ascending: true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data: trucks, error: trucksError } = await query
    error = trucksError

    if (!error && trucks) {
      results = trucks.map((t: any) => ({
        id: t.id,
        type: 'transporter',
        company: t.transporter?.company_name || t.transporter?.full_name || 'Anonymous Transporter',
        verified: t.transporter?.kyc_status === 'approved',
        route: `${t.origin_city}, ${t.origin_country} → ${t.destination_city || 'Any'}, ${t.destination_country || 'Any'}`,
        pickup: t.available_from?.split('T')[0],
        delivery: t.available_until?.split('T')[0],
        containerType: t.equipment_type,
        transportType: 'fcl',
        price: t.price_per_km ? Math.round(t.price_per_km * 500) : null,
        priceVisible: true,
        currency: 'EUR',
        status: 'available'
      }))
    }
  } else {
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
      .limit(10)

    if (originCountry) {
      query = query.eq('origin_country', originCountry)
    }
    if (originCity) {
      query = query.ilike('origin_city', `%${originCity}%`)
    }
    if (destinationCountry) {
      query = query.eq('destination_country', destinationCountry)
    }
    if (destinationCity) {
      query = query.ilike('destination_city', `%${destinationCity}%`)
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

    if (sortBy === 'price-low') {
      query = query.order('budget', { ascending: true, nullsFirst: false })
    } else if (sortBy === 'price-high') {
      query = query.order('budget', { ascending: false, nullsFirst: false })
    } else if (sortBy === 'date') {
      query = query.order('pickup_date', { ascending: true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data: shipments, error: shipmentsError } = await query
    error = shipmentsError

    if (!error && shipments) {
      results = shipments.map((s: any) => ({
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
    }
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ results, hasActiveSubscription })
}
