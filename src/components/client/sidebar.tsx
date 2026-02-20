'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Package, Truck, FileText,
  CreditCard, MessageSquare, Star, Settings,
  LogOut, Bell, PlusCircle, History, AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { title: 'Dashboard', href: '/dashboard/client', icon: LayoutDashboard },
  { title: 'Post Shipment', href: '/dashboard/client/post', icon: PlusCircle },
  { title: 'My Shipments', href: '/dashboard/client/shipments', icon: Package },
  { title: 'Browse Transporters', href: '/dashboard/client/transporters', icon: Truck },
  { title: 'Documents', href: '/dashboard/client/documents', icon: FileText },
  { title: 'Disputes', href: '/dashboard/client/disputes', icon: AlertTriangle },
  { title: 'Messages', href: '/dashboard/client/messages', icon: MessageSquare },
  { title: 'History & Reports', href: '/dashboard/client/history', icon: History },
  { title: 'Subscription', href: '/dashboard/client/subscription', icon: CreditCard },
  { title: 'Settings', href: '/dashboard/client/settings', icon: Settings },
]

interface ClientSidebarProps {
  companyName?: string
  email?: string
}

export function ClientSidebar({ companyName, email }: ClientSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
          <Package className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gray-900">{companyName || 'FreightEx'}</p>
          <p className="text-xs text-gray-400">Client / Shipper</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map(item => {
            const isActive = item.href === '/dashboard/client'
              ? pathname === item.href
              : pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-emerald-600' : 'text-gray-400')} />
                  {item.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-100 p-3">
        <div className="mb-2 px-3 py-2">
          <p className="truncate text-xs font-medium text-gray-700">{email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4 text-gray-400" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
