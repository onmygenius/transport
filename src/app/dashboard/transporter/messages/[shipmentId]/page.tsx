import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMessages, getShipmentForChat } from '@/lib/actions/messages'
import ChatClient from './client'

export default async function TransporterChatPage({ params }: { params: Promise<{ shipmentId: string }> }) {
  const { shipmentId } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get shipment info
  const shipmentResult = await getShipmentForChat(shipmentId)
  if (!shipmentResult.success || !shipmentResult.data) {
    redirect('/dashboard/transporter/messages')
  }

  // Get messages
  const messagesResult = await getMessages(shipmentId)
  const messages = messagesResult.success && messagesResult.data ? messagesResult.data : []

  return (
    <ChatClient
      shipmentId={shipmentId}
      shipmentInfo={shipmentResult.data}
      initialMessages={messages}
      currentUserId={user.id}
    />
  )
}
