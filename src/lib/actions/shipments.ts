'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ActionResult, Shipment, ContainerType, CargoType, TransportType } from '@/lib/types'
import { sendTemplateEmail } from '@/lib/emails'
import { createNotification } from '@/lib/actions/notifications'
import { generateDisplayId } from '@/lib/utils/generate-display-id'

export interface CreateShipmentData {
  origin_city: string
  origin_country: string
  origin_address?: string
  destination_city: string
  destination_country: string
  destination_address?: string
  destination_type?: string
  container_type: ContainerType
  container_count: number
  cargo_weight: number
  cargo_type: CargoType
  transport_type: TransportType
  pickup_date: string
  delivery_date?: string
  budget?: number
  budget_visible: boolean
  currency: string
  special_instructions?: string
}

export async function createShipment(data: CreateShipmentData): Promise<ActionResult<Shipment>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, kyc_status')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'client') return { success: false, error: 'Only clients can post shipments' }
  if (profile.kyc_status !== 'approved') return { success: false, error: 'KYC verification required' }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  // Generate display ID for shipment
  const displayId = await generateDisplayId('SHP', 'shipments')

  const { data: shipment, error } = await supabase
    .from('shipments')
    .insert({
      client_id: user.id,
      display_id: displayId,
      origin_city: data.origin_city,
      origin_country: data.origin_country,
      origin_address: data.origin_address || null,
      destination_city: data.destination_city,
      destination_country: data.destination_country,
      destination_address: data.destination_address || null,
      destination_type: data.destination_type || 'port',
      container_type: data.container_type,
      container_count: data.container_count,
      cargo_weight: data.cargo_weight,
      cargo_type: data.cargo_type,
      transport_type: data.transport_type,
      pickup_date: data.pickup_date,
      delivery_date: data.delivery_date || null,
      budget: data.budget || null,
      budget_visible: data.budget_visible,
      currency: data.currency,
      special_instructions: data.special_instructions || null,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  const EUROPEAN_COUNTRIES = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'NO', 'CH',
    'IS', 'LI', 'MC', 'AD', 'SM', 'VA', 'AL', 'BA', 'XK', 'ME',
    'MK', 'RS', 'TR', 'UA', 'BY', 'MD'
  ]

  try {
    const { data: transporters } = await supabase
      .from('profiles')
      .select(`
        id, 
        email, 
        full_name,
        transporter_profiles(operating_countries)
      `)
      .eq('role', 'transporter')
      .eq('kyc_status', 'approved')

    if (transporters && transporters.length > 0) {
      for (const transporter of transporters) {
        const operatingCountries = (transporter as any).transporter_profiles?.operating_countries 
          || EUROPEAN_COUNTRIES
        
        console.log(`🚚 Transporter ${transporter.email}:`, {
          hasProfile: !!(transporter as any).transporter_profiles,
          operatingCountries: operatingCountries.length,
          matchesOrigin: data.origin_country === 'EU' || operatingCountries.includes(data.origin_country)
        })
        
        if (data.origin_country === 'EU' || operatingCountries.includes(data.origin_country)) {
          console.log(`✅ Sending email to ${transporter.email}`)
          await sendTemplateEmail(
            transporter.email,
            'shipment_new_available',
            {
              recipientName: transporter.full_name,
              originCity: data.origin_city,
              originCountry: data.origin_country,
              originAddress: data.origin_address,
              destinationCity: data.destination_city,
              destinationCountry: data.destination_country,
              destinationAddress: data.destination_address,
              destinationType: data.destination_type,
              containerType: data.container_type,
              containerCount: data.container_count,
              cargoWeight: data.cargo_weight,
              pickupDate: new Date(data.pickup_date).toLocaleDateString('en-GB'),
              deliveryDate: data.delivery_date ? new Date(data.delivery_date).toLocaleDateString('en-GB') : undefined,
              budget: data.budget || 0,
              currency: data.currency,
              shipmentId: shipment.id,
            }
          ).catch(err => console.error('Failed to send shipment notification:', err))
        }
      }
    }
  } catch (emailError) {
    console.error('Failed to notify transporters:', emailError)
  }

  revalidatePath('/dashboard/client/shipments')
  revalidatePath('/dashboard/transporter/shipments')
  return { success: true, data: shipment }
}

