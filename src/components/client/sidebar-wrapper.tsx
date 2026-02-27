'use client'

import { ClientSidebar } from './sidebar'
import { useUnreadMessages } from '@/hooks/useUnreadMessages'

interface ClientSidebarWrapperProps {
  companyName?: string
  email?: string
  userId: string
  initialUnreadCount: number
}

export function ClientSidebarWrapper({ 
  companyName, 
  email, 
  userId,
  initialUnreadCount 
}: ClientSidebarWrapperProps) {
  const unreadCount = useUnreadMessages(userId, initialUnreadCount)

  return (
    <ClientSidebar
      companyName={companyName}
      email={email}
      unreadMessagesCount={unreadCount}
    />
  )
}
