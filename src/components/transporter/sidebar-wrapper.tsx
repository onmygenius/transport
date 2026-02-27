'use client'

import { TransporterSidebar } from './sidebar'
import { useUnreadMessages } from '@/hooks/useUnreadMessages'

interface TransporterSidebarWrapperProps {
  companyName?: string
  email?: string
  userId: string
  initialUnreadCount: number
}

export function TransporterSidebarWrapper({ 
  companyName, 
  email, 
  userId,
  initialUnreadCount 
}: TransporterSidebarWrapperProps) {
  const unreadCount = useUnreadMessages(userId, initialUnreadCount)

  return (
    <TransporterSidebar
      companyName={companyName}
      email={email}
      unreadMessagesCount={unreadCount}
    />
  )
}
