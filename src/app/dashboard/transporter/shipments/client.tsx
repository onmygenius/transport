'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Package, ChevronLeft, ChevronRight, Send, Lock, X, Loader2, CheckCircle } from 'lucide-react'
import { createOffer } from '@/lib/actions/offers'

interface Client {
  id: string
  company_name: string | null
  full_name: string | null
  company_country: string | null
  kyc_status: string
}

interface Shipment {
  id: string
  origin_city: string
  origin_country: string
  destination_city: string
  destination_country: string
  container_type: string
  cargo_weight: number
  pickup_date: string
  budget: number | null
  budget_visible: boolean
  currency: string
  transport_type: string
  status: string
  client: Client
  offers: { count: number }[]
}

interface Props {
  shipments: Shipment[]
  myOfferShipmentIds: string[]
}

export default function TransporterShipmentsClient({ shipments, myOfferShipmentIds }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10

  const [modalShipment, setModalShipment] = useState<Shipment | null>(null)
  const [offerForm, setOfferForm] = useState({
    price: '',
    estimated_days: '',
    available_from: '',
    message: '',
    valid_hours: '48',
  })
  const [submitting, setSubmitting] = useState(false)
  const [offerError, setOfferError] = useState<string | null>(null)
  const [offerSuccess, setOfferSuccess] = useState(false)

  const myOfferSet = new Set(myOfferShipmentIds)

  const filtered = shipments.filter(s => {
    const origin = `${s.origin_city} ${s.origin_country}`
    const dest = `${s.destination_city} ${s.destination_country}`
    const client = s.client?.company_name || s.client?.full_name || ''
    return (
      origin.toLowerCase().includes(search.toLowerCase()) ||
      dest.toLowerCase().includes(search.toLowerCase()) ||
      client.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
    )
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const openModal = (s: Shipment) => {
    setModalShipment(s)
    setOfferForm({ price: '', estimated_days: '', available_from: s.pickup_date, message: '', valid_hours: '48' })
    setOfferError(null)
    setOfferSuccess(false)
  }

  const closeModal = () => {
    setModalShipment(null)
    setOfferError(null)
    setOfferSuccess(false)
  }

  const handleSubmitOffer = async () => {
    if (!modalShipment) return
    setOfferError(null)

    if (!offerForm.price || parseFloat(offerForm.price) <= 0) {
      setOfferError('Please enter a valid price.')
      return
    }
    if (!offerForm.estimated_days || parseInt(offerForm.estimated_days) <= 0) {
      setOfferError('Please enter estimated delivery days.')
      return
    }
    if (!offerForm.available_from) {
      setOfferError('Please enter your availability date.')
      return
    }

    setSubmitting(true)
    const result = await createOffer({
      shipment_id: modalShipment.id,
      price: parseFloat(offerForm.price),
      currency: 'EUR',
      estimated_days: parseInt(offerForm.estimated_days),
      available_from: offerForm.available_from,
      message: offerForm.message || undefined,
      valid_hours: parseInt(offerForm.valid_hours),
    })
    setSubmitting(false)

    if (result.success) {
      setOfferSuccess(true)
      setTimeout(() => {
        closeModal()
        router.refresh()
      }, 1500)
    } else {
      setOfferError(result.error || 'Failed to submit offer.')
    }
  }

  const offerCount = (s: Shipment) => s.offers?.[0]?.count ?? 0

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <TransporterHeader title="Available Shipments" subtitle="Browse and send offers on open transport requests" />

      <main className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Open Transport Requests ({shipments.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by client, origin, destination..."
                className="pl-9"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Pickup</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Budget</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Offers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map(s => {
                    const clientName = s.client?.company_name || s.client?.full_name || 'Unknown'
                    const alreadyOffered = myOfferSet.has(s.id)
                    const count = offerCount(s)
                    return (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{clientName}</p>
                          <p className="text-xs text-gray-400">{s.client?.company_country}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-medium text-gray-900">{s.origin_city}, {s.origin_country}</p>
                          <p className="text-xs text-gray-400">→ {s.destination_city}, {s.destination_country}</p>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600">{s.container_type} · {s.cargo_weight}t</td>
                        <td className="px-6 py-4 text-xs text-gray-500">{s.pickup_date}</td>
                        <td className="px-6 py-4">
                          {s.budget && s.budget_visible ? (
                            <span className="text-sm font-semibold text-gray-900">€{s.budget.toLocaleString()}</span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Lock className="h-3 w-3" /> Hidden
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary">{count} offer{count !== 1 ? 's' : ''}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          {alreadyOffered ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                              <CheckCircle className="h-3.5 w-3.5" /> Offered
                            </span>
                          ) : (
                            <Button size="sm" className="gap-1.5 h-8" onClick={() => openModal(s)}>
                              <Send className="h-3.5 w-3.5" />
                              Send Offer
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
                  {shipments.length === 0 ? 'No open shipments at the moment.' : 'No shipments match your search.'}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-xs text-gray-500">{filtered.length} shipments available</p>
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

      {modalShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Submit Offer</h2>
                <p className="text-xs text-gray-500">
                  {modalShipment.origin_city}, {modalShipment.origin_country} → {modalShipment.destination_city}, {modalShipment.destination_country}
                </p>
              </div>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {offerSuccess ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">Offer Submitted!</p>
                  <p className="text-sm text-gray-500 mt-1">The client will be notified of your offer.</p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Container</span>
                      <span className="font-medium">{modalShipment.container_type} · {modalShipment.cargo_weight}t</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pickup</span>
                      <span className="font-medium">{modalShipment.pickup_date}</span>
                    </div>
                    {modalShipment.budget && modalShipment.budget_visible && (
                      <div className="flex justify-between">
                        <span>Client Budget</span>
                        <span className="font-semibold text-emerald-600">€{modalShipment.budget.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {offerError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{offerError}</div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Your Price (EUR) *</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 1800"
                        value={offerForm.price}
                        onChange={e => setOfferForm(f => ({ ...f, price: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Delivery Days *</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 3"
                        min="1"
                        value={offerForm.estimated_days}
                        onChange={e => setOfferForm(f => ({ ...f, estimated_days: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Available From *</Label>
                      <Input
                        type="date"
                        value={offerForm.available_from}
                        onChange={e => setOfferForm(f => ({ ...f, available_from: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Offer Valid For</Label>
                      <Select value={offerForm.valid_hours} onValueChange={v => setOfferForm(f => ({ ...f, valid_hours: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24">24 hours</SelectItem>
                          <SelectItem value="48">48 hours</SelectItem>
                          <SelectItem value="72">72 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Message to Client (optional)</Label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                      placeholder="Any additional details about your offer..."
                      value={offerForm.message}
                      onChange={e => setOfferForm(f => ({ ...f, message: e.target.value }))}
                    />
                  </div>
                </>
              )}
            </div>

            {!offerSuccess && (
              <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
                <Button variant="outline" className="flex-1" onClick={closeModal} disabled={submitting}>
                  Cancel
                </Button>
                <Button className="flex-1 gap-2" onClick={handleSubmitOffer} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? 'Submitting…' : 'Submit Offer'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
