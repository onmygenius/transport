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
  Search, Download, Package, CheckCircle, Clock,
  Truck, XCircle, Eye, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react'

const mockShipments = [
  { id: 'SHP-1842', client: 'EuroShip GmbH', transporter: 'Trans Cargo SRL', origin: 'Bucharest, RO', destination: 'Berlin, DE', container: '40ft', weight: 24, pickup: '2026-02-22', status: 'confirmed', price: 2400, commission: 72 },
  { id: 'SHP-1841', client: 'Nordic Freight AS', transporter: null, origin: 'Oslo, NO', destination: 'Paris, FR', container: '20ft', weight: 12, pickup: '2026-02-25', status: 'pending', price: null, commission: null },
  { id: 'SHP-1840', client: 'Container Plus Ltd', transporter: 'Fast Logistics SA', origin: 'London, GB', destination: 'Madrid, ES', container: '40ft_hc', weight: 28, pickup: '2026-02-20', status: 'in_transit', price: 3200, commission: 96 },
  { id: 'SHP-1839', client: 'Nordic Freight AS', transporter: 'Balkan Transport DOO', origin: 'Stockholm, SE', destination: 'Athens, GR', container: '20ft', weight: 10, pickup: '2026-02-18', status: 'disputed', price: 1850, commission: 55 },
  { id: 'SHP-1838', client: 'Alpine Logistics AG', transporter: 'Iberian Cargo SL', origin: 'Zurich, CH', destination: 'Lisbon, PT', container: '40ft', weight: 22, pickup: '2026-02-15', status: 'completed', price: 2800, commission: 84 },
  { id: 'SHP-1837', client: 'Adriatic Shipping DOO', transporter: 'Nordic Freight AS', origin: 'Zagreb, HR', destination: 'Amsterdam, NL', container: 'reefer_40ft', weight: 18, pickup: '2026-02-14', status: 'delivered', price: 3600, commission: 108 },
  { id: 'SHP-1836', client: 'Vistula Trans SP', transporter: null, origin: 'Warsaw, PL', destination: 'Rome, IT', container: '20ft', weight: 8, pickup: '2026-02-28', status: 'pending', price: null, commission: null },
  { id: 'SHP-1835', client: 'Container Plus Ltd', transporter: 'Fast Logistics SA', origin: 'Manchester, GB', destination: 'Lyon, FR', container: '40ft_hc', weight: 30, pickup: '2026-02-17', status: 'disputed', price: 3200, commission: 96 },
  { id: 'SHP-1834', client: 'EuroShip GmbH', transporter: 'Trans Cargo SRL', origin: 'Hamburg, DE', destination: 'Warsaw, PL', container: '40ft', weight: 26, pickup: '2026-02-12', status: 'completed', price: 1900, commission: 57 },
  { id: 'SHP-1833', client: 'Nordic Freight AS', transporter: 'Alpine Logistics AG', origin: 'Oslo, NO', destination: 'Vienna, AT', container: '20ft', weight: 14, pickup: '2026-02-10', status: 'cancelled', price: 1400, commission: 0 },
]

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
  '20ft': '20ft Standard',
  '40ft': '40ft Standard',
  '40ft_hc': '40ft High Cube',
  '45ft': '45ft',
  'reefer_20ft': 'Reefer 20ft',
  'reefer_40ft': 'Reefer 40ft',
  'open_top': 'Open Top',
  'flat_rack': 'Flat Rack',
}

export default function ShipmentsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const perPage = 10

  const filtered = mockShipments.filter(s => {
    const matchSearch =
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.client.toLowerCase().includes(search.toLowerCase()) ||
      (s.transporter?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      s.origin.toLowerCase().includes(search.toLowerCase()) ||
      s.destination.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const stats = {
    total: mockShipments.length,
    active: mockShipments.filter(s => ['confirmed', 'picked_up', 'in_transit'].includes(s.status)).length,
    completed: mockShipments.filter(s => s.status === 'completed').length,
    disputed: mockShipments.filter(s => s.status === 'disputed').length,
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
                          <p className="font-medium text-gray-900 text-xs">{s.client}</p>
                        </td>
                        <td className="px-6 py-4">
                          {s.transporter ? (
                            <p className="text-xs text-gray-700">{s.transporter}</p>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium text-gray-900">{s.origin}</span>
                            <span className="text-xs text-gray-400">→ {s.destination}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-gray-700">{containerLabels[s.container] || s.container}</span>
                          <p className="text-xs text-gray-400">{s.weight}t</p>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">{formatDate(s.pickup)}</td>
                        <td className="px-6 py-4">
                          {s.price ? (
                            <div>
                              <p className="text-xs font-semibold text-gray-900">{formatCurrency(s.price)}</p>
                              {s.commission !== null && s.commission > 0 && (
                                <p className="text-xs text-gray-400">Fee: {formatCurrency(s.commission)}</p>
                              )}
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
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
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
    </div>
  )
}
