'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  Search, Download, CreditCard, TrendingUp, ChevronLeft,
  ChevronRight, RefreshCw, Ban, CheckCircle, Calendar, Loader2
} from 'lucide-react'

interface SubscriptionWithUser {
  id: string
  user_id: string
  plan: string
  plan_name: string
  status: string
  price: number
  currency: string
  starts_at: string
  expires_at: string
  stripe_subscription_id: string
  user_email?: string
  user_name?: string
  user_role?: string
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'secondary' }> = {
  active: { label: 'Active', variant: 'success' },
  expired: { label: 'Expired', variant: 'destructive' },
  suspended: { label: 'Suspended', variant: 'warning' },
  cancelled: { label: 'Cancelled', variant: 'secondary' },
}

export default function SubscriptionsPage() {
  const supabase = createClient()
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const perPage = 10

  useEffect(() => {
    loadSubscriptions()
  }, [])

  async function loadSubscriptions() {
    setLoading(true)
    const { data: subs } = await supabase
      .from('subscriptions')
      .select(`
        *,
        profile:profiles(email, company_name, role)
      `)
      .order('created_at', { ascending: false })

    if (subs) {
      const subsWithUser = subs.map(sub => ({
        ...sub,
        user_email: Array.isArray(sub.profile) ? sub.profile[0]?.email : sub.profile?.email,
        user_name: Array.isArray(sub.profile) ? sub.profile[0]?.company_name : sub.profile?.company_name,
        user_role: Array.isArray(sub.profile) ? sub.profile[0]?.role : sub.profile?.role,
      }))
      setSubscriptions(subsWithUser)
    }
    setLoading(false)
  }

  const filtered = subscriptions.filter(s => {
    const matchSearch = (s.user_name?.toLowerCase() || '').includes(search.toLowerCase()) || 
                       (s.user_email?.toLowerCase() || '').includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    const matchPlan = planFilter === 'all' || s.plan === planFilter
    const matchRole = roleFilter === 'all' || s.user_role === roleFilter
    return matchSearch && matchStatus && matchPlan && matchRole
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const totalRevenue = subscriptions.filter(s => s.status === 'active').reduce((acc, s) => acc + (s.price || 0), 0)
  const activeCount = subscriptions.filter(s => s.status === 'active').length
  const expiredCount = subscriptions.filter(s => s.status === 'expired').length
  const suspendedCount = subscriptions.filter(s => s.status === 'suspended').length

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Subscription Management" subtitle="View and control user subscriptions" />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Active Subscriptions', value: activeCount, icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
            { label: 'Recurring Revenue', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
            { label: 'Expired', value: expiredCount, icon: Calendar, color: 'bg-red-100 text-red-700' },
            { label: 'Suspended', value: suspendedCount, icon: Ban, color: 'bg-emerald-100 text-emerald-700' },
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
            <CardTitle className="text-base">All Subscriptions</CardTitle>
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
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="transporter_pro">Transporter Pro</SelectItem>
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
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Loading subscriptions...</p>
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                        <p className="text-sm">No subscriptions found</p>
                      </td>
                    </tr>
                  ) : (
                    paginated.map(sub => (
                      <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{sub.id.slice(0, 8)}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{sub.user_name || sub.user_email || '-'}</p>
                          <p className="text-xs text-gray-500">{sub.user_email || '-'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={sub.user_role === 'transporter' ? 'default' : 'info'}>
                            {sub.user_role === 'transporter' ? 'Transporter' : 'Client'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-700">
                            {sub.plan_name || sub.plan || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(sub.price || 0)}</td>
                        <td className="px-6 py-4 text-xs text-gray-500">{formatDate(sub.starts_at)}</td>
                        <td className="px-6 py-4 text-xs text-gray-500">{formatDate(sub.expires_at)}</td>
                        <td className="px-6 py-4">
                          <Badge variant={statusConfig[sub.status]?.variant || 'secondary'}>
                            {statusConfig[sub.status]?.label || sub.status}
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
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1">
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
                    ))
                  )}
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
