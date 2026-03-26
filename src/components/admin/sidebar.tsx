'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Truck,
  FileText,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  Package,
  Menu,
  X,
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
    title: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 bg-gray-900 text-white md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Trade Container</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 ease-in-out",
          "md:translate-x-0 md:top-0",
          isMobileMenuOpen ? "translate-x-0 top-16" : "-translate-x-full top-16 md:top-0"
        )}
      >
      {/* Desktop Header (hidden on mobile) */}
      <div className="hidden md:flex h-16 items-center gap-3 px-6 border-b border-gray-700">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Truck className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Trade Container</p>
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
                  onClick={closeMobileMenu}
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
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
      </aside>
    </>
  )
}
