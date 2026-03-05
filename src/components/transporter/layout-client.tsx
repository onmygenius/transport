'use client'

import { useState, createContext, useContext } from 'react'
import { TransporterSidebarWrapper } from './sidebar-wrapper'

interface TransporterLayoutClientProps {
  companyName: string
  email: string
  userId: string
  initialUnreadCount: number
  children: React.ReactNode
}

const SidebarContext = createContext<{
  toggleSidebar: () => void
}>({
  toggleSidebar: () => {}
})

export const useSidebar = () => useContext(SidebarContext)

export function TransporterLayoutClient({
  companyName,
  email,
  userId,
  initialUnreadCount,
  children
}: TransporterLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <SidebarContext.Provider value={{ toggleSidebar: () => setSidebarOpen(prev => !prev) }}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <TransporterSidebarWrapper
          companyName={companyName}
          email={email}
          userId={userId}
          initialUnreadCount={initialUnreadCount}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
