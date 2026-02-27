'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft, ArrowRight, Truck, Building2, Package, Calendar, 
  MapPin, Euro, CheckCircle, Clock, User, Mail, Globe, 
  X, Loader2, AlertCircle
} from 'lucide-react'
import { createOffer } from '@/lib/actions/offers'
import Link from 'next/link'
import { ShipmentRouteMap } from '@/components/ui/shipment-route-map'
import { ShipmentDocuments } from '@/components/shipment-documents'
import type { ShipmentDocument } from '@/lib/types'

// Helper functions
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  const datePart = date.toISOString().split('T')[0]
  const timePart = date.toISOString().split('T')[1].slice(0, 5)
  return `${datePart} ${timePart}`
}

function parseWeight(instructions: string | null): string {
  if (!instructions) return ''
  const match = instructions.match(/Weight:\s*([^\n]+)/)
  return match ? match[1].trim() : ''
}

function parseCategory(instructions: string | null): string {
  if (!instructions) return ''
  const match = instructions.match(/Category:\s*([^\n]+)/)
  return match ? match[1].trim().replace(/_/g, ' ') : ''
}

function parseManualInstructions(instructions: string | null): string {
  if (!instructions) return ''
  const lines = instructions.split('\n')
  return lines[0] || ''
}

interface Stop {
  address: string
  operation: 'loading' | 'unloading' | 'both'
  date: string
  time: string
}

function parseIntermediateStops(instructions: string | null): Stop[] {
  if (!instructions) return []
  const match = instructions.match(/Intermediate Stops:\s*([\s\S]+?)(?=\n|Destinations:|$)/)
  if (!match) return []
  
  const stopsStr = match[1]
  const stopMatches = stopsStr.matchAll(/(\d+)\.\s*([^\[]+)\s*\[([^\]]+)\]\s*([\d-]+)\s*([\d:]+)/g)
  
  const stops: Stop[] = []
  for (const m of stopMatches) {
    stops.push({
      address: m[2].trim(),
      operation: m[3].trim() as 'loading' | 'unloading' | 'both',
      date: m[4].trim(),
      time: m[5].trim()
    })
  }
  return stops
}

function parseDestinations(instructions: string | null): Stop[] {
  if (!instructions) return []
  const match = instructions.match(/Destinations:\s*([\s\S]+?)(?=\n|$)/)
  if (!match) return []
  
  const stopsStr = match[1]
  const stopMatches = stopsStr.matchAll(/(\d+)\.\s*([^\[]+)\s*\[([^\]]+)\]\s*([\d-]+)\s*([\d:]+)/g)
  
  const stops: Stop[] = []
  for (const m of stopMatches) {
    stops.push({
      address: m[2].trim(),
      operation: m[3].trim() as 'loading' | 'unloading' | 'both',
      date: m[4].trim(),
      time: m[5].trim()
    })
  }
  return stops
}

interface Client {
  id: string
  company_name: string | null
  full_name: string | null
  company_country: string | null
  email: string | null
  kyc_status: string
}

interface Shipment {
  id: string
  origin_city: string
  origin_country: string
  origin_address: string | null
  destination_city: string
  destination_country: string
  destination_address: string | null
  container_type: string
  container_count: number
  cargo_weight: number
  cargo_type: string | null
  transport_type: string
  pickup_date: string
  delivery_date: string | null
  budget: number | null
  budget_visible: boolean
  currency: string
  special_instructions: string | null
  status: string
  created_at: string
  client: Client
}

interface Offer {
  id: string
  status: string
  price: number
  estimated_days: number
  available_from: string
  message: string | null
  created_at: string
}

interface Props {
  shipment: Shipment
  existingOffer: Offer | null
  initialDocuments?: ShipmentDocument[]
  canViewDocuments?: boolean
}

