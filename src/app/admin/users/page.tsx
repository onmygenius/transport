'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatDate, getInitials } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { KycActions } from '@/components/admin/kyc-actions'
import { KycDocumentsViewer } from '@/components/admin/kyc-documents-viewer'
import type { Profile } from '@/lib/types'
import {
  Search, Filter, Download, UserCheck, UserX, Ban,
  Eye, MoreHorizontal, ChevronLeft, ChevronRight,
  Users, Truck, Building2, Clock, CheckCircle, XCircle, Loader2, FileText
} from 'lucide-react'

interface UserWithSubscription extends Profile {
  subscription_status?: string
  subscription_plan?: string
}

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
  const supabase = createClient()
  const [users, setUsers] = useState<UserWithSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [kycFilter, setKycFilter] = useState('all')
  const [subFilter, setSubFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [showDocuments, setShowDocuments] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserWithSubscription | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<UserWithSubscription | null>(null)
  const perPage = 10

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .neq('role', 'admin')
      .order('created_at', { ascending: false })

    if (profiles) {
      setUsers(profiles)
    }
    setLoading(false)
  }

  const filtered = users.filter(u => {
    const matchSearch = (u.company_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.company_cif?.toLowerCase() || '').includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchKyc = kycFilter === 'all' || u.kyc_status === kycFilter
    return matchSearch && matchRole && matchKyc
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const stats = {
    total: users.length,
    transporters: users.filter(u => u.role === 'transporter').length,
    clients: users.filter(u => u.role === 'client').length,
    pendingKyc: users.filter(u => u.kyc_status === 'pending').length,
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
                              {getInitials(user.company_name || user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{user.company_name || user.email}</p>
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
                          {user.company_country || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={kycLabels[user.kyc_status].variant}>
                          {kycLabels[user.kyc_status].label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary">
                          N/A
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(user.created_at)}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(user.updated_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {user.kyc_status === 'pending' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
                              title="View KYC Documents"
                              onClick={() => {
                                setSelectedUser(user)
                                setShowDocuments(true)
                              }}
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7" 
                            title="View profile"
                            onClick={() => {
                              setSelectedUserForDetails(user)
                              setShowUserDetails(true)
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {user.kyc_status === 'pending' && (
                            <KycActions 
                              userId={user.id} 
                              userName={user.company_name || user.email}
                              onSuccess={loadUsers}
                            />
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

            {loading && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Loader2 className="h-10 w-10 mb-3 animate-spin" />
                <p className="text-sm font-medium">Loading users...</p>
              </div>
            )}

            {!loading && filtered.length === 0 && (
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

      {showDocuments && selectedUser && (
        <KycDocumentsViewer
          userId={selectedUser.id}
          userName={selectedUser.company_name || selectedUser.email}
          onClose={() => {
            setShowDocuments(false)
            setSelectedUser(null)
          }}
        />
      )}

      {showUserDetails && selectedUserForDetails && (
        <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={`text-sm font-bold ${selectedUserForDetails.role === 'transporter' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {getInitials(selectedUserForDetails.company_name || selectedUserForDetails.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-bold text-gray-900">{selectedUserForDetails.company_name || 'User Details'}</p>
                  <p className="text-sm font-normal text-gray-500">{selectedUserForDetails.email}</p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Role</p>
                    <Badge variant={selectedUserForDetails.role === 'transporter' ? 'default' : 'info'}>
                      {selectedUserForDetails.role === 'transporter' ? 'Transporter' : 'Client'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">KYC Status</p>
                    <Badge variant={kycLabels[selectedUserForDetails.kyc_status].variant}>
                      {kycLabels[selectedUserForDetails.kyc_status].label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Full Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedUserForDetails.full_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{selectedUserForDetails.phone || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Company Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Company Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedUserForDetails.company_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Company CIF</p>
                    <p className="text-sm font-medium text-gray-900">{selectedUserForDetails.company_cif || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Country</p>
                    <p className="text-sm font-medium text-gray-900">{selectedUserForDetails.company_country || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Address</p>
                    <p className="text-sm font-medium text-gray-900">{selectedUserForDetails.company_address || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Account Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">User ID</p>
                    <p className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">{selectedUserForDetails.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedUserForDetails.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Registered</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(selectedUserForDetails.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(selectedUserForDetails.updated_at)}</p>
                  </div>
                </div>
              </div>

              {/* KYC Documents Link */}
              {selectedUserForDetails.kyc_status === 'pending' && (
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setShowUserDetails(false)
                      setSelectedUser(selectedUserForDetails)
                      setShowDocuments(true)
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View KYC Documents
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
