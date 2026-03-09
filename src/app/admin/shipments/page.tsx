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
import { ShipmentDetailsModal } from '@/components/admin/shipment-details-modal'
import type { Shipment } from '@/lib/types'
import {
  Search, Download, Package, CheckCircle, Clock,
  Truck, XCircle, Eye, ChevronLeft, ChevronRight, AlertTriangle, Loader2
} from 'lucide-react'

interface ShipmentWithNames extends Shipment {
  client_name?: string
  transporter_name?: string
}

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'default' | 'success' | 'destructive' | 'secondary'; icon: React.ElementType }> = {
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
  offer_received: { label: 'Offer Received', variant: 'info', icon: Package },
  confirmed: { label: 'Confirmed', variant: 'default', icon: CheckCircle },
  picked_up: { label: 'Picked Up', variant: 'default', icon: Truck },
  in_transit: { label: 'In Transit', variant: 'info', icon: Truck },
  delivered: { label: 'Delivered', variant: 'success', icon: CheckCircle },
  completed: { label: 'Completed', variant: 'success', icon: CheckCircle },
  disputed: { label: 'Disputed', variant: 'destructive', icon: AlertTriangle },
  cancelled: { label: 'Cancelled', variant: 'secondary', icon: XCircle },
}

const containerLabels: Record<string, string> = {
  '20ft': '20 FT',
  '30ft': '30 FT',
  '40ft': '40 FT',
  '45ft': '45 FT',
  'other': 'Other',
}

export default function ShipmentsPage() {
  const supabase = createClient()
  const [shipments, setShipments] = useState<ShipmentWithNames[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null)
  const perPage = 10

  useEffect(() => {
    loadShipments()
  }, [])

  async function loadShipments() {
    setLoading(true)
    const { data: shipmentsData } = await supabase
      .from('shipments')
      .select(`
        *,
        client:profiles!shipments_client_id_fkey(company_name, email),
        transporter:profiles!shipments_transporter_id_fkey(company_name, email)
      `)
      .order('created_at', { ascending: false })

    if (shipmentsData) {
      const formatted = shipmentsData.map((s: any) => ({
        ...s,
        client_name: s.client?.company_name || s.client?.email || 'Unknown',
        transporter_name: s.transporter?.company_name || s.transporter?.email || null
      }))
      setShipments(formatted)
    }
    setLoading(false)
  }

  const filtered = shipments.filter(s => {
    const matchSearch =
      (s.client_name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (s.transporter_name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      s.origin_city?.toLowerCase().includes(search.toLowerCase()) ||
      s.destination_city?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const stats = {
    total: shipments.length,
    active: shipments.filter(s => ['confirmed', 'picked_up', 'in_transit'].includes(s.status)).length,
    completed: shipments.filter(s => s.status === 'completed').length,
    disputed: shipments.filter(s => s.status === 'disputed').length,
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Shipment Management" subtitle="All transport requests on the platform" />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Total Shipments', value: stats.total, color: 'bg-blue-100 text-blue-700', icon: Package },
            { label: 'Active Shipments', value: stats.active, color: 'bg-violet-100 text-violet-700', icon: Truck },
            { label: 'Completed', value: stats.completed, color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
            { label: 'Disputed', value: stats.disputed, color: 'bg-red-100 text-red-700', icon: AlertTriangle },
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
              <CardTitle className="text-base">All Shipments</CardTitle>
              <Button variant="outline" size="sm" className="gap-2 self-start">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input placeholder="Search by ID, client, transporter, route..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
              </div>
              <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Transporter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Container</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map(s => {
                    const cfg = statusConfig[s.status]
                    const StatusIcon = cfg.icon
                    return (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-gray-600">{s.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900 text-xs">{s.client_name}</p>
                        </td>
                        <td className="px-6 py-4">
                          {s.transporter_name ? (
                            <p className="text-xs text-gray-700">{s.transporter_name}</p>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium text-gray-900">{s.origin_city}, {s.origin_country}</span>
                            <span className="text-xs text-gray-400">→ {s.destination_city}, {s.destination_country}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-gray-700">{containerLabels[s.container_type] || s.container_type}</span>
                          <p className="text-xs text-gray-400">{s.cargo_weight}t</p>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">{formatDate(s.pickup_date)}</td>
                        <td className="px-6 py-4">
                          {s.agreed_price ? (
                            <div>
                              <p className="text-xs font-semibold text-gray-900">{formatCurrency(s.agreed_price)}</p>
                              <p className="text-xs text-gray-400">Fee: {formatCurrency(s.agreed_price * 0.03)}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={cfg.variant} className="gap-1 text-xs">
                            <StatusIcon className="h-3 w-3" />
                            {cfg.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => {
                              setSelectedShipmentId(s.id)
                              setShowDetails(true)
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Loader2 className="h-10 w-10 mb-3 animate-spin" />
                <p className="text-sm font-medium">Loading shipments...</p>
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Package className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No shipments found</p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-xs text-gray-500">
                {filtered.length === 0 ? '0' : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)}`} of {filtered.length} shipments
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

      {showDetails && selectedShipmentId && (
        <ShipmentDetailsModal
          shipmentId={selectedShipmentId}
          onClose={() => {
            setShowDetails(false)
            setSelectedShipmentId(null)
          }}
          onUpdate={loadShipments}
        />
      )}
    </div>
  )
}
