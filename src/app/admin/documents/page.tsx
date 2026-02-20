'use client'

import { useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'
import {
  Search, Download, FileText, CheckCircle, Clock,
  XCircle, Eye, ChevronLeft, ChevronRight, AlertTriangle, File
} from 'lucide-react'

const mockDocuments = [
  { id: 'DOC-001', shipmentId: 'SHP-1842', company: 'Trans Cargo SRL', type: 'CMR', filename: 'CMR_SHP1842.pdf', size: '245 KB', uploadedAt: '2026-02-20', status: 'verified' },
  { id: 'DOC-002', shipmentId: 'SHP-1842', company: 'EuroShip GmbH', type: 'Invoice', filename: 'INV_SHP1842.pdf', size: '128 KB', uploadedAt: '2026-02-20', status: 'verified' },
  { id: 'DOC-003', shipmentId: 'SHP-1840', company: 'Fast Logistics SA', type: 'CMR', filename: 'CMR_SHP1840.pdf', size: '312 KB', uploadedAt: '2026-02-19', status: 'pending' },
  { id: 'DOC-004', shipmentId: 'SHP-1839', company: 'Balkan Transport DOO', type: 'POD', filename: 'POD_SHP1839.jpg', size: '1.2 MB', uploadedAt: '2026-02-18', status: 'disputed' },
  { id: 'DOC-005', shipmentId: 'SHP-1838', company: 'Iberian Cargo SL', type: 'CMR', filename: 'CMR_SHP1838.pdf', size: '198 KB', uploadedAt: '2026-02-17', status: 'verified' },
  { id: 'DOC-006', shipmentId: 'SHP-1838', company: 'Alpine Logistics AG', type: 'Invoice', filename: 'INV_SHP1838.pdf', size: '156 KB', uploadedAt: '2026-02-17', status: 'verified' },
  { id: 'DOC-007', shipmentId: 'SHP-1837', company: 'Nordic Freight AS', type: 'POD', filename: 'POD_SHP1837.pdf', size: '890 KB', uploadedAt: '2026-02-16', status: 'verified' },
  { id: 'DOC-008', shipmentId: 'SHP-1835', company: 'Container Plus Ltd', type: 'CMR', filename: 'CMR_SHP1835.pdf', size: '267 KB', uploadedAt: '2026-02-15', status: 'flagged' },
  { id: 'DOC-009', shipmentId: 'SHP-1834', company: 'Trans Cargo SRL', type: 'Invoice', filename: 'INV_SHP1834.pdf', size: '143 KB', uploadedAt: '2026-02-14', status: 'verified' },
  { id: 'DOC-010', shipmentId: 'SHP-1833', company: 'Vistula Trans SP', type: 'CMR', filename: 'CMR_SHP1833.pdf', size: '221 KB', uploadedAt: '2026-02-13', status: 'pending' },
]

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'default' }> = {
  verified: { label: 'Verified', variant: 'success' },
  pending: { label: 'Pending Review', variant: 'warning' },
  disputed: { label: 'Disputed', variant: 'destructive' },
  flagged: { label: 'Flagged', variant: 'destructive' },
}

const typeIcons: Record<string, React.ElementType> = {
  CMR: FileText,
  Invoice: File,
  POD: CheckCircle,
}

export default function DocumentsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const perPage = 10

  const filtered = mockDocuments.filter(d => {
    const matchSearch =
      d.company.toLowerCase().includes(search.toLowerCase()) ||
      d.shipmentId.toLowerCase().includes(search.toLowerCase()) ||
      d.filename.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    const matchType = typeFilter === 'all' || d.type === typeFilter
    return matchSearch && matchStatus && matchType
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const stats = {
    total: mockDocuments.length,
    verified: mockDocuments.filter(d => d.status === 'verified').length,
    pending: mockDocuments.filter(d => d.status === 'pending').length,
    flagged: mockDocuments.filter(d => ['flagged', 'disputed'].includes(d.status)).length,
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Document Management" subtitle="All platform documents — CMR, invoices, proof of delivery" />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Total Documents', value: stats.total, color: 'bg-blue-100 text-blue-700', icon: FileText },
            { label: 'Verified', value: stats.verified, color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
            { label: 'Pending Review', value: stats.pending, color: 'bg-amber-100 text-amber-700', icon: Clock },
            { label: 'Flagged / Disputed', value: stats.flagged, color: 'bg-red-100 text-red-700', icon: AlertTriangle },
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
              <CardTitle className="text-base">All Documents</CardTitle>
              <Button variant="outline" size="sm" className="gap-2 self-start">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by company, shipment ID, filename..."
                  className="pl-9"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                />
              </div>
              <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1) }}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="CMR">CMR</SelectItem>
                  <SelectItem value="Invoice">Invoice</SelectItem>
                  <SelectItem value="POD">Proof of Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Document</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Shipment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Uploaded</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map(doc => {
                    const cfg = statusConfig[doc.status]
                    const TypeIcon = typeIcons[doc.type] ?? FileText
                    return (
                      <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                              <TypeIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-900">{doc.filename}</p>
                              <p className="text-xs text-gray-400">{doc.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-semibold text-blue-600">{doc.shipmentId}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{doc.company}</td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary">{doc.type}</Badge>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">{doc.size}</td>
                        <td className="px-6 py-4 text-xs text-gray-500">{formatDate(doc.uploadedAt)}</td>
                        <td className="px-6 py-4">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="View document">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400" title="Download">
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                            {['flagged', 'disputed'].includes(doc.status) && (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50" title="Remove">
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FileText className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No documents found</p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-xs text-gray-500">
                {filtered.length === 0 ? '0' : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)}`} of {filtered.length} documents
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
