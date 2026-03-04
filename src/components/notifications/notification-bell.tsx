'use client'

import { useEffect, useState } from 'react'
import { Bell, CheckCircle, Package, MessageSquare, FileCheck, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getUnreadCount, getRecentNotifications, markAsRead, type Notification } from '@/lib/actions/notifications'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'

interface NotificationBellProps {
  variant?: 'client' | 'transporter'
}

const typeIcons: Record<string, React.ElementType> = {
  offer_new: Package,
  offer_accepted: CheckCircle,
  offer_rejected: AlertCircle,
  shipment_status: Package,
  message_new: MessageSquare,
  kyc_approved: FileCheck,
  kyc_rejected: AlertCircle,
  subscription: AlertCircle,
}

export function NotificationBell({ variant = 'client' }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const badgeColor = variant === 'client' ? 'bg-emerald-600' : 'bg-blue-600'

  const loadNotifications = async () => {
    const [countResult, notificationsResult] = await Promise.all([
      getUnreadCount(),
      getRecentNotifications(5)
    ])

    if (countResult.success && countResult.data !== undefined) {
      setUnreadCount(countResult.data)
    }

    if (notificationsResult.success && notificationsResult.data) {
      setNotifications(notificationsResult.data)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadNotifications()

    const interval = setInterval(loadNotifications, 30000)

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return

      const channel = supabase
        .channel('notifications-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            loadNotifications()
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            loadNotifications()
          }
        )
        .subscribe()
    })

    return () => clearInterval(interval)
  }, [])

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
      await loadNotifications()
    }

    if (notification.link) {
      router.push(notification.link)
    }

    setIsOpen(false)
  }

  const handleViewAll = () => {
    const role = variant === 'client' ? 'client' : 'transporter'
    router.push(`/dashboard/${role}/notifications`)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className={`absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full ${badgeColor} text-[10px] font-bold text-white`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-96 rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs text-gray-500">{unreadCount} unread</span>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <Bell className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = typeIcons[notification.type] || Bell
                  return (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        !notification.is_read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          !notification.is_read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium ${
                              !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {notifications.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-2">
                <button
                  onClick={handleViewAll}
                  className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 py-1"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
