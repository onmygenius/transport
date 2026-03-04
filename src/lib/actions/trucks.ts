'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface TruckAvailability {
  id: string
  transporter_id: string
  equipment_type: string
  max_weight?: number
  origin_city: string
  origin_country: string
  destination_city?: string
  destination_country?: string
  available_from: string
  available_until: string
  price_per_km?: number
  fixed_price?: number
  radius_km?: number
  notes?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface ActionResult {
  success: boolean
  error?: string
  data?: any
}

export async function getTruckAvailability(): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('truck_availability')
    .select('*')
    .eq('transporter_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }
  
  return { success: true, data: data || [] }
}

export async function createTruckAvailability(formData: {
  equipment_type: string
  max_weight?: number
  origin_city: string
  origin_country: string
  destination_city?: string
  destination_country?: string
  available_from: string
  available_until: string
  price_per_km?: number
  fixed_price?: number
  radius_km?: number
  notes?: string
}): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('truck_availability')
    .insert({
      transporter_id: user.id,
      ...formData,
      is_active: true
    })

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/transporter/trucks')
  return { success: true }
}

export async function updateTruckAvailability(
  id: string,
  formData: Partial<TruckAvailability>
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('truck_availability')
    .update(formData)
    .eq('id', id)
    .eq('transporter_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/transporter/trucks')
  return { success: true }
}

export async function deleteTruckAvailability(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('truck_availability')
    .delete()
    .eq('id', id)
    .eq('transporter_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/transporter/trucks')
  return { success: true }
}
