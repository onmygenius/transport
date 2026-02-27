'use client'

import { useState, useEffect, useRef } from 'react'
import { ClientHeader } from '@/components/client/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { sendMessage, markMessagesAsRead, type ChatMessage } from '@/lib/actions/messages'
import { useRouter } from 'next/navigation'

interface ChatClientProps {
  shipmentId: string
  shipmentInfo: {
    id: string
    origin_city: string
    destination_city: string
    other_party_name: string
    other_party_role: string
  }
  initialMessages: ChatMessage[]
  currentUserId: string
}

export default function ChatClient({ shipmentId, shipmentInfo, initialMessages, currentUserId }: ChatClientProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
    const markAsRead = async () => {
      await markMessagesAsRead(shipmentId)
      router.refresh()
      if (typeof window !== 'undefined' && (window as any).__refreshUnreadCount) {
        await (window as any).__refreshUnreadCount()
      }
    }
    markAsRead()
  }, [messages, shipmentId, router])

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    const result = await sendMessage(shipmentId, newMessage)

    if (result.success && result.data) {
      setMessages(prev => [...prev, result.data!])
      setNewMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      router.refresh()
    }

    setSending(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Yesterday ' + date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' }) + ' ' + 
             date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ClientHeader 
        title={`Chat with ${shipmentInfo.other_party_name}`}
        subtitle={`${shipmentInfo.origin_city} → ${shipmentInfo.destination_city}`}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-white">
          <Link href="/dashboard/client/messages">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Messages
            </Button>
          </Link>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.sender_id === currentUserId
                const senderName = message.sender?.company_name || message.sender?.full_name || 'Unknown'

                return (
                  <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                      <div className={`rounded-lg px-4 py-2 ${
                        isOwn 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}>
                        {!isOwn && (
                          <p className="text-xs font-semibold mb-1 text-emerald-600">{senderName}</p>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-emerald-100' : 'text-gray-400'}`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value)
                      e.target.style.height = 'auto'
                      e.target.style.height = e.target.scrollHeight + 'px'
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={sending}
                    className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                    rows={1}
                    style={{ maxHeight: '120px' }}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Press Enter to send, Shift+Enter for new line</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
