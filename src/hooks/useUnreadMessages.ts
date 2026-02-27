'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUnreadMessages(userId: string | undefined, initialCount: number = 0) {
  const [unreadCount, setUnreadCount] = useState(initialCount)
  const supabase = createClient()

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (!profile) return

    let shipmentsQuery = supabase
      .from('shipments')
      .select('id')

    if (profile.role === 'client') {
      shipmentsQuery = shipmentsQuery.eq('client_id', userId).not('transporter_id', 'is', null)
    } else {
      shipmentsQuery = shipmentsQuery.eq('transporter_id', userId)
    }

    const { data: shipments } = await shipmentsQuery

    if (!shipments || shipments.length === 0) {
      setUnreadCount(0)
      return
    }

    const shipmentIds = shipments.map(s => s.id)

    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .in('shipment_id', shipmentIds)
      .neq('sender_id', userId)
      .eq('is_read', false)

    setUnreadCount(count || 0)
  }, [userId, supabase])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        async () => {
          await fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, fetchUnreadCount])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__refreshUnreadCount = fetchUnreadCount
    }
  }, [fetchUnreadCount])

  return unreadCount
}
