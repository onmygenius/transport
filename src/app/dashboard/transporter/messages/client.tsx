'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { MessageSquare, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { Conversation } from '@/lib/actions/messages'
import { createClient } from '@/lib/supabase/client'

interface MessagesClientProps {
  conversations: Conversation[]
}

export default function MessagesClient({ conversations }: MessagesClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  const toggleSelection = (shipmentId: string) => {
    setSelectedConversations(prev => {
      const newSet = new Set(prev)
      if (newSet.has(shipmentId)) {
        newSet.delete(shipmentId)
      } else {
        newSet.add(shipmentId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedConversations.size === conversations.length) {
      setSelectedConversations(new Set())
    } else {
      setSelectedConversations(new Set(conversations.map(c => c.shipment_id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedConversations.size === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedConversations.size} conversation(s)? This will delete all messages in these conversations.`)) {
      return
    }

    setDeleting(true)

    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .in('shipment_id', Array.from(selectedConversations))

      if (error) {
        alert('Failed to delete conversations: ' + error.message)
      } else {
        setSelectedConversations(new Set())
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting conversations:', error)
      alert('Failed to delete conversations')
    } finally {
      setDeleting(false)
    }
  }

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
        {conversations.length > 0 && (
          <div className="mb-4 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedConversations.size === conversations.length && conversations.length > 0}
                onCheckedChange={toggleSelectAll}
                id="select-all"
              />
              <label htmlFor="select-all" className="text-sm text-gray-600 cursor-pointer">
                Select All ({selectedConversations.size}/{conversations.length})
              </label>
            </div>
            {selectedConversations.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={deleting}
                className="gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete ({selectedConversations.size})
                  </>
                )}
              </Button>
            )}
          </div>
        )}
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
                  <div key={conv.shipment_id} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <Checkbox
                      checked={selectedConversations.has(conv.shipment_id)}
                      onCheckedChange={() => toggleSelection(conv.shipment_id)}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    />
                    <Link 
                      href={`/dashboard/transporter/messages/${conv.shipment_id}`}
                      className="flex items-center gap-4 flex-1 min-w-0"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 shrink-0">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{conv.other_party_name}</p>
                          <span className="text-xs text-gray-400 font-mono">{conv.shipment_code}</span>
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
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
