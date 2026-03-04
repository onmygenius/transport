'use client'

import { useState, useEffect } from 'react'
import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getUserNotifications, markAsRead, markAllAsRead, type Notification } from '@/lib/actions/notifications'
import { formatDistanceToNow } from 'date-fns'
import { Bell, CheckCircle, Package, MessageSquare, FileCheck, AlertCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  offer_new: { label: 'New Offer', icon: Package, color: 'bg-blue-100 text-blue-600' },
  offer_accepted: { label: 'Offer Accepted', icon: CheckCircle, color: 'bg-green-100 text-green-600' },
  offer_rejected: { label: 'Offer Rejected', icon: AlertCircle, color: 'bg-red-100 text-red-600' },
  shipment_new: { label: 'New Shipment', icon: Package, color: 'bg-blue-100 text-blue-600' },
  shipment_status: { label: 'Shipment Update', icon: Package, color: 'bg-purple-100 text-purple-600' },
  message_new: { label: 'New Message', icon: MessageSquare, color: 'bg-amber-100 text-amber-600' },
  kyc_approved: { label: 'KYC Approved', icon: FileCheck, color: 'bg-green-100 text-green-600' },
  kyc_rejected: { label: 'KYC Rejected', icon: AlertCircle, color: 'bg-red-100 text-red-600' },
  subscription: { label: 'Subscription', icon: AlertCircle, color: 'bg-orange-100 text-orange-600' },
}

export default function TransporterNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const router = useRouter()

  const loadNotifications = async () => {
    setLoading(true)
    const result = await getUserNotifications(100, 0, filter === 'unread')
    if (result.success && result.data) {
      setNotifications(result.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadNotifications()
  }, [filter])

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId)
    await loadNotifications()
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    await loadNotifications()
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="flex flex-col min-h-screen">
      <TransporterHeader title="Notifications" subtitle="Stay updated with shipments and offers" />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500 mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    filter === 'unread' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Unread
                </button>
              </div>
              {unreadCount > 0 && (
                <Button onClick={handleMarkAllAsRead} variant="outline" size="sm" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Mark all as read
                </Button>
              )}
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Bell className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium">No notifications</p>
                  <p className="text-xs mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const config = typeConfig[notification.type] || { 
                      label: 'Notification', 
                      icon: Bell, 
                      color: 'bg-gray-100 text-gray-600' 
                    }
                    const Icon = config.icon

                    return (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-4 px-6 py-4 transition-colors hover:bg-gray-50 cursor-pointer ${
                          !notification.is_read ? 'bg-blue-50/40' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-semibold ${
                              !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {config.label}
                            </Badge>
                            {!notification.is_read && (
                              <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notification.id)
                            }}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Mark read
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