export async function getClientShipments(): Promise<ActionResult<Shipment[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('shipments')
    .select(`
      *,
      offers(count)
    `)
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }
  return { success: true, data: data as Shipment[] }
}

export async function getShipmentWithOffers(shipmentId: string): Promise<ActionResult<Shipment>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('shipments')
    .select(`
      *,
      client:profiles!shipments_client_id_fkey(id, company_name, full_name, company_country, kyc_status),
      offers(
        *,
        transporter:profiles!offers_transporter_id_fkey(id, company_name, full_name, company_country, kyc_status)
      )
    `)
    .eq('id', shipmentId)
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data: data as Shipment }
}

export async function getAvailableShipments(filters?: {
  origin_country?: string
  destination_country?: string
  container_type?: string
  pickup_date_from?: string
  pickup_date_to?: string
}): Promise<ActionResult<Shipment[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'transporter') return { success: false, error: 'Only transporters can browse shipments' }

  let query = supabase
    .from('shipments')
    .select(`
      *,
      client:profiles!shipments_client_id_fkey(id, company_name, full_name, company_country, kyc_status),
      offers(count)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (filters?.origin_country) query = query.eq('origin_country', filters.origin_country)
  if (filters?.destination_country) query = query.eq('destination_country', filters.destination_country)
  if (filters?.container_type) query = query.eq('container_type', filters.container_type)
  if (filters?.pickup_date_from) query = query.gte('pickup_date', filters.pickup_date_from)
  if (filters?.pickup_date_to) query = query.lte('pickup_date', filters.pickup_date_to)

  const { data, error } = await query

  if (error) return { success: false, error: error.message }
  return { success: true, data: data as Shipment[] }
}

export async function updateShipmentStatus(
  shipmentId: string,
  status: 'picked_up' | 'in_transit' | 'delivered' | 'completed' | 'cancelled'
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: shipment } = await supabase
    .from('shipments')
    .select('client_id, origin_city, destination_city, container_type')
    .eq('id', shipmentId)
    .single()

  if (!shipment) return { success: false, error: 'Shipment not found' }

  const { error } = await supabase
    .from('shipments')
    .update({ status })
    .eq('id', shipmentId)

  if (error) return { success: false, error: error.message }

  const statusMessages: Record<string, string> = {
    'picked_up': 'Your shipment has been picked up',
    'in_transit': 'Your shipment is in transit',
    'delivered': 'Your shipment has been delivered',
    'completed': 'Your shipment is completed',
    'cancelled': 'Your shipment has been cancelled'
  }

  await createNotification(
    shipment.client_id,
    'shipment_status',
    `Shipment ${status.replace('_', ' ')}`,
    statusMessages[status] || `Shipment status updated to ${status}`,
    `/dashboard/client/shipments/${shipmentId}`
  ).catch(err => console.error('Failed to create notification:', err))

  try {
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('email, full_name, company_name')
      .eq('id', shipment.client_id)
      .single()

    const { data: transporterProfile } = await supabase
      .from('profiles')
      .select('company_name, full_name')
      .eq('id', user.id)
      .single()

    if (clientProfile && transporterProfile) {
      let templateType: 'shipment_picked_up' | 'shipment_delivered' | null = null
      
      if (status === 'picked_up') templateType = 'shipment_picked_up'
      else if (status === 'delivered') templateType = 'shipment_delivered'

      if (templateType) {
        await sendTemplateEmail(
          clientProfile.email,
          templateType,
          {
            recipientName: clientProfile.full_name || clientProfile.company_name,
            transporterName: transporterProfile.company_name || transporterProfile.full_name,
            route: `${shipment.origin_city} → ${shipment.destination_city}`,
            containerType: shipment.container_type,
            shipmentId: shipmentId,
          }
        ).catch(err => console.error('Failed to send status update notification:', err))
      }
    }
  } catch (emailError) {
    console.error('Failed to notify client of status update:', emailError)
  }

  revalidatePath('/dashboard/transporter/jobs')
  revalidatePath('/dashboard/client/shipments')
  revalidatePath(`/dashboard/transporter/shipments/${shipmentId}`)
  revalidatePath(`/dashboard/client/shipments/${shipmentId}`)
  return { success: true }
}
