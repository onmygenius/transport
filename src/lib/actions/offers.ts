'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ActionResult, Offer } from '@/lib/types'
import { sendTemplateEmail } from '@/lib/emails'
import { createNotification } from '@/lib/actions/notifications'

export interface CreateOfferData {
  shipment_id: string
  price: number
  currency: string
  price_breakdown?: string
  estimated_days: number
  available_from: string
  message?: string
  valid_hours: number
}

export async function createOffer(data: CreateOfferData): Promise<ActionResult<Offer>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, kyc_status')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'transporter') return { success: false, error: 'Only transporters can submit offers' }
  if (profile.kyc_status !== 'approved') return { success: false, error: 'KYC verification required to submit offers' }

  const { data: shipment } = await supabase
    .from('shipments')
    .select('status, client_id')
    .eq('id', data.shipment_id)
    .single()

  if (!shipment) return { success: false, error: 'Shipment not found' }
  if (shipment.status !== 'pending' && shipment.status !== 'offer_received') {
    return { success: false, error: 'This shipment is no longer accepting offers' }
  }

  // Check ALL existing offers for this shipment from this transporter
  const { data: existingOffers } = await supabase
    .from('offers')
    .select('id, status')
    .eq('shipment_id', data.shipment_id)
    .eq('transporter_id', user.id)

  if (existingOffers && existingOffers.length > 0) {
    // Check if there's an active offer (pending or accepted)
    const hasActiveOffer = existingOffers.some(o => o.status === 'pending' || o.status === 'accepted')
    if (hasActiveOffer) {
      return { success: false, error: 'You have already submitted an offer for this shipment' }
    }

    // Delete all inactive offers (withdrawn, rejected, expired) to avoid unique constraint
    const inactiveOfferIds = existingOffers
      .filter(o => ['withdrawn', 'rejected', 'expired'].includes(o.status))
      .map(o => o.id)
    
    if (inactiveOfferIds.length > 0) {
      await supabase
        .from('offers')
        .delete()
        .in('id', inactiveOfferIds)
    }
  }

  const validUntil = new Date()
  validUntil.setHours(validUntil.getHours() + data.valid_hours)

  const { data: offer, error } = await supabase
    .from('offers')
    .insert({
      shipment_id: data.shipment_id,
      transporter_id: user.id,
      price: data.price,
      currency: data.currency,
      price_breakdown: data.price_breakdown || null,
      estimated_days: data.estimated_days,
      available_from: data.available_from,
      message: data.message || null,
      valid_until: validUntil.toISOString(),
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return { success: false, error: 'You have already submitted an offer for this shipment' }
    return { success: false, error: error.message }
  }

  await supabase
    .from('shipments')
    .update({ status: 'offer_received' })
    .eq('id', data.shipment_id)
    .eq('status', 'pending')

  await createNotification(
    shipment.client_id,
    'offer_new',
    'New Offer Received 📦',
    `You received a new offer of ${data.price} ${data.currency} for your shipment`,
    `/dashboard/client/shipments/${data.shipment_id}`
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

    const { data: shipmentDetails } = await supabase
      .from('shipments')
      .select('origin_city, destination_city, container_type, pickup_date')
      .eq('id', data.shipment_id)
      .single()

    if (clientProfile && transporterProfile && shipmentDetails) {
      await sendTemplateEmail(
        clientProfile.email,
        'offer_new',
        {
          recipientName: clientProfile.full_name || clientProfile.company_name,
          transporterName: transporterProfile.company_name || transporterProfile.full_name,
          route: `${shipmentDetails.origin_city} → ${shipmentDetails.destination_city}`,
          price: data.price,
          currency: data.currency,
          estimatedDays: data.estimated_days,
          offerId: offer.id,
        }
      ).catch(err => console.error('Failed to send offer notification:', err))
    }
  } catch (emailError) {
    console.error('Failed to notify client of new offer:', emailError)
  }

  revalidatePath('/dashboard/transporter/offers')
  revalidatePath('/dashboard/transporter/shipments')
  revalidatePath('/dashboard/client/shipments')
  return { success: true, data: offer }
}

export async function getTransporterOffers(): Promise<ActionResult<Offer[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
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

  if (error) return { success: false, error: error.message }
  return { success: true, data: data as Offer[] }
}

