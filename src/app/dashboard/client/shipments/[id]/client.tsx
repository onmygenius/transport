'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClientHeader } from '@/components/client/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Star, ArrowLeft, Package, MapPin, Calendar, Weight } from 'lucide-react'
import Link from 'next/link'
import { acceptOffer, rejectOffer } from '@/lib/actions/offers'
import { ShipmentDocuments } from '@/components/shipment-documents'
import type { ShipmentDocument } from '@/lib/types'

interface Transporter {
  id: string
  company_name: string | null
  full_name: string | null
  company_country: string | null
  kyc_status: string
}

interface Offer {
  id: string
  price: number
  currency: string
  estimated_days: number
  available_from: string
  message: string | null
  valid_until: string
  status: string
  transporter: Transporter
}

interface Shipment {
  id: string
  origin_city: string
  origin_country: string
  destination_city: string
  destination_country: string
  container_type: string
  container_count: number
  cargo_weight: number
  cargo_type: string
  transport_type: string
  pickup_date: string
  delivery_date: string | null
  budget: number | null
  budget_visible: boolean
  special_instructions: string | null
  status: string
  agreed_price: number | null
  offers: Offer[]
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

export default function ShipmentDetailClient({ shipment, initialDocuments = [] }: { shipment: Shipment; initialDocuments?: ShipmentDocument[] }) {
  const router = useRouter()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pendingOffers = shipment.offers.filter(o => o.status === 'pending').sort((a, b) => a.price - b.price)
  const cfg = statusConfig[shipment.status] ?? { label: shipment.status, variant: 'secondary' as const }

  const handleAccept = async (offerId: string) => {
    setActionLoading(offerId)
    setError(null)
    const result = await acceptOffer(offerId, shipment.id)
    setActionLoading(null)
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || 'Failed to accept offer')
    }
  }

  const handleReject = async (offerId: string) => {
    setActionLoading(`reject-${offerId}`)
    setError(null)
    const result = await rejectOffer(offerId)
    setActionLoading(null)
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || 'Failed to reject offer')
    }
  }

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <ClientHeader title="Shipment Details" subtitle={`ID: ${shipment.id.slice(0, 8)}…`} />

      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/client/shipments">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Shipments
            </Button>
          </Link>
          <Badge variant={cfg.variant} className="text-sm px-3 py-1">{cfg.label}</Badge>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Route</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Origin</p>
                    <p className="text-sm font-semibold text-gray-900">{shipment.origin_city}, {shipment.origin_country}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Destination</p>
                    <p className="text-sm font-semibold text-gray-900">{shipment.destination_city}, {shipment.destination_country}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Pickup Date</p>
                    <p className="text-sm font-semibold text-gray-900">{shipment.pickup_date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Cargo</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Container</span>
                  <span className="font-medium">{shipment.container_type} × {shipment.container_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Weight</span>
                  <span className="font-medium">{shipment.cargo_weight}t</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cargo Type</span>
                  <span className="font-medium capitalize">{shipment.cargo_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Transport</span>
                  <span className="font-medium uppercase">{shipment.transport_type}</span>
                </div>
                {shipment.budget && shipment.budget_visible && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Budget</span>
                    <span className="font-semibold text-emerald-600">€{shipment.budget.toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {shipment.agreed_price && (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-4">
                  <p className="text-xs text-emerald-600 font-medium">Agreed Price</p>
                  <p className="text-2xl font-bold text-emerald-700">€{shipment.agreed_price.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 mt-1">Payment settled directly between parties</p>
                </CardContent>
              </Card>
            )}

            {shipment.special_instructions && (
              <Card>
                <CardHeader><CardTitle className="text-base">Instructions</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{shipment.special_instructions}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Offers Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {shipment.status === 'confirmed' || shipment.status === 'in_transit' || shipment.status === 'delivered' || shipment.status === 'completed'
                    ? 'Offers accepted'
                    : pendingOffers.length > 0
                    ? `Offers (${pendingOffers.length}) — sorted by price`
                    : 'Offers'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {pendingOffers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Package className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-sm font-medium">
                      {shipment.status === 'confirmed' || shipment.status === 'completed'
                        ? 'Offer accepted. Shipment is in progress.'
                        : 'No offers yet. Transporters will submit offers soon.'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {pendingOffers.map((offer, i) => {
                      const name = offer.transporter.company_name || offer.transporter.full_name || 'Unknown'
                      const isLoading = actionLoading === offer.id
                      const isRejecting = actionLoading === `reject-${offer.id}`
                      return (
                        <div key={offer.id} className={`p-6 ${i === 0 ? 'bg-emerald-50' : ''}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${i === 0 ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                                {i + 1}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900">{name}</p>
                                  {offer.transporter.kyc_status === 'approved' && (
                                    <CheckCircle className="h-3.5 w-3.5 text-blue-500" />
                                  )}
                                  <span className="text-xs text-gray-400">{offer.transporter.company_country}</span>
                                </div>
                                <p className="text-xs text-gray-500">{offer.estimated_days} days delivery · Available from {offer.available_from}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-900">€{offer.price.toLocaleString()}</p>
                              <p className="text-xs text-gray-400">Valid until {offer.valid_until.slice(0, 10)}</p>
                            </div>
                          </div>

                          {offer.message && (
                            <p className="text-sm text-gray-600 bg-white rounded-lg p-3 mb-3 border border-gray-100">{offer.message}</p>
                          )}

                          {['pending', 'offer_received'].includes(shipment.status) && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                                disabled={isLoading || isRejecting}
                                onClick={() => handleAccept(offer.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                                {isLoading ? 'Accepting…' : 'Accept Offer'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 text-red-500 border-red-200 hover:bg-red-50"
                                disabled={isLoading || isRejecting}
                                onClick={() => handleReject(offer.id)}
                              >
                                <XCircle className="h-4 w-4" />
                                {isRejecting ? 'Rejecting…' : 'Reject'}
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents Section */}
            <ShipmentDocuments
              shipmentId={shipment.id}
              userRole="client"
              canUpload={true}
              initialDocuments={initialDocuments}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
