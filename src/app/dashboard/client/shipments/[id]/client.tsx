'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClientHeader } from '@/components/client/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Star, ArrowLeft, Package, MapPin, Calendar, Weight, Navigation, TruckIcon, Clock } from 'lucide-react'
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

// Helper functions to parse special_instructions
function parseManualInstructions(instructions: string | null): string {
  if (!instructions) return ''
  const lines = instructions.split('\n')
  return lines[0] || ''
}

function parseWeight(instructions: string | null): string {
  if (!instructions) return ''
  const match = instructions.match(/Weight:\s*([^\n]+)/)
  return match ? match[1].trim() : ''
}

function parseCategory(instructions: string | null): string {
  if (!instructions) return ''
  const match = instructions.match(/Category:\s*([^\n]+)/)
  return match ? match[1].trim() : ''
}

interface Stop {
  number?: number
  location: string
  operation: string
  details?: string
  date: string
  time: string
  type?: 'intermediate' | 'destination'
}

function parseRouteStops(instructions: string | null): Stop[] {
  if (!instructions) return []
  
  // Try new format first: "Route Stops: ..."
  const newMatch = instructions.match(/Route Stops:\s*([\s\S]+?)(?=\n|$)/)
  if (newMatch) {
    const stopsText = newMatch[1]
    const stops: Stop[] = []
    const stopEntries = stopsText.split('|').map(s => s.trim()).filter(s => s.length > 0)
    
    stopEntries.forEach(entry => {
      const match = entry.match(/(\d+)\.\s*([^\[]+)\s*\[([^\]]+)\]\s*(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2}))?\s*\{(intermediate|destination)\}/)
      if (match) {
        stops.push({
          number: parseInt(match[1]),
          location: match[2].trim(),
          operation: match[3].trim(),
          date: match[4],
          time: match[5] || '',
          type: match[6] as 'intermediate' | 'destination'
        })
      }
    })
    
    return stops
  }
  
  // Fallback to old format for backward compatibility
  return []
}

function parseIntermediateStops(instructions: string | null): Stop[] {
  if (!instructions) return []
  const match = instructions.match(/Intermediate Stops:\s*([\s\S]+?)(?=Destinations:|$)/)
  if (!match) return []
  
  const stopsText = match[1]
  const stops: Stop[] = []
  
  const stopEntries = stopsText.split('|').map(s => s.trim()).filter(s => s.length > 0)
  
  stopEntries.forEach(entry => {
    const match = entry.match(/(\d+)\.\s*([^\[]+)\s*\[([^\]]+)\]\s*(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2}))?/)
    if (match) {
      stops.push({
        number: parseInt(match[1]),
        location: match[2].trim(),
        operation: match[3].trim(),
        date: match[4],
        time: match[5] || ''
      })
    }
  })
  
  return stops
}

function parseDestinations(instructions: string | null): Stop[] {
  if (!instructions) return []
  const match = instructions.match(/Destinations:\s*([\s\S]+?)(?=$)/)
  if (!match) return []
  
  const destText = match[1]
  const destinations: Stop[] = []
  
  // Split by pipe | to get individual destinations
  const destEntries = destText.split('|').map(d => d.trim()).filter(d => d.length > 0)
  
  destEntries.forEach(entry => {
    // Try to parse: "1. Location [Operation] 2026-02-27 12:00" or "1. Location [Operation] 2026-02-27"
    const match = entry.match(/(\d+)\.\s*([^\[]+)\s*\[([^\]]+)\]\s*(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2}))?/)
    if (match) {
      destinations.push({
        number: parseInt(match[1]),
        location: match[2].trim(),
        operation: match[3].trim(),
        date: match[4],
        time: match[5] || ''
      })
    }
  })
  
  return destinations
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
  const acceptedOffers = shipment.offers.filter(o => o.status === 'accepted')
  const cfg = statusConfig[shipment.status] ?? { label: shipment.status, variant: 'secondary' as const }
  
  // Parse special instructions
  const manualInstructions = parseManualInstructions(shipment.special_instructions)
  
  // Try new format first (Route Stops with preserved order)
  let allStops = parseRouteStops(shipment.special_instructions)
  
  // Fallback to old format if new format not found
  if (allStops.length === 0) {
    const intermediateStops = parseIntermediateStops(shipment.special_instructions)
    const destinations = parseDestinations(shipment.special_instructions)
    allStops = [
      ...intermediateStops.map(s => ({ ...s, type: 'intermediate' as const })),
      ...destinations.map(d => ({ ...d, type: 'destination' as const }))
    ]
  }

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
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Navigation className="h-4 w-4" />Route</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {/* Origin */}
                <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 shrink-0">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-emerald-600 mb-0.5">Pick-up</p>
                    <p className="text-sm font-semibold text-gray-900">{shipment.origin_city}, {shipment.origin_country}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{shipment.pickup_date}</span>
                    </div>
                  </div>
                </div>

                {/* All Stops (Intermediate + Destinations) in chronological order */}
                {allStops.map((stop, idx) => (
                  <div key={idx} className={`flex items-start gap-3 pb-3 border-b border-gray-100`}>
                    {stop.type === 'intermediate' ? (
                      <>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 shrink-0">
                          <TruckIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-blue-600 mb-0.5">Intermediate Stop {stop.number}</p>
                          <p className="text-sm font-semibold text-gray-900">{stop.location}</p>
                          {stop.operation && <p className="text-xs text-gray-600 mt-0.5">{stop.operation}</p>}
                          {stop.date && stop.time && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{stop.date} {stop.time}</span>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 shrink-0">
                          <MapPin className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-orange-600 mb-0.5">Destination {stop.number}</p>
                          <p className="text-sm font-semibold text-gray-900">{stop.location}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{stop.operation}</p>
                          {stop.date && stop.time && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{stop.date} {stop.time}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Final Destination */}
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 shrink-0">
                    <MapPin className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-red-600 mb-0.5">Drop-off</p>
                    <p className="text-sm font-semibold text-gray-900">{shipment.destination_city}, {shipment.destination_country}</p>
                    {shipment.delivery_date && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{shipment.delivery_date}</span>
                      </div>
                    )}
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

            {manualInstructions && (
              <Card>
                <CardHeader><CardTitle className="text-base">Special Instructions</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{manualInstructions}</p>
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
                {/* Show accepted offers when shipment is confirmed */}
                {['confirmed', 'in_transit', 'delivered', 'completed'].includes(shipment.status) && acceptedOffers.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {acceptedOffers.map((offer, i) => {
                      const name = offer.transporter.company_name || offer.transporter.full_name || 'Unknown'
                      return (
                        <div key={offer.id} className="p-6 bg-emerald-50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold bg-emerald-200 text-emerald-800">
                                <CheckCircle className="h-4 w-4" />
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
                              <p className="text-xl font-bold text-emerald-700">€{offer.price.toLocaleString()}</p>
                              <Badge variant="default" className="mt-1 bg-emerald-600">Accepted</Badge>
                            </div>
                          </div>

                          {offer.message && (
                            <div className="bg-white rounded-lg p-3 border border-emerald-200">
                              <p className="text-xs font-medium text-emerald-700 mb-1">Message from transporter:</p>
                              <p className="text-sm text-gray-600">{offer.message}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : pendingOffers.length === 0 ? (
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
