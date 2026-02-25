'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ActionResult<T = void> = 
  | { success: true; data?: T }
  | { success: false; error: string }

export interface ChatMessage {
  id: string
  shipment_id: string
  sender_id: string
  content: string
  attachment_url: string | null
  attachment_name: string | null
  is_read: boolean
  created_at: string
  sender?: {
    id: string
    full_name: string | null
    company_name: string | null
    role: string
  }
}

export interface Conversation {
  shipment_id: string
  shipment_code: string
  origin_city: string
  destination_city: string
  other_party_name: string
  other_party_role: string
  last_message: string
  last_message_time: string
  unread_count: number
}

/**
 * Send a new message in a shipment conversation
 */
export async function sendMessage(
  shipmentId: string,
  content: string
): Promise<ActionResult<ChatMessage>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  if (!content.trim()) {
    return { success: false, error: 'Message cannot be empty' }
  }

  // Verify user has access to this shipment
  const { data: shipment } = await supabase
    .from('shipments')
    .select('client_id, transporter_id')
    .eq('id', shipmentId)
    .single()

  if (!shipment) {
    return { success: false, error: 'Shipment not found' }
  }

  if (shipment.client_id !== user.id && shipment.transporter_id !== user.id) {
    return { success: false, error: 'You do not have access to this shipment' }
  }

  // Insert message
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      shipment_id: shipmentId,
      sender_id: user.id,
      content: content.trim(),
    })
    .select(`
      *,
      sender:profiles!sender_id(id, full_name, company_name, role)
    `)
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/dashboard/client/messages/${shipmentId}`)
  revalidatePath(`/dashboard/transporter/messages/${shipmentId}`)
  revalidatePath('/dashboard/client/messages')
  revalidatePath('/dashboard/transporter/messages')

  return { success: true, data: data as ChatMessage }
}

/**
 * Get all messages for a shipment
 */
export async function getMessages(shipmentId: string): Promise<ActionResult<ChatMessage[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify user has access to this shipment
  const { data: shipment } = await supabase
    .from('shipments')
    .select('client_id, transporter_id')
    .eq('id', shipmentId)
    .single()

  if (!shipment) {
    return { success: false, error: 'Shipment not found' }
  }

  if (shipment.client_id !== user.id && shipment.transporter_id !== user.id) {
    return { success: false, error: 'You do not have access to this shipment' }
  }

  // Get messages
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      *,
      sender:profiles!sender_id(id, full_name, company_name, role)
    `)
    .eq('shipment_id', shipmentId)
    .order('created_at', { ascending: true })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: data as ChatMessage[] }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(shipmentId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Mark all messages in this shipment as read (except own messages)
  const { error } = await supabase
    .from('chat_messages')
    .update({ is_read: true })
    .eq('shipment_id', shipmentId)
    .neq('sender_id', user.id)
    .eq('is_read', false)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/dashboard/client/messages/${shipmentId}`)
  revalidatePath(`/dashboard/transporter/messages/${shipmentId}`)
  revalidatePath('/dashboard/client/messages')
  revalidatePath('/dashboard/transporter/messages')

  return { success: true, data: undefined }
}

/**
 * Get all conversations for a user
 */
export async function getConversations(): Promise<ActionResult<Conversation[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { success: false, error: 'Profile not found' }
  }

  // Get shipments where user is involved
  let shipmentsQuery = supabase
    .from('shipments')
    .select('id, origin_city, destination_city, client_id, transporter_id')

  if (profile.role === 'client') {
    shipmentsQuery = shipmentsQuery.eq('client_id', user.id).not('transporter_id', 'is', null)
  } else {
    shipmentsQuery = shipmentsQuery.eq('transporter_id', user.id)
  }

  const { data: shipments, error: shipmentsError } = await shipmentsQuery

  if (shipmentsError) {
    return { success: false, error: shipmentsError.message }
  }

  if (!shipments || shipments.length === 0) {
    return { success: true, data: [] }
  }

  // Get last message and unread count for each shipment
  const conversations: Conversation[] = []

  for (const shipment of shipments) {
    // Get last message
    const { data: lastMessage } = await supabase
      .from('chat_messages')
      .select('content, created_at')
      .eq('shipment_id', shipment.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('shipment_id', shipment.id)
      .neq('sender_id', user.id)
      .eq('is_read', false)

    // Get other party info
    const otherPartyId = profile.role === 'client' ? shipment.transporter_id : shipment.client_id
    const { data: otherParty } = await supabase
      .from('profiles')
      .select('id, full_name, company_name, role')
      .eq('id', otherPartyId)
      .single()

    const otherPartyName = otherParty?.company_name || otherParty?.full_name || 'Unknown'

    conversations.push({
      shipment_id: shipment.id,
      shipment_code: shipment.id.slice(0, 8).toUpperCase(),
      origin_city: shipment.origin_city,
      destination_city: shipment.destination_city,
      other_party_name: otherPartyName,
      other_party_role: otherParty?.role || 'unknown',
      last_message: lastMessage?.content || 'No messages yet',
      last_message_time: lastMessage?.created_at || '',
      unread_count: unreadCount || 0,
    })
  }

  // Sort by last message time (most recent first)
  conversations.sort((a, b) => {
    if (!a.last_message_time) return 1
    if (!b.last_message_time) return -1
    return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
  })

  return { success: true, data: conversations }
}

/**
 * Get shipment info for chat header
 */
export async function getShipmentForChat(shipmentId: string): Promise<ActionResult<{
  id: string
  origin_city: string
  destination_city: string
  other_party_name: string
  other_party_role: string
}>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { success: false, error: 'Profile not found' }
  }

  // Get shipment
  const { data: shipment, error } = await supabase
    .from('shipments')
    .select('id, origin_city, destination_city, client_id, transporter_id')
    .eq('id', shipmentId)
    .single()

  if (error || !shipment) {
    return { success: false, error: 'Shipment not found' }
  }

  // Verify access
  if (profile.role === 'client' && shipment.client_id !== user.id) {
    return { success: false, error: 'Access denied' }
  }
  if (profile.role === 'transporter' && shipment.transporter_id !== user.id) {
    return { success: false, error: 'Access denied' }
  }

  // Get other party info
  const otherPartyId = profile.role === 'client' ? shipment.transporter_id : shipment.client_id
  const { data: otherParty } = await supabase
    .from('profiles')
    .select('id, full_name, company_name, role')
    .eq('id', otherPartyId)
    .single()

  const otherPartyName = otherParty?.company_name || otherParty?.full_name || 'Unknown'

  return {
    success: true,
    data: {
      id: shipment.id,
      origin_city: shipment.origin_city,
      destination_city: shipment.destination_city,
      other_party_name: otherPartyName,
      other_party_role: otherParty?.role || 'unknown',
    },
  }
}

/**
 * Get total unread messages count for user
 */
export async function getUnreadMessagesCount(): Promise<number> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return 0
  }

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return 0
  }

  // Get shipments where user is involved
  let shipmentsQuery = supabase
    .from('shipments')
    .select('id')

  if (profile.role === 'client') {
    shipmentsQuery = shipmentsQuery.eq('client_id', user.id).not('transporter_id', 'is', null)
  } else {
    shipmentsQuery = shipmentsQuery.eq('transporter_id', user.id)
  }

  const { data: shipments } = await shipmentsQuery

  if (!shipments || shipments.length === 0) {
    return 0
  }

  const shipmentIds = shipments.map(s => s.id)

  // Get total unread count across all shipments
  const { count } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .in('shipment_id', shipmentIds)
    .neq('sender_id', user.id)
    .eq('is_read', false)

  return count || 0
}