export async function getShipmentOffers(shipmentId: string): Promise<ActionResult<Offer[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      transporter:profiles!offers_transporter_id_fkey(
        id, company_name, full_name, company_country, kyc_status
      )
    `)
    .eq('shipment_id', shipmentId)
    .order('price', { ascending: true })

  if (error) return { success: false, error: error.message }
  return { success: true, data: data as Offer[] }
}

export async function acceptOffer(offerId: string, shipmentId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: shipment } = await supabase
    .from('shipments')
    .select('client_id, status')
    .eq('id', shipmentId)
    .single()

  if (!shipment) return { success: false, error: 'Shipment not found' }
  if (shipment.client_id !== user.id) return { success: false, error: 'Not authorized' }

  const { data: offer } = await supabase
    .from('offers')
    .select('transporter_id, price')
    .eq('id', offerId)
    .single()

  if (!offer) return { success: false, error: 'Offer not found' }

  const { error: offerError } = await supabase
    .from('offers')
    .update({ status: 'accepted' })
    .eq('id', offerId)

  if (offerError) return { success: false, error: offerError.message }

  await supabase
    .from('offers')
    .update({ status: 'rejected' })
    .eq('shipment_id', shipmentId)
    .neq('id', offerId)
    .eq('status', 'pending')

  const { error: shipmentError } = await supabase
    .from('shipments')
    .update({
      status: 'confirmed',
      transporter_id: offer.transporter_id,
      agreed_price: offer.price,
    })
    .eq('id', shipmentId)

  if (shipmentError) return { success: false, error: shipmentError.message }

  await createNotification(
    offer.transporter_id,
    'offer_accepted',
    'Offer Accepted! 🎉',
    'Your offer has been accepted by the client',
    `/dashboard/transporter/jobs`
  ).catch(err => console.error('Failed to create notification:', err))

  try {
    const { data: transporterProfile } = await supabase
      .from('profiles')
      .select('email, full_name, company_name')
      .eq('id', offer.transporter_id)
      .single()

    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('company_name, full_name')
      .eq('id', user.id)
      .single()

    const { data: shipmentDetails } = await supabase
      .from('shipments')
      .select('origin_city, destination_city, pickup_date')
      .eq('id', shipmentId)
      .single()

    if (transporterProfile && clientProfile && shipmentDetails) {
      await sendTemplateEmail(
        transporterProfile.email,
        'offer_accepted',
        {
          recipientName: transporterProfile.full_name || transporterProfile.company_name,
          clientName: clientProfile.company_name || clientProfile.full_name,
          route: `${shipmentDetails.origin_city} → ${shipmentDetails.destination_city}`,
          price: offer.price,
          pickupDate: new Date(shipmentDetails.pickup_date).toLocaleDateString('en-GB'),
          shipmentId: shipmentId,
        }
      ).catch(err => console.error('Failed to send offer accepted notification:', err))
    }
  } catch (emailError) {
    console.error('Failed to notify transporter of accepted offer:', emailError)
  }

  revalidatePath('/dashboard/client/shipments')
  revalidatePath('/dashboard/transporter/jobs')
  revalidatePath('/dashboard/transporter/offers')
  return { success: true }
}

export async function rejectOffer(offerId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: offer } = await supabase
    .from('offers')
    .select('transporter_id')
    .eq('id', offerId)
    .single()

  if (!offer) return { success: false, error: 'Offer not found' }

  const { error } = await supabase
    .from('offers')
    .update({ status: 'rejected' })
    .eq('id', offerId)

  if (error) return { success: false, error: error.message }

  await createNotification(
    offer.transporter_id,
    'offer_rejected',
    'Offer Rejected',
    'Your offer was rejected by the client',
    `/dashboard/transporter/offers`
  ).catch(err => console.error('Failed to create notification:', err))

  revalidatePath('/dashboard/client/shipments')
  return { success: true }
}

export async function withdrawOffer(offerId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('offers')
    .update({ status: 'withdrawn' })
    .eq('id', offerId)
    .eq('transporter_id', user.id)
    .eq('status', 'pending')

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/transporter/offers')
  return { success: true }
}
