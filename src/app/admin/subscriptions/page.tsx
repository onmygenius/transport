'use client'

import { useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  Search, Download, CreditCard, TrendingUp, ChevronLeft,
  ChevronRight, RefreshCw, Ban, CheckCircle, Calendar
} from 'lucide-react'

const mockSubscriptions = [
  { id: 'SUB-001', user: 'Trans Cargo SRL', email: 'office@transcargo.ro', role: 'transporter', plan: 'monthly', price: 49, currency: 'EUR', status: 'active', starts: '2026-02-01', expires: '2026-03-01', stripeId: 'sub_abc123' },
  { id: 'SUB-002', user: 'EuroShip GmbH', email: 'info@euroship.de', role: 'client', plan: 'annual', price: 278, currency: 'EUR', status: 'active', starts: '2026-01-15', expires: '2027-01-15', stripeId: 'sub_def456' },
  { id: 'SUB-003', user: 'Fast Logistics SA', email: 'contact@fastlogistics.fr', role: 'transporter', plan: 'annual', price: 470, currency: 'EUR', status: 'active', starts: '2026-01-01', expires: '2027-01-01', stripeId: 'sub_ghi789' },
  { id: 'SUB-004', user: 'Container Plus Ltd', email: 'ops@containerplus.co.uk', role: 'client', plan: 'monthly', price: 29, currency: 'EUR', status: 'active', starts: '2026-02-10', expires: '2026-03-10', stripeId: 'sub_jkl012' },
  { id: 'SUB-005', user: 'Balkan Transport DOO', email: 'info@balkantransport.rs', role: 'transporter', plan: 'monthly', price: 49, currency: 'EUR', status: 'expired', starts: '2026-01-05', expires: '2026-02-05', stripeId: 'sub_mno345' },
  { id: 'SUB-006', user: 'Nordic Freight AS', email: 'freight@nordic.no', role: 'client', plan: 'annual', price: 278, currency: 'EUR', status: 'active', starts: '2025-12-01', expires: '2026-12-01', stripeId: 'sub_pqr678' },
  { id: 'SUB-007', user: 'Iberian Cargo SL', email: 'cargo@iberian.es', role: 'transporter', plan: 'monthly', price: 49, currency: 'EUR', status: 'active', starts: '2026-02-15', expires: '2026-03-15', stripeId: 'sub_stu901' },
  { id: 'SUB-008', user: 'Vistula Trans SP', email: 'trans@vistula.pl', role: 'transporter', plan: 'annual', price: 470, currency: 'EUR', status: 'suspended', starts: '2025-11-01', expires: '2026-11-01', stripeId: 'sub_vwx234' },
]

const statusConfig: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'secondary' }> = {
  active: { label: 'Active', variant: 'success' },
  expired: { label: 'Expired', variant: 'destructive' },
  suspended: { label: 'Suspended', variant: 'warning' },
  cancelled: { label: 'Cancelled', variant: 'secondary' },
}

export default function SubscriptionsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const perPage = 10

  const filtered = mockSubscriptions.filter(s => {
    const matchSearch = s.user.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    const matchPlan = planFilter === 'all' || s.plan === planFilter
    const matchRole = roleFilter === 'all' || s.role === roleFilter
    return matchSearch && matchStatus && matchPlan && matchRole
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const totalRevenue = mockSubscriptions.filter(s => s.status === 'active').reduce((acc, s) => acc + s.price, 0)
  const activeCount = mockSubscriptions.filter(s => s.status === 'active').length
  const expiredCount = mockSubscriptions.filter(s => s.status === 'expired').length
  const suspendedCount = mockSubscriptions.filter(s => s.status === 'suspended').length

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Subscription Management" subtitle="View and control user subscriptions" />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Active Subscriptions', value: activeCount, icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
            { label: 'Recurring Revenue', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
            { label: 'Expired', value: expiredCount, icon: Calendar, color: 'bg-red-100 text-red-700' },
            { label: 'Suspended', value: suspendedCount, icon: Ban, color: 'bg-amber-100 text-amber-700' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">All Subscriptions</CardTitle>
              <Button variant="outline" size="sm" className="gap-2 self-start">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input placeholder="Search user..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
              </div>
              <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={v => { setPlanFilter(v); setPage(1) }}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All plans</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={v => { setRoleFilter(v); setPage(1) }}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="User type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="transporter">Transporters</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Start</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Expires</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map(sub => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{sub.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{sub.user}</p>
                        <p className="text-xs text-gray-500">{sub.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={sub.role === 'transporter' ? 'default' : 'info'}>
                          {sub.role === 'transporter' ? 'Transporter' : 'Client'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-700">
                          {sub.plan === 'monthly' ? 'Monthly' : 'Annual'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(sub.price)}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{formatDate(sub.starts)}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{formatDate(sub.expires)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={statusConfig[sub.status].variant}>
                          {statusConfig[sub.status].label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {sub.status === 'suspended' && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 gap-1">
                              <RefreshCw className="h-3 w-3" />
                              Reactivate
                            </Button>
                          )}
                          {sub.status === 'active' && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 gap-1">
                              <Ban className="h-3 w-3" />
                              Suspend
                            </Button>
                          )}
                          {sub.status === 'expired' && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1">
                              <CreditCard className="h-3 w-3" />
                              Activate manually
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <CreditCard className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No subscriptions found</p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-xs text-gray-500">
                {filtered.length === 0 ? '0' : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)}`} of {filtered.length} subscriptions
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
