'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ActionResult, Shipment, ContainerType, CargoType, TransportType } from '@/lib/types'

export interface CreateShipmentData {
  origin_city: string
  origin_country: string
  origin_address?: string
  destination_city: string
  destination_country: string
  destination_address?: string
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

  const { data: shipment, error } = await supabase
    .from('shipments')
    .insert({
      client_id: user.id,
      origin_city: data.origin_city,
      origin_country: data.origin_country,
      origin_address: data.origin_address || null,
      destination_city: data.destination_city,
      destination_country: data.destination_country,
      destination_address: data.destination_address || null,
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

  const { error } = await supabase
    .from('shipments')
    .update({ status })
    .eq('id', shipmentId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/transporter/jobs')
  revalidatePath('/dashboard/client/shipments')
  return { success: true }
}
