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
  Search, AlertTriangle, CheckCircle, Clock, XCircle,
  Eye, ChevronLeft, ChevronRight, MessageSquare
} from 'lucide-react'

const mockDisputes = [
  { id: 'DIS-001', shipmentId: 'SHP-1842', client: 'EuroShip GmbH', transporter: 'Trans Cargo SRL', amount: 2400, reason: 'Damaged cargo', description: 'Container arrived with visible damage at the corners. Client refuses to confirm delivery.', status: 'open', opened: '2026-02-19', adminNotes: '' },
  { id: 'DIS-002', shipmentId: 'SHP-1839', client: 'Nordic Freight AS', transporter: 'Balkan Transport DOO', amount: 1850, reason: 'Late delivery', description: 'Delivery was 5 days late compared to the agreed deadline. Client requests compensation.', status: 'in_review', opened: '2026-02-18', adminNotes: 'Both parties contacted. Awaiting additional documents.' },
  { id: 'DIS-003', shipmentId: 'SHP-1835', client: 'Container Plus Ltd', transporter: 'Fast Logistics SA', amount: 3200, reason: 'Missing cargo', description: 'Out of 3 shipped containers, only 2 arrived at destination.', status: 'open', opened: '2026-02-17', adminNotes: '' },
  { id: 'DIS-004', shipmentId: 'SHP-1820', client: 'Alpine Logistics AG', transporter: 'Iberian Cargo SL', amount: 1200, reason: 'Unresponsive transporter', description: 'Transporter did not respond to messages for 48h during transport.', status: 'resolved', opened: '2026-02-10', adminNotes: 'Resolved in favor of client. 20% refund granted.' },
  { id: 'DIS-005', shipmentId: 'SHP-1815', client: 'Vistula Trans SP', transporter: 'Nordic Freight AS', amount: 980, reason: 'Other reason', description: 'Disagreement regarding the final price vs. the initial offer.', status: 'closed', opened: '2026-02-05', adminNotes: 'Closed. Both parties reached an agreement.' },
]

const statusConfig: Record<string, { label: string; variant: 'destructive' | 'warning' | 'success' | 'secondary'; icon: React.ElementType }> = {
  open: { label: 'Open', variant: 'destructive', icon: AlertTriangle },
  in_review: { label: 'In Review', variant: 'warning', icon: Clock },
  resolved: { label: 'Resolved', variant: 'success', icon: CheckCircle },
  closed: { label: 'Closed', variant: 'secondary', icon: XCircle },
}

export default function DisputesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const perPage = 10

  const filtered = mockDisputes.filter(d => {
    const matchSearch = d.client.toLowerCase().includes(search.toLowerCase()) ||
      d.transporter.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const openCount = mockDisputes.filter(d => d.status === 'open').length
  const inReviewCount = mockDisputes.filter(d => d.status === 'in_review').length
  const resolvedCount = mockDisputes.filter(d => d.status === 'resolved').length
  const totalAmount = mockDisputes.filter(d => ['open', 'in_review'].includes(d.status)).reduce((a, d) => a + d.amount, 0)

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Dispute Management" subtitle="Manage disputes between clients and transporters" />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Open Disputes', value: openCount, color: 'bg-red-100 text-red-700', icon: AlertTriangle },
            { label: 'In Review', value: inReviewCount, color: 'bg-amber-100 text-amber-700', icon: Clock },
            { label: 'Resolved', value: resolvedCount, color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
            { label: 'Amount in Dispute', value: formatCurrency(totalAmount), color: 'bg-blue-100 text-blue-700', icon: AlertTriangle },
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
            <CardTitle className="text-base">All Disputes</CardTitle>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input placeholder="Search by ID, client, transporter..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
              </div>
              <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {paginated.map(dispute => {
                const cfg = statusConfig[dispute.status]
                const StatusIcon = cfg.icon
                return (
                  <div key={dispute.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono text-xs font-bold text-gray-500">{dispute.id}</span>
                          <span className="text-xs text-gray-400">→</span>
                          <span className="font-mono text-xs text-gray-500">{dispute.shipmentId}</span>
                          <Badge variant={cfg.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {cfg.label}
                          </Badge>
                        </div>
                        <h3 className="mt-2 font-semibold text-gray-900">{dispute.reason}</h3>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{dispute.description}</p>
                        <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                          <span><span className="font-medium text-gray-700">Client:</span> {dispute.client}</span>
                          <span><span className="font-medium text-gray-700">Transporter:</span> {dispute.transporter}</span>
                          <span><span className="font-medium text-gray-700">Opened:</span> {formatDate(dispute.opened)}</span>
                        </div>
                        {dispute.adminNotes && (
                          <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                            <p className="text-xs text-blue-700"><span className="font-semibold">Admin notes:</span> {dispute.adminNotes}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(dispute.amount)}</span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                            <Eye className="h-3.5 w-3.5" />
                            Details
                          </Button>
                          {['open', 'in_review'].includes(dispute.status) && (
                            <Button size="sm" className="gap-1.5 h-8 text-xs">
                              <MessageSquare className="h-3.5 w-3.5" />
                              Manage
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <AlertTriangle className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No disputes found</p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-xs text-gray-500">{filtered.length} disputes</p>
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
