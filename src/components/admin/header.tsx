'use client'

import { Bell, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface AdminHeaderProps {
  title: string
  subtitle?: string
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6">
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            className="w-64 pl-9 h-9 bg-gray-50 border-gray-200"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </Button>

        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src="" />
          <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">AD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
