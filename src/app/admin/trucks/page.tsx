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
  Search, Download, Truck, CheckCircle, Clock,
  XCircle, Eye, ChevronLeft, ChevronRight, MapPin, AlertTriangle
} from 'lucide-react'

const mockTrucks = [
  { id: 'TRK-001', company: 'Trans Cargo SRL', country: 'RO', plate: 'B-123-TRK', type: '40ft', location: 'Bucharest, RO', availableFrom: '2026-02-22', availableTo: '2026-03-05', status: 'available', verified: true, posted: '2026-02-20' },
  { id: 'TRK-002', company: 'Fast Logistics SA', country: 'FR', plate: 'FR-456-LOG', type: 'reefer_40ft', location: 'Lyon, FR', availableFrom: '2026-02-23', availableTo: '2026-03-10', status: 'available', verified: true, posted: '2026-02-19' },
  { id: 'TRK-003', company: 'Iberian Cargo SL', country: 'ES', plate: 'ES-789-CAR', type: '20ft', location: 'Madrid, ES', availableFrom: '2026-02-21', availableTo: '2026-02-28', status: 'booked', verified: true, posted: '2026-02-18' },
  { id: 'TRK-004', company: 'Balkan Transport DOO', country: 'RS', plate: 'RS-321-TRP', type: '40ft_hc', location: 'Belgrade, RS', availableFrom: '2026-02-25', availableTo: '2026-03-15', status: 'available', verified: false, posted: '2026-02-18' },
  { id: 'TRK-005', company: 'Alpine Logistics AG', country: 'CH', plate: 'CH-654-ALP', type: '20ft', location: 'Zurich, CH', availableFrom: '2026-02-20', availableTo: '2026-02-25', status: 'expired', verified: true, posted: '2026-02-15' },
  { id: 'TRK-006', company: 'Vistula Trans SP', country: 'PL', plate: 'PL-987-VIS', type: '40ft', location: 'Warsaw, PL', availableFrom: '2026-02-26', availableTo: '2026-03-08', status: 'available', verified: true, posted: '2026-02-17' },
  { id: 'TRK-007', company: 'Trans Cargo SRL', country: 'RO', plate: 'B-456-TRK', type: 'reefer_20ft', location: 'Cluj-Napoca, RO', availableFrom: '2026-02-24', availableTo: '2026-03-03', status: 'available', verified: true, posted: '2026-02-16' },
  { id: 'TRK-008', company: 'Fast Logistics SA', country: 'FR', plate: 'FR-111-LOG', type: '40ft', location: 'Paris, FR', availableFrom: '2026-02-22', availableTo: '2026-03-01', status: 'flagged', verified: true, posted: '2026-02-14' },
]

const statusConfig: Record<string, { label: string; variant: 'success' | 'default' | 'secondary' | 'destructive' | 'warning' }> = {
  available: { label: 'Available', variant: 'success' },
  booked: { label: 'Booked', variant: 'default' },
  expired: { label: 'Expired', variant: 'secondary' },
  flagged: { label: 'Flagged', variant: 'destructive' },
}

const containerLabels: Record<string, string> = {
  '20ft': '20ft Standard',
  '40ft': '40ft Standard',
  '40ft_hc': '40ft High Cube',
  'reefer_20ft': 'Reefer 20ft',
  'reefer_40ft': 'Reefer 40ft',
}

export default function TrucksPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const perPage = 10

  const filtered = mockTrucks.filter(t => {
    const matchSearch =
      t.company.toLowerCase().includes(search.toLowerCase()) ||
      t.plate.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    const matchType = typeFilter === 'all' || t.type === typeFilter
    return matchSearch && matchStatus && matchType
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const stats = {
    total: mockTrucks.length,
    available: mockTrucks.filter(t => t.status === 'available').length,
    booked: mockTrucks.filter(t => t.status === 'booked').length,
    flagged: mockTrucks.filter(t => t.status === 'flagged').length,
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Truck Management" subtitle="All truck availability posts on the platform" />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Total Posts', value: stats.total, color: 'bg-blue-100 text-blue-700', icon: Truck },
            { label: 'Available', value: stats.available, color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
            { label: 'Booked', value: stats.booked, color: 'bg-violet-100 text-violet-700', icon: Clock },
            { label: 'Flagged', value: stats.flagged, color: 'bg-red-100 text-red-700', icon: AlertTriangle },
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
              <CardTitle className="text-base">All Truck Posts</CardTitle>
              <Button variant="outline" size="sm" className="gap-2 self-start">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by company, plate, location..."
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
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1) }}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Container type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="20ft">20ft Standard</SelectItem>
                  <SelectItem value="40ft">40ft Standard</SelectItem>
                  <SelectItem value="40ft_hc">40ft High Cube</SelectItem>
                  <SelectItem value="reefer_20ft">Reefer 20ft</SelectItem>
                  <SelectItem value="reefer_40ft">Reefer 40ft</SelectItem>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Plate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Container</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Available</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map(truck => {
                    const cfg = statusConfig[truck.status]
                    return (
                      <tr key={truck.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-gray-600">{truck.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{truck.company}</p>
                            {truck.verified && (
                              <CheckCircle className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{truck.country}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                            {truck.plate}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-700">
                          {containerLabels[truck.type] || truck.type}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                            {truck.location}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-gray-700">{formatDate(truck.availableFrom)}</p>
                          <p className="text-xs text-gray-400">→ {formatDate(truck.availableTo)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="View details">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {truck.status === 'flagged' && (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50">
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
                <Truck className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No truck posts found</p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-xs text-gray-500">
                {filtered.length === 0 ? '0' : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)}`} of {filtered.length} posts
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
