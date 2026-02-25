import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getConversations } from '@/lib/actions/messages'
import MessagesClient from './client'

export default async function TransporterMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await getConversations()
  const conversations = result.success && result.data ? result.data : []

  return <MessagesClient conversations={conversations} />
}
