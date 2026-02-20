'use client'

import { Bell } from 'lucide-react'

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
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">3</span>
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white cursor-pointer">
          {initials}
        </div>
      </div>
    </header>
  )
}
