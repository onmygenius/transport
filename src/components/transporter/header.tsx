'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { NotificationMarquee } from '@/components/notifications/notification-marquee'

interface TransporterHeaderProps {
  title: string
  subtitle?: string
  companyName?: string
}

export function TransporterHeader({ title, subtitle, companyName }: TransporterHeaderProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const supabase = createClient()
  
  const initials = companyName
    ? companyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'TR'

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
      .channel('profile-changes')
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
        <NotificationBell variant="transporter" />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white cursor-pointer overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>
      </div>
    </header>
  )
}
