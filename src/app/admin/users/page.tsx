'use client'

import { useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDate, getInitials } from '@/lib/utils'
import {
  Search, Filter, Download, UserCheck, UserX, Ban,
  Eye, MoreHorizontal, ChevronLeft, ChevronRight,
  Users, Truck, Building2, Clock, CheckCircle, XCircle
} from 'lucide-react'

const mockUsers = [
  { id: '1', name: 'Trans Cargo SRL', email: 'office@transcargo.ro', role: 'transporter', country: 'RO', kyc: 'pending', subscription: 'active', plan: 'monthly', joined: '2026-02-20', lastActive: '2026-02-20' },
  { id: '2', name: 'EuroShip GmbH', email: 'info@euroship.de', role: 'client', country: 'DE', kyc: 'approved', subscription: 'active', plan: 'annual', joined: '2026-02-19', lastActive: '2026-02-20' },
  { id: '3', name: 'Fast Logistics SA', email: 'contact@fastlogistics.fr', role: 'transporter', country: 'FR', kyc: 'pending', subscription: 'active', plan: 'annual', joined: '2026-02-19', lastActive: '2026-02-19' },
  { id: '4', name: 'Container Plus Ltd', email: 'ops@containerplus.co.uk', role: 'client', country: 'GB', kyc: 'approved', subscription: 'active', plan: 'monthly', joined: '2026-02-18', lastActive: '2026-02-20' },
  { id: '5', name: 'Balkan Transport DOO', email: 'info@balkantransport.rs', role: 'transporter', country: 'RS', kyc: 'rejected', subscription: 'expired', plan: 'monthly', joined: '2026-02-18', lastActive: '2026-02-18' },
  { id: '6', name: 'Nordic Freight AS', email: 'freight@nordic.no', role: 'client', country: 'NO', kyc: 'approved', subscription: 'active', plan: 'annual', joined: '2026-02-17', lastActive: '2026-02-19' },
  { id: '7', name: 'Iberian Cargo SL', email: 'cargo@iberian.es', role: 'transporter', country: 'ES', kyc: 'approved', subscription: 'active', plan: 'monthly', joined: '2026-02-16', lastActive: '2026-02-18' },
  { id: '8', name: 'Alpine Logistics AG', email: 'info@alpine-log.ch', role: 'transporter', country: 'CH', kyc: 'pending', subscription: 'expired', plan: 'monthly', joined: '2026-02-15', lastActive: '2026-02-15' },
  { id: '9', name: 'Adriatic Shipping DOO', email: 'ship@adriatic.hr', role: 'client', country: 'HR', kyc: 'approved', subscription: 'active', plan: 'monthly', joined: '2026-02-14', lastActive: '2026-02-20' },
  { id: '10', name: 'Vistula Trans SP', email: 'trans@vistula.pl', role: 'transporter', country: 'PL', kyc: 'approved', subscription: 'suspended', plan: 'annual', joined: '2026-02-13', lastActive: '2026-02-16' },
]

const kycLabels: Record<string, { label: string; variant: 'warning' | 'success' | 'destructive' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
}

const subscriptionLabels: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'secondary' }> = {
  active: { label: 'Active', variant: 'success' },
  expired: { label: 'Expired', variant: 'destructive' },
  suspended: { label: 'Suspended', variant: 'warning' },
  cancelled: { label: 'Cancelled', variant: 'secondary' },
}

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [kycFilter, setKycFilter] = useState('all')
  const [subFilter, setSubFilter] = useState('all')
  const [page, setPage] = useState(1)
  const perPage = 10

  const filtered = mockUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchKyc = kycFilter === 'all' || u.kyc === kycFilter
    const matchSub = subFilter === 'all' || u.subscription === subFilter
    return matchSearch && matchRole && matchKyc && matchSub
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const stats = {
    total: mockUsers.length,
    transporters: mockUsers.filter(u => u.role === 'transporter').length,
    clients: mockUsers.filter(u => u.role === 'client').length,
    pendingKyc: mockUsers.filter(u => u.kyc === 'pending').length,
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="User Management" subtitle="Manage all platform users" />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Total Users', value: stats.total, icon: Users, color: 'bg-blue-100 text-blue-700' },
            { label: 'Transporters', value: stats.transporters, icon: Truck, color: 'bg-violet-100 text-violet-700' },
            { label: 'Clients', value: stats.clients, icon: Building2, color: 'bg-emerald-100 text-emerald-700' },
            { label: 'Pending KYC', value: stats.pendingKyc, icon: Clock, color: 'bg-amber-100 text-amber-700' },
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
              <CardTitle className="text-base">All Users</CardTitle>
              <Button variant="outline" size="sm" className="gap-2 self-start">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, VAT..."
                  className="pl-9"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                />
              </div>
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
              <Select value={kycFilter} onValueChange={v => { setKycFilter(v); setPage(1) }}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="KYC Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={subFilter} onValueChange={v => { setSubFilter(v); setPage(1) }}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Subscription" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Country</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">KYC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Subscription</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Registered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Last Active</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={`text-xs font-bold ${user.role === 'transporter' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.role === 'transporter' ? 'default' : 'info'}>
                          {user.role === 'transporter' ? 'Transporter' : 'Client'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          {user.country}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={kycLabels[user.kyc].variant}>
                          {kycLabels[user.kyc].label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <Badge variant={subscriptionLabels[user.subscription].variant}>
                            {subscriptionLabels[user.subscription].label}
                          </Badge>
                          {user.subscription === 'active' && (
                            <span className="text-[10px] text-gray-400 capitalize">{user.plan === 'monthly' ? 'Monthly' : 'Annual'}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(user.joined)}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(user.lastActive)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="View profile">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {user.kyc === 'pending' && (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50" title="Approve KYC">
                                <UserCheck className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50" title="Reject KYC">
                                <UserX className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-600" title="More actions">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Users className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No users found</p>
                <p className="text-xs">Try adjusting your search filters</p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-xs text-gray-500">
                {filtered.length === 0 ? '0' : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)}`} of {filtered.length} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-gray-600 font-medium">
                  Page {page} of {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
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
