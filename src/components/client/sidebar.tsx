'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Package, Truck, FileText,
  CreditCard, MessageSquare, Star, Settings,
  LogOut, Bell, PlusCircle, History, AlertTriangle, X, Menu
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { title: 'Dashboard', href: '/dashboard/client', icon: LayoutDashboard },
  { title: 'Post Shipment', href: '/dashboard/client/post', icon: PlusCircle },
  { title: 'My Shipments', href: '/dashboard/client/shipments', icon: Package },
  { title: 'Browse Transporters', href: '/dashboard/client/transporters', icon: Truck },
  { title: 'Reviews', href: '/dashboard/client/reviews', icon: Star },
  // { title: 'Documents', href: '/dashboard/client/documents', icon: FileText },
  // { title: 'Disputes', href: '/dashboard/client/disputes', icon: AlertTriangle },
  { title: 'Messages', href: '/dashboard/client/messages', icon: MessageSquare },
  { title: 'History & Reports', href: '/dashboard/client/history', icon: History },
  { title: 'Subscription', href: '/dashboard/client/subscription', icon: CreditCard },
  { title: 'Settings', href: '/dashboard/client/settings', icon: Settings },
]

interface ClientSidebarProps {
  companyName?: string
  email?: string
  unreadMessagesCount?: number
}

export function ClientSidebar({ companyName, email, unreadMessagesCount = 0 }: ClientSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadAvatar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single()

      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url)
      }
    }

    loadAvatar()

    const channel = supabase
      .channel('client-profile-avatar-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          if (payload.new.avatar_url) {
            setAvatarUrl(payload.new.avatar_url)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm lg:hidden"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-5">
        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <Package className="h-5 w-5 text-white" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gray-900">{companyName || 'Trade Container'}</p>
          <p className="text-xs text-gray-400">Client / Shipper</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map(item => {
            const isActive = item.href === '/dashboard/client'
              ? pathname === item.href
              : pathname.startsWith(item.href)
            const isMessages = item.href === '/dashboard/client/messages'
            const showBadge = isMessages && unreadMessagesCount > 0
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative',
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-emerald-600' : 'text-gray-400')} />
                  {item.title}
                  {showBadge && (
                    <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                      {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                    </span>
                  )}
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
    </>
  )
}
