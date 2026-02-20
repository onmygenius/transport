'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Truck,
  FileText,
  AlertTriangle,
  BarChart3,
  Settings,
  Shield,
  Bell,
  LogOut,
  ChevronRight,
  Package,
} from 'lucide-react'

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Subscriptions',
    href: '/admin/subscriptions',
    icon: CreditCard,
  },
  {
    title: 'Shipments',
    href: '/admin/shipments',
    icon: Package,
  },
  {
    title: 'Trucks',
    href: '/admin/trucks',
    icon: Truck,
  },
  {
    title: 'Documents',
    href: '/admin/documents',
    icon: FileText,
  },
  {
    title: 'Disputes',
    href: '/admin/disputes',
    icon: AlertTriangle,
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: BarChart3,
  },
  {
    title: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
  },
  {
    title: 'Audit Log',
    href: '/admin/audit',
    icon: Shield,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gray-900 text-white flex flex-col">
      <div className="flex h-16 items-center gap-3 px-6 border-b border-gray-700">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Truck className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">FreightEx</p>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.title}</span>
                  {isActive && <ChevronRight className="h-3 w-3" />}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-700 p-3">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
