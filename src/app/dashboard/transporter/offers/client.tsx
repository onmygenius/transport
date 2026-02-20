'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Package, ChevronLeft, ChevronRight, XCircle } from 'lucide-react'
import { withdrawOffer } from '@/lib/actions/offers'

interface Shipment {
  id: string
  origin_city: string
  origin_country: string
  destination_city: string
  destination_country: string
  container_type: string
  pickup_date: string
  status: string
  client: { id: string; company_name: string | null; full_name: string | null } | null
}

interface Offer {
  id: string
  price: number
  currency: string
  estimated_days: number
  available_from: string
  valid_until: string
  status: string
  created_at: string
  shipment: Shipment | null
}

const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'destructive' | 'secondary' | 'default' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  accepted: { label: 'Accepted', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  expired: { label: 'Expired', variant: 'secondary' },
  withdrawn: { label: 'Withdrawn', variant: 'secondary' },
}

export default function TransporterOffersClient({ offers }: { offers: Offer[] }) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [withdrawing, setWithdrawing] = useState<string | null>(null)
  const perPage = 10

  const filtered = offers.filter(o => statusFilter === 'all' || o.status === statusFilter)
  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const handleWithdraw = async (offerId: string) => {
    setWithdrawing(offerId)
    await withdrawOffer(offerId)
    setWithdrawing(null)
    router.refresh()
  }

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <TransporterHeader title="My Offers" subtitle="Track all offers you have submitted" />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[
            { label: 'Total', value: offers.length, color: 'bg-gray-100 text-gray-700' },
            { label: 'Pending', value: offers.filter(o => o.status === 'pending').length, color: 'bg-amber-100 text-amber-700' },
            { label: 'Accepted', value: offers.filter(o => o.status === 'accepted').length, color: 'bg-emerald-100 text-emerald-700' },
            { label: 'Rejected', value: offers.filter(o => o.status === 'rejected').length, color: 'bg-red-100 text-red-700' },
            { label: 'Expired', value: offers.filter(o => ['expired', 'withdrawn'].includes(o.status)).length, color: 'bg-gray-100 text-gray-500' },
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">All Offers</CardTitle>
              <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Container</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Sent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Valid Until</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map(offer => {
                    const cfg = statusConfig[offer.status] ?? { label: offer.status, variant: 'secondary' as const }
                    const s = offer.shipment
                    const clientName = s?.client?.company_name || s?.client?.full_name || '—'
                    return (
                      <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{clientName}</td>
                        <td className="px-6 py-4">
                          {s ? (
                            <>
                              <p className="text-xs font-medium text-gray-900">{s.origin_city}, {s.origin_country}</p>
                              <p className="text-xs text-gray-400">→ {s.destination_city}, {s.destination_country}</p>
                            </>
                          ) : <span className="text-xs text-gray-400">—</span>}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600">{s?.container_type ?? '—'}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">€{offer.price.toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs text-gray-500">{offer.estimated_days}d</td>
                        <td className="px-6 py-4 text-xs text-gray-500">{offer.created_at.slice(0, 10)}</td>
                        <td className="px-6 py-4 text-xs text-gray-500">{offer.valid_until.slice(0, 10)}</td>
                        <td className="px-6 py-4">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          {offer.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 gap-1"
                              disabled={withdrawing === offer.id}
                              onClick={() => handleWithdraw(offer.id)}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              {withdrawing === offer.id ? 'Withdrawing…' : 'Withdraw'}
                            </Button>
                          )}
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
                  {offers.length === 0 ? 'No offers submitted yet. Browse available shipments.' : 'No offers match the selected filter.'}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-xs text-gray-500">{filtered.length} offers</p>
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
