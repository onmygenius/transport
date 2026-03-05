'use client'

import { useState } from 'react'
import { TransporterSidebar } from './sidebar'
import { useUnreadMessages } from '@/hooks/useUnreadMessages'

interface TransporterSidebarWrapperProps {
  companyName?: string
  email?: string
  userId: string
  initialUnreadCount: number
  isOpen: boolean
  onClose: () => void
}

export function TransporterSidebarWrapper({ 
  companyName, 
  email, 
  userId,
  initialUnreadCount,
  isOpen,
  onClose
}: TransporterSidebarWrapperProps) {
  const unreadCount = useUnreadMessages(userId, initialUnreadCount)

  return (
    <TransporterSidebar
      companyName={companyName}
      email={email}
      unreadMessagesCount={unreadCount}
      isOpen={isOpen}
      onClose={onClose}
    />
  )
}
