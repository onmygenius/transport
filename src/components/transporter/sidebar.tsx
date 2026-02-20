'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Package, Truck, FileText,
  CreditCard, MessageSquare, Star, Settings,
  LogOut, Bell, Wallet, Search
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { title: 'Dashboard', href: '/dashboard/transporter', icon: LayoutDashboard },
  { title: 'Available Shipments', href: '/dashboard/transporter/shipments', icon: Search },
  { title: 'My Offers', href: '/dashboard/transporter/offers', icon: Package },
  { title: 'Active Jobs', href: '/dashboard/transporter/jobs', icon: Truck },
  { title: 'My Trucks', href: '/dashboard/transporter/trucks', icon: Truck },
  { title: 'Documents', href: '/dashboard/transporter/documents', icon: FileText },
  { title: 'Billing', href: '/dashboard/transporter/wallet', icon: CreditCard },
  { title: 'Messages', href: '/dashboard/transporter/messages', icon: MessageSquare },
  { title: 'Reviews', href: '/dashboard/transporter/reviews', icon: Star },
  { title: 'Subscription', href: '/dashboard/transporter/subscription', icon: CreditCard },
  { title: 'Settings', href: '/dashboard/transporter/settings', icon: Settings },
]

interface TransporterSidebarProps {
  companyName?: string
  email?: string
}

export function TransporterSidebar({ companyName, email }: TransporterSidebarProps) {
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
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
          <Truck className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gray-900">{companyName || 'FreightEx'}</p>
          <p className="text-xs text-gray-400">Transporter</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map(item => {
            const isActive = item.href === '/dashboard/transporter'
              ? pathname === item.href
              : pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-blue-600' : 'text-gray-400')} />
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
