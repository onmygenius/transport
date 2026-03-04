'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}

export interface ActionResult<T = void> {
  success: boolean
  error?: string
  data?: T
}

export async function getUnreadCount(): Promise<ActionResult<number>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: 'Not authenticated' }

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) return { success: false, error: error.message }
  
  return { success: true, data: count || 0 }
}

export async function getUserNotifications(
  limit: number = 50,
  offset: number = 0,
  unreadOnly: boolean = false
): Promise<ActionResult<Notification[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: 'Not authenticated' }

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query

  if (error) return { success: false, error: error.message }
  
  return { success: true, data: data as Notification[] }
}

export async function getRecentNotifications(limit: number = 5): Promise<ActionResult<Notification[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return { success: false, error: error.message }
  
  return { success: true, data: data as Notification[] }
}

export async function markAsRead(notificationId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/client/notifications')
  revalidatePath('/dashboard/transporter/notifications')
  
  return { success: true }
}

export async function markAllAsRead(): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/client/notifications')
  revalidatePath('/dashboard/transporter/notifications')
  
  return { success: true }
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
): Promise<ActionResult<Notification>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      link: link || null,
      is_read: false
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/client/notifications')
  revalidatePath('/dashboard/transporter/notifications')
  
  return { success: true, data: data as Notification }
}

export async function deleteOldNotifications(daysOld: number = 30): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: 'Not authenticated' }

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', user.id)
    .lt('created_at', cutoffDate.toISOString())

  if (error) return { success: false, error: error.message }
  
  return { success: true }
}
