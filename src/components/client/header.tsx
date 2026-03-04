'use client'

import { NotificationBell } from '@/components/notifications/notification-bell'
import { NotificationMarquee } from '@/components/notifications/notification-marquee'

interface ClientHeaderProps {
  title: string
  subtitle?: string
  companyName?: string
}

export function ClientHeader({ title, subtitle, companyName }: ClientHeaderProps) {
  const initials = companyName
    ? companyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'CL'

  return (
    <header className="grid grid-cols-3 h-16 items-center border-b border-gray-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex justify-center">
        <NotificationMarquee />
      </div>
      <div className="flex items-center gap-3 justify-end">
        <NotificationBell variant="client" />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white cursor-pointer">
          {initials}
        </div>
      </div>
    </header>
  )
}
