'use client'

import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare } from 'lucide-react'

const mockConversations = [
  { id: '1', shipmentId: 'SHP-1842', client: 'EuroShip GmbH', lastMessage: 'Please confirm pickup time for tomorrow morning.', time: '14:32', unread: 2 },
  { id: '2', shipmentId: 'SHP-1840', client: 'Container Plus Ltd', lastMessage: 'Documents uploaded. Please check.', time: '11:15', unread: 0 },
  { id: '3', shipmentId: 'SHP-1837', client: 'Adriatic Shipping DOO', lastMessage: 'Delivery confirmed. Thank you!', time: 'Yesterday', unread: 0 },
]

export default function TransporterMessagesPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <TransporterHeader title="Messages" subtitle="Chat with your clients" />
      <main className="flex-1 p-6">
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {mockConversations.map(conv => (
                <div key={conv.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 shrink-0">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{conv.client}</p>
                      <span className="text-xs text-gray-400 font-mono">{conv.shipmentId}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-gray-400">{conv.time}</span>
                    {conv.unread > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">{conv.unread}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
