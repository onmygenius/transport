'use client'

import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import type { Conversation } from '@/lib/actions/messages'

interface MessagesClientProps {
  conversations: Conversation[]
}

export default function MessagesClient({ conversations }: MessagesClientProps) {
  const formatTime = (dateString: string) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' })
    }
  }

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <TransporterHeader title="Messages" subtitle="Chat with your clients" />
      <main className="flex-1 p-6">
        <Card>
          <CardContent className="p-0">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <MessageSquare className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs mt-1">Messages will appear here when you have active shipments</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {conversations.map(conv => (
                  <Link 
                    key={conv.shipment_id} 
                    href={`/dashboard/transporter/messages/${conv.shipment_id}`}
                    className="block"
                  >
                    <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 shrink-0">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{conv.other_party_name}</p>
                          <span className="text-xs text-gray-400 font-mono">SHP-{conv.shipment_code}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{conv.last_message}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-xs text-gray-400">{formatTime(conv.last_message_time)}</span>
                        {conv.unread_count > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
