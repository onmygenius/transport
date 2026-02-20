'use client'

import { useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDateTime } from '@/lib/utils'
import { Search, Download, Shield, ChevronLeft, ChevronRight } from 'lucide-react'

const mockAuditLogs = [
  { id: '1', admin: 'Admin Principal', action: 'APPROVE_KYC', entity: 'User', entityId: 'USR-002', details: 'KYC approved for EuroShip GmbH', ip: '192.168.1.1', createdAt: '2026-02-20T14:32:00Z' },
  { id: '2', admin: 'Admin Principal', action: 'SUSPEND_SUBSCRIPTION', entity: 'Subscription', entityId: 'SUB-008', details: 'Subscription suspended for Vistula Trans SP - non-payment', ip: '192.168.1.1', createdAt: '2026-02-20T13:15:00Z' },
  { id: '3', admin: 'Admin Principal', action: 'REJECT_KYC', entity: 'User', entityId: 'USR-005', details: 'KYC rejected for Balkan Transport DOO - invalid documents', ip: '192.168.1.1', createdAt: '2026-02-20T11:48:00Z' },
  { id: '4', admin: 'Admin Principal', action: 'RESOLVE_DISPUTE', entity: 'Dispute', entityId: 'DIS-004', details: 'Resolved in favor of client Alpine Logistics AG - 20% refund granted', ip: '192.168.1.1', createdAt: '2026-02-20T10:22:00Z' },
  { id: '5', admin: 'Admin Principal', action: 'UPDATE_SETTINGS', entity: 'SystemSettings', entityId: 'commission_percent', details: 'Platform commission changed from 2.5% to 3%', ip: '192.168.1.1', createdAt: '2026-02-19T16:05:00Z' },
  { id: '6', admin: 'Admin Principal', action: 'DELETE_POST', entity: 'TruckAvailability', entityId: 'TRK-142', details: 'Fraudulent post deleted - suspicious price', ip: '192.168.1.1', createdAt: '2026-02-19T14:30:00Z' },
  { id: '7', admin: 'Admin Principal', action: 'ACTIVATE_SUBSCRIPTION', entity: 'Subscription', entityId: 'SUB-NEW', details: 'Subscription manually activated for Trans Cargo SRL', ip: '192.168.1.1', createdAt: '2026-02-19T12:00:00Z' },
  { id: '8', admin: 'Admin Principal', action: 'RESET_PASSWORD', entity: 'User', entityId: 'USR-007', details: 'Password manually reset for Iberian Cargo SL', ip: '192.168.1.1', createdAt: '2026-02-18T09:45:00Z' },
  { id: '9', admin: 'Admin Principal', action: 'APPROVE_KYC', entity: 'User', entityId: 'USR-006', details: 'KYC approved for Nordic Freight AS', ip: '192.168.1.1', createdAt: '2026-02-17T15:20:00Z' },
  { id: '10', admin: 'Admin Principal', action: 'SUSPEND_USER', entity: 'User', entityId: 'USR-010', details: 'Account suspended for Vistula Trans SP - suspicious activity', ip: '192.168.1.1', createdAt: '2026-02-16T11:10:00Z' },
]

const actionConfig: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'info' | 'default' | 'secondary' }> = {
  APPROVE_KYC: { label: 'Approve KYC', variant: 'success' },
  REJECT_KYC: { label: 'Reject KYC', variant: 'destructive' },
  SUSPEND_USER: { label: 'Suspend User', variant: 'warning' },
  ACTIVATE_SUBSCRIPTION: { label: 'Activate Subscription', variant: 'success' },
  SUSPEND_SUBSCRIPTION: { label: 'Suspend Subscription', variant: 'warning' },
  RESOLVE_DISPUTE: { label: 'Resolve Dispute', variant: 'info' },
  UPDATE_SETTINGS: { label: 'Update Settings', variant: 'default' },
  DELETE_POST: { label: 'Delete Post', variant: 'destructive' },
  RESET_PASSWORD: { label: 'Reset Password', variant: 'secondary' },
}

export default function AuditPage() {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [page, setPage] = useState(1)
  const perPage = 10

  const filtered = mockAuditLogs.filter(log => {
    const matchSearch =
      log.admin.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.entityId.toLowerCase().includes(search.toLowerCase())
    const matchAction = actionFilter === 'all' || log.action === actionFilter
    return matchSearch && matchAction
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Audit Log" subtitle="History of all administrative actions" />

      <main className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">Admin Action Log</CardTitle>
              <Button variant="outline" size="sm" className="gap-2 self-start">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input placeholder="Search audit log..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
              </div>
              <Select value={actionFilter} onValueChange={v => { setActionFilter(v); setPage(1) }}>
                <SelectTrigger className="w-full sm:w-52">
                  <SelectValue placeholder="Action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="APPROVE_KYC">Approve KYC</SelectItem>
                  <SelectItem value="REJECT_KYC">Reject KYC</SelectItem>
                  <SelectItem value="SUSPEND_USER">Suspend User</SelectItem>
                  <SelectItem value="ACTIVATE_SUBSCRIPTION">Activate Subscription</SelectItem>
                  <SelectItem value="SUSPEND_SUBSCRIPTION">Suspend Subscription</SelectItem>
                  <SelectItem value="RESOLVE_DISPUTE">Resolve Dispute</SelectItem>
                  <SelectItem value="UPDATE_SETTINGS">Update Settings</SelectItem>
                  <SelectItem value="DELETE_POST">Delete Post</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {paginated.map(log => {
                const cfg = actionConfig[log.action] ?? { label: log.action, variant: 'secondary' as const }
                return (
                  <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <Shield className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                        <span className="text-xs font-mono text-gray-500">{log.entityId}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700">{log.details}</p>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-400">
                        <span><span className="font-medium text-gray-500">Admin:</span> {log.admin}</span>
                        <span><span className="font-medium text-gray-500">IP:</span> {log.ip}</span>
                        <span>{formatDateTime(log.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Shield className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No records found</p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-xs text-gray-500">{filtered.length} records</p>
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
