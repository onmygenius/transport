'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClientHeader } from '@/components/client/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Package, ChevronLeft, ChevronRight, Eye, MessageSquare, CheckCircle, Anchor, MapPin, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { updateShipmentStatus } from '@/lib/actions/shipments'

interface Shipment {
  id: string
  origin_city: string
  origin_country: string
  origin_address: string | null
  destination_city: string
  destination_country: string
  destination_address: string | null
  container_type: string
  cargo_weight: number
  pickup_date: string
  status: string
  agreed_price: number | null
  offers: { count: number }[]
}

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'default' | 'success' | 'destructive' | 'secondary' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  offer_received: { label: 'Offer Received', variant: 'info' },
  confirmed: { label: 'Confirmed', variant: 'default' },
  picked_up: { label: 'Picked Up', variant: 'info' },
  in_transit: { label: 'In Transit', variant: 'info' },
  delivered: { label: 'Delivered', variant: 'success' },
  completed: { label: 'Completed', variant: 'success' },
  disputed: { label: 'Disputed', variant: 'destructive' },
  cancelled: { label: 'Cancelled', variant: 'secondary' },
}

export default function ClientShipmentsClient({ shipments }: { shipments: Shipment[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [confirming, setConfirming] = useState<string | null>(null)
  const perPage = 10

  const filtered = shipments.filter(s => {
    const origin = `${s.origin_city}, ${s.origin_country}`
    const dest = `${s.destination_city}, ${s.destination_country}`
    const matchSearch =
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      origin.toLowerCase().includes(search.toLowerCase()) ||
      dest.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const handleConfirmDelivery = async (shipmentId: string) => {
    setConfirming(shipmentId)
    await updateShipmentStatus(shipmentId, 'completed')
    setConfirming(null)
    router.refresh()
  }

  const offerCount = (s: Shipment) => s.offers?.[0]?.count ?? 0

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <ClientHeader title="My Shipments" subtitle="Track all your transport requests" />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[
            { label: 'Total', value: shipments.length, color: 'bg-gray-100 text-gray-700' },
            { label: 'Pending', value: shipments.filter(s => s.status === 'pending').length, color: 'bg-amber-100 text-amber-700' },
            { label: 'Active', value: shipments.filter(s => ['confirmed', 'picked_up', 'in_transit'].includes(s.status)).length, color: 'bg-blue-100 text-blue-700' },
            { label: 'Completed', value: shipments.filter(s => s.status === 'completed').length, color: 'bg-emerald-100 text-emerald-700' },
            { label: 'Disputed', value: shipments.filter(s => s.status === 'disputed').length, color: 'bg-red-100 text-red-700' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold rounded-lg py-1 ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">All Shipments</CardTitle>
              <Link href="/dashboard/client/post">
                <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Package className="h-4 w-4" />
                  Post New Shipment
                </Button>
              </Link>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by ID, origin, destination..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="offer_received">Offer Received</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Pick-up Port</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Drop Port</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Container / Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Price / Offers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map(s => {
                    const cfg = statusConfig[s.status] ?? { label: s.status, variant: 'secondary' as const }
                    const count = offerCount(s)
                    return (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-gray-600">{s.id.slice(0, 8)}…</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Anchor className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            <span className="text-xs font-medium text-gray-900">{s.origin_city}</span>
                          </div>
                          {s.origin_address && (
                            <p className="text-xs text-gray-400 mt-0.5 pl-5">{s.origin_address.split(' | ')[0]}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Anchor className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                            <span className="text-xs font-medium text-gray-900">{s.destination_city}</span>
                          </div>
                          {s.destination_address && (
                            <p className="text-xs text-gray-400 mt-0.5 pl-5">{s.destination_address.split(' | ')[0]}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-medium text-gray-900">{s.container_type} · {s.cargo_weight}t</p>
                          <p className="text-xs text-gray-400">{s.pickup_date?.slice(0, 10)}</p>
                        </td>
                        <td className="px-6 py-4">
                          {s.agreed_price
                            ? <span className="text-sm font-bold text-gray-900">€{s.agreed_price.toLocaleString()}</span>
                            : count > 0
                              ? <Link href={`/dashboard/client/shipments/${s.id}`} className="text-xs font-semibold text-blue-600 hover:underline">{count} offer{count !== 1 ? 's' : ''}</Link>
                              : <span className="text-xs text-gray-400">—</span>
                          }
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Link href={`/dashboard/client/shipments/${s.id}`}>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            {s.status === 'delivered' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                disabled={confirming === s.id}
                                onClick={() => handleConfirmDelivery(s.id)}
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                {confirming === s.id ? 'Confirming…' : 'Confirm'}
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
                <Package className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">
                  {shipments.length === 0 ? 'No shipments yet. Post your first one!' : 'No shipments match your filters.'}
                </p>
                {shipments.length === 0 && (
                  <Link href="/dashboard/client/post" className="mt-3">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Post Shipment</Button>
                  </Link>
                )}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-xs text-gray-500">{filtered.length} shipments</p>
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
