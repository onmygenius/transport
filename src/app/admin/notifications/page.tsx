'use client'

import { useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDateTime } from '@/lib/utils'
import {
  Search, Bell, CheckCircle, Clock, AlertTriangle,
  ChevronLeft, ChevronRight, CreditCard, Package, Users, Shield
} from 'lucide-react'

const mockNotifications = [
  { id: 'NOT-001', type: 'kyc', title: 'New KYC submission', message: 'Trans Cargo SRL submitted KYC documents for review.', user: 'Trans Cargo SRL', read: false, createdAt: '2026-02-20T14:32:00Z' },
  { id: 'NOT-002', type: 'dispute', title: 'New dispute opened', message: 'EuroShip GmbH opened a dispute for shipment SHP-1842 — Damaged cargo.', user: 'EuroShip GmbH', read: false, createdAt: '2026-02-20T13:15:00Z' },
  { id: 'NOT-003', type: 'subscription', title: 'Subscription expiring soon', message: 'Alpine Logistics AG subscription expires in 3 days.', user: 'Alpine Logistics AG', read: false, createdAt: '2026-02-20T11:00:00Z' },
  { id: 'NOT-004', type: 'kyc', title: 'New KYC submission', message: 'Fast Logistics SA submitted KYC documents for review.', user: 'Fast Logistics SA', read: true, createdAt: '2026-02-19T16:45:00Z' },
  { id: 'NOT-005', type: 'payment', title: 'Large payment in escrow', message: 'Payment of €3,200 held in escrow for shipment SHP-1835.', user: 'Container Plus Ltd', read: true, createdAt: '2026-02-19T14:30:00Z' },
  { id: 'NOT-006', type: 'dispute', title: 'Dispute escalated', message: 'Nordic Freight AS dispute DIS-002 has been escalated — no response from transporter.', user: 'Nordic Freight AS', read: true, createdAt: '2026-02-19T12:00:00Z' },
  { id: 'NOT-007', type: 'subscription', title: 'Subscription expired', message: 'Balkan Transport DOO subscription has expired. Account access restricted.', user: 'Balkan Transport DOO', read: true, createdAt: '2026-02-18T09:00:00Z' },
  { id: 'NOT-008', type: 'system', title: 'Suspicious activity detected', message: 'Multiple failed login attempts detected for account info@alpine-log.ch.', user: 'Alpine Logistics AG', read: false, createdAt: '2026-02-18T08:30:00Z' },
  { id: 'NOT-009', type: 'kyc', title: 'New KYC submission', message: 'Alpine Logistics AG submitted updated KYC documents.', user: 'Alpine Logistics AG', read: true, createdAt: '2026-02-17T15:20:00Z' },
  { id: 'NOT-010', type: 'payment', title: 'Payment released', message: 'Escrow payment of €2,800 released to Iberian Cargo SL for shipment SHP-1838.', user: 'Iberian Cargo SL', read: true, createdAt: '2026-02-17T11:10:00Z' },
]

const typeConfig: Record<string, { label: string; variant: 'warning' | 'destructive' | 'info' | 'success' | 'default'; icon: React.ElementType; color: string }> = {
  kyc: { label: 'KYC', variant: 'warning', icon: Users, color: 'bg-amber-100 text-amber-600' },
  dispute: { label: 'Dispute', variant: 'destructive', icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
  subscription: { label: 'Subscription', variant: 'info', icon: CreditCard, color: 'bg-blue-100 text-blue-600' },
  payment: { label: 'Payment', variant: 'success', icon: Package, color: 'bg-emerald-100 text-emerald-600' },
  system: { label: 'System', variant: 'default', icon: Shield, color: 'bg-gray-100 text-gray-600' },
}

export default function NotificationsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [readFilter, setReadFilter] = useState('all')
  const [page, setPage] = useState(1)
  const perPage = 10

  const filtered = mockNotifications.filter(n => {
    const matchSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase()) ||
      n.user.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || n.type === typeFilter
    const matchRead =
      readFilter === 'all' ||
      (readFilter === 'unread' && !n.read) ||
      (readFilter === 'read' && n.read)
    return matchSearch && matchType && matchRead
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const unreadCount = mockNotifications.filter(n => !n.read).length
  const kycCount = mockNotifications.filter(n => n.type === 'kyc').length
  const disputeCount = mockNotifications.filter(n => n.type === 'dispute').length

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Notifications" subtitle="System alerts and platform activity notifications" />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Total', value: mockNotifications.length, color: 'bg-blue-100 text-blue-700', icon: Bell },
            { label: 'Unread', value: unreadCount, color: 'bg-red-100 text-red-700', icon: AlertTriangle },
            { label: 'KYC Alerts', value: kycCount, color: 'bg-amber-100 text-amber-700', icon: Users },
            { label: 'Dispute Alerts', value: disputeCount, color: 'bg-rose-100 text-rose-700', icon: AlertTriangle },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">All Notifications</CardTitle>
              <Button variant="outline" size="sm" className="gap-2 self-start">
                <CheckCircle className="h-4 w-4" />
                Mark all as read
              </Button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  className="pl-9"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                />
              </div>
              <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1) }}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="kyc">KYC</SelectItem>
                  <SelectItem value="dispute">Dispute</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <Select value={readFilter} onValueChange={v => { setReadFilter(v); setPage(1) }}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {paginated.map(notif => {
                const cfg = typeConfig[notif.type]
                const TypeIcon = cfg.icon
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-4 px-6 py-4 transition-colors hover:bg-gray-50 ${!notif.read ? 'bg-blue-50/40' : ''}`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.color}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-semibold ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                        </p>
                        <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                        {!notif.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">{notif.message}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                        <span className="font-medium text-gray-500">{notif.user}</span>
                        <span>{formatDateTime(notif.createdAt)}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {!notif.read ? (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Mark read
                        </Button>
                      ) : (
                        <Clock className="h-4 w-4 text-gray-300" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Bell className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No notifications found</p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-xs text-gray-500">
                {filtered.length === 0 ? '0' : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)}`} of {filtered.length} notifications
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-gray-600 font-medium">Page {page} of {totalPages || 1}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
