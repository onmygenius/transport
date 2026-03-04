'use client'

import { Info } from 'lucide-react'

export function NotificationMarquee() {
  const message = "Note: Don't forget to check your notifications daily! You can track shipment status and other important information"
  
  return (
    <div className="flex items-center gap-2 max-w-2xl mx-auto overflow-hidden bg-gradient-to-r from-red-50 to-rose-50 rounded-lg px-3 py-1.5 border border-red-200 animate-pulse">
      <Info className="h-3.5 w-3.5 text-red-600 shrink-0" />
      <div className="overflow-hidden">
        <div className="animate-marquee whitespace-nowrap text-xs font-semibold text-red-600">
          <span className="inline-block px-4">{message}</span>
          <span className="inline-block px-4">{message}</span>
        </div>
      </div>
    </div>
  )
}