export default function ShipmentDetailsClient({ shipment, existingOffer, initialDocuments = [], canViewDocuments = false }: Props) {
  const router = useRouter()
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [offerForm, setOfferForm] = useState({
    estimated_days: '',
    available_from: shipment.pickup_date.split('T')[0],
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const weight = parseWeight(shipment.special_instructions)
  const category = parseCategory(shipment.special_instructions)
  const intermediateStops = parseIntermediateStops(shipment.special_instructions)
  const destinations = parseDestinations(shipment.special_instructions)
  const manualInstructions = parseManualInstructions(shipment.special_instructions)
  const pickupTerminal = shipment.origin_address?.split(' | ')[0] || ''
  const pickupContainerRef = shipment.origin_address?.split(' | ')[1] || ''
  const pickupSeal = shipment.origin_address?.split(' | ')[2] || ''
  const dropTerminal = shipment.destination_address?.split(' | ')[0] || ''
  const dropContainerRef = shipment.destination_address?.split(' | ')[1] || ''
  const dropSeal = shipment.destination_address?.split(' | ')[2] || ''

  const clientName = shipment.client?.company_name || shipment.client?.full_name || 'Unknown'

  // Build locations array for map - simplified to just origin and destination
  const mapLocations = [
    {
      city: shipment.origin_city,
      country: shipment.origin_country,
      label: `Pick-up: ${shipment.origin_city}`,
      type: 'pickup' as const
    },
    {
      city: shipment.destination_city,
      country: shipment.destination_country,
      label: `Drop-off: ${shipment.destination_city}`,
      type: 'dropoff' as const
    }
  ]

  console.log('Map locations for route:', mapLocations)

  const handleAcceptShipment = async () => {
    setError(null)

    if (!shipment.budget) {
      setError('This shipment has no budget set.')
      return
    }
    if (!offerForm.estimated_days || parseInt(offerForm.estimated_days) <= 0) {
      setError('Please enter estimated delivery days.')
      return
    }
    if (!offerForm.available_from) {
      setError('Please enter your availability date.')
      return
    }

    setSubmitting(true)
    const result = await createOffer({
      shipment_id: shipment.id,
      price: shipment.budget,
      currency: shipment.currency,
      estimated_days: parseInt(offerForm.estimated_days),
      available_from: offerForm.available_from,
      message: offerForm.message || undefined,
      valid_hours: 48,
    })
    setSubmitting(false)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/transporter/shipments')
      }, 2000)
    } else {
      setError(result.error || 'Failed to accept shipment.')
    }
  }

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <TransporterHeader
        title={`Shipment ${shipment.id.slice(0, 8)}`}
        subtitle={`${shipment.origin_city} → ${shipment.destination_city}`}
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Back button */}
        <Link href="/dashboard/transporter/shipments">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Available Shipments
          </Button>
        </Link>

        {/* Status banner */}
        {existingOffer && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 flex items-center gap-4">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-800">You have accepted this shipment</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Submitted on {formatDate(existingOffer.created_at)} • Status: {existingOffer.status}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Main details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Container & Cargo Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Container & Cargo Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Container Size</p>
                    <Badge variant="secondary" className="text-sm">{shipment.container_type}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Number of Containers</p>
                    <p className="text-sm font-semibold text-gray-900">{shipment.container_count}</p>
                  </div>
                  {category && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Container Category</p>
                      <Badge variant="secondary" className="text-sm">{category}</Badge>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Transport Type</p>
                    <Badge 
                      variant="default" 
                      className={`text-sm ${shipment.transport_type === 'fcl' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}
                    >
                      {shipment.transport_type === 'fcl' ? 'Full Container' : 'Empty Container'}
                    </Badge>
                  </div>
                  {weight && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Cargo Weight</p>
                      <p className="text-sm font-semibold text-gray-900">{weight}</p>
                    </div>
                  )}
                  {shipment.cargo_type && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Cargo Type</p>
                      <Badge variant="destructive" className="text-sm">
                        {shipment.cargo_type === 'dangerous' ? 'Dangerous Goods' : 'Reefer (Temperature Controlled)'}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Route Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Route Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pick-up */}
                <div className="border-l-4 border-cyan-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="h-4 w-4 text-cyan-500" />
                    <span className="text-sm font-bold text-gray-900">Pick-up</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-medium">{shipment.origin_city}, {shipment.origin_country}</span>
                    </div>
                    {pickupTerminal && (
                      <div className="flex items-center gap-2 pl-5">
                        <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                        <span className="text-gray-600">{pickupTerminal}</span>
                      </div>
                    )}
                    {pickupContainerRef && (
                      <div className="flex items-center gap-2 pl-5">
                        <Package className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-600">Container: {pickupContainerRef}</span>
                      </div>
                    )}
                    {pickupSeal && (
                      <div className="flex items-center gap-2 pl-5">
                        <span className="text-gray-600">{pickupSeal}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pl-5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600">{formatDateTime(shipment.pickup_date)}</span>
                    </div>
                  </div>
                </div>

                {/* Intermediate stops */}
                {intermediateStops.map((stop, idx) => (
                  <div key={`intermediate-${idx}`} className="border-l-4 border-amber-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-bold text-gray-900">
                        Intermediate Stop {idx + 1} - {stop.operation === 'loading' ? 'Loading' : stop.operation === 'unloading' ? 'Unloading' : 'Loading & Unloading'}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-medium">{stop.address}</span>
                      </div>
                      <div className="flex items-center gap-2 pl-5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-600">{stop.date} {stop.time}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Destinations */}
                {destinations.map((dest, idx) => (
                  <div key={`destination-${idx}`} className="border-l-4 border-emerald-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-bold text-gray-900">
                        Destination {idx + 1} - {dest.operation === 'loading' ? 'Loading' : dest.operation === 'unloading' ? 'Unloading' : 'Loading & Unloading'}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-medium">{dest.address}</span>
                      </div>
                      <div className="flex items-center gap-2 pl-5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-600">{dest.date} {dest.time}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Drop-off */}
                <div className="border-l-4 border-cyan-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowLeft className="h-4 w-4 text-cyan-500" />
                    <span className="text-sm font-bold text-gray-900">Drop-off</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-medium">{shipment.destination_city}, {shipment.destination_country}</span>
                    </div>
                    {dropTerminal && (
                      <div className="flex items-center gap-2 pl-5">
                        <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                        <span className="text-gray-600">{dropTerminal}</span>
                      </div>
                    )}
                    {dropContainerRef && (
                      <div className="flex items-center gap-2 pl-5">
                        <Package className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-600">Container: {dropContainerRef}</span>
                      </div>
                    )}
                    {dropSeal && (
                      <div className="flex items-center gap-2 pl-5">
                        <span className="text-gray-600">{dropSeal}</span>
                      </div>
                    )}
                    {shipment.delivery_date && (
                      <div className="flex items-center gap-2 pl-5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-600">{formatDateTime(shipment.delivery_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google Maps with route */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Route Map</CardTitle>
              </CardHeader>
              <CardContent>
                <ShipmentRouteMap locations={mapLocations} />
              </CardContent>
            </Card>
          </div>

          {/* Right column - Client info & Actions */}
          <div className="space-y-6">
            {/* Price */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Price</CardTitle>
              </CardHeader>
              <CardContent>
                {shipment.budget && shipment.budget_visible ? (
                  <div className="text-center py-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Euro className="h-6 w-6 text-emerald-600" />
                      <span className="text-3xl font-bold text-gray-900">
                        {shipment.budget.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Client Budget</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Budget not visible</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{clientName}</p>
                    <p className="text-xs text-gray-500">
                      {shipment.client?.kyc_status === 'approved' && (
                        <span className="text-emerald-600">✓ Verified</span>
                      )}
                    </p>
                  </div>
                </div>
                {shipment.client?.company_country && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-gray-400 shrink-0" />
                    <p className="text-sm text-gray-600">{shipment.client.company_country}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Accept Action */}
            {!existingOffer && shipment.status === 'pending' && (
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    className="w-full gap-2 bg-cyan-500 hover:bg-cyan-600"
                    onClick={() => setShowAcceptModal(true)}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Accept Shipment
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Special Instructions */}
            {manualInstructions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Special Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{manualInstructions}</p>
                </CardContent>
              </Card>
            )}

            {/* Shipment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Shipment Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipment ID</span>
                  <span className="font-mono font-medium text-gray-900">{shipment.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Posted</span>
                  <span className="text-gray-900">{formatDate(shipment.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <Badge variant="secondary" className="text-xs">{shipment.status}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Documents Section */}
        {canViewDocuments ? (
          <ShipmentDocuments
            shipmentId={shipment.id}
            userRole="transporter"
            canUpload={canViewDocuments}
            initialDocuments={initialDocuments}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">🔒 Documents will be available after you accept this shipment</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Accept Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Accept Shipment</h2>
                <p className="text-xs text-gray-500">
                  {shipment.origin_city} → {shipment.destination_city}
                </p>
              </div>
              <button 
                onClick={() => setShowAcceptModal(false)} 
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {success ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">Shipment Accepted!</p>
                  <p className="text-sm text-gray-500 mt-1">The client will review your acceptance.</p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Container</span>
                      <span className="font-medium">{shipment.container_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pickup</span>
                      <span className="font-medium">{shipment.pickup_date.split('T')[0]}</span>
                    </div>
                    {shipment.delivery_date && (
                      <div className="flex justify-between">
                        <span>Delivery</span>
                        <span className="font-medium">{shipment.delivery_date.split('T')[0]}</span>
                      </div>
                    )}
                    {shipment.budget && shipment.budget_visible && (
                      <div className="flex justify-between">
                        <span>Price</span>
                        <span className="font-semibold text-emerald-600">€{shipment.budget.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Estimated Delivery Days *</Label>
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
                  </div>

                  <div className="space-y-2">
                    <Label>Message to Client (optional)</Label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                      placeholder="Any additional details..."
                      value={offerForm.message}
                      onChange={e => setOfferForm(f => ({ ...f, message: e.target.value }))}
                    />
                  </div>
                </>
              )}
            </div>

            {!success && (
              <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAcceptModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button className="flex-1 gap-2 bg-cyan-500 hover:bg-cyan-600" onClick={handleAcceptShipment} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {submitting ? 'Accepting…' : 'Accept Shipment'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
