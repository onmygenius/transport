'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Heart, ArrowRight, Building2, MapPin, Calendar, Euro, Truck, Package, X, Loader2, CheckCircle, ChevronDown, Filter, Flag } from 'lucide-react'
import { createOffer } from '@/lib/actions/offers'
import Link from 'next/link'

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

interface Stop {
  address: string
  operation: 'loading' | 'unloading'
  date: string
  time: string
  type?: 'intermediate' | 'destination'
}

function parseRouteStops(instructions: string | null): Stop[] {
  if (!instructions) return []
  
  const newMatch = instructions.match(/Route Stops:\s*([\s\S]+?)(?=\n|$)/)
  if (newMatch) {
    const stopsText = newMatch[1]
    const stops: Stop[] = []
    const stopEntries = stopsText.split('|').map(s => s.trim()).filter(s => s.length > 0)
    
    stopEntries.forEach(entry => {
      const match = entry.match(/(\d+)\.\s*([^\[]+)\s*\[([^\]]+)\]\s*(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2}))?\s*\{(intermediate|destination)\}/)
      if (match) {
        stops.push({
          address: match[2].trim(),
          operation: match[3].trim() as 'loading' | 'unloading',
          date: match[4],
          time: match[5] || '',
          type: match[6] as 'intermediate' | 'destination'
        })
      }
    })
    
    return stops
  }
  
  return []
}

interface Client {
  id: string
  company_name: string | null
  full_name: string | null
  company_country: string | null
  kyc_status: string
}

interface Shipment {
  id: string
  display_id?: string | null
  origin_city: string
  origin_country: string
  origin_address: string | null
  destination_city: string
  destination_country: string
  destination_address: string | null
  destination_type: string | null
  container_type: string
  cargo_weight: number
  pickup_date: string
  delivery_date: string | null
  budget: number | null
  budget_visible: boolean
  currency: string
  transport_type: string
  cargo_type: string | null
  special_instructions: string | null
  status: string
  client: Client
  offers: { count: number }[]
}

interface Props {
  shipments: Shipment[]
  myOffers: Record<string, string>
}

export default function TransporterShipmentsMobile({ shipments, myOffers }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const perPage = 20
  
  const [modalShipment, setModalShipment] = useState<Shipment | null>(null)
  const [offerForm, setOfferForm] = useState({
    estimated_days: '',
    available_from: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [offerError, setOfferError] = useState<string | null>(null)
  const [offerSuccess, setOfferSuccess] = useState(false)
  const [acceptedShipmentIds, setAcceptedShipmentIds] = useState<string[]>(Object.keys(myOffers))

  const myOfferSet = new Set(acceptedShipmentIds)

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

  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const openModal = (s: Shipment) => {
    setModalShipment(s)
    setOfferForm({ estimated_days: '', available_from: s.pickup_date, message: '' })
    setOfferError(null)
    setOfferSuccess(false)
  }

  const closeModal = () => {
    setModalShipment(null)
    setOfferError(null)
    setOfferSuccess(false)
  }

  const handleAcceptShipment = async () => {
    if (!modalShipment) return
    setOfferError(null)

    if (!modalShipment.budget) {
      setOfferError('This shipment has no budget set.')
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
      price: modalShipment.budget,
      currency: modalShipment.currency,
      estimated_days: parseInt(offerForm.estimated_days),
      available_from: offerForm.available_from,
      message: offerForm.message || undefined,
      valid_hours: 48,
    })
    setSubmitting(false)

    if (result.success) {
      setOfferSuccess(true)
      setAcceptedShipmentIds(prev => [...prev, modalShipment.id])
      setTimeout(() => {
        closeModal()
        router.refresh()
      }, 1500)
    } else {
      setOfferError(result.error || 'Failed to accept shipment.')
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <TransporterHeader title="Available Shipments" subtitle={`${shipments.length} shipments`} />

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Search Bar */}
        <div className="sticky top-0 z-10 bg-gray-50 pb-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search shipments..."
              className="pl-10 bg-white"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          
          <Button 
            variant="outline" 
            className="w-full justify-between"
            onClick={() => setShowFilters(!showFilters)}
          >
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Shipment Cards */}
        <div className="space-y-3">
          {paginated.map(s => {
            const alreadyOffered = myOfferSet.has(s.id)
            const weight = parseWeight(s.special_instructions)
            const category = parseCategory(s.special_instructions)
            const allStops = parseRouteStops(s.special_instructions)
            const pickupTerminal = s.origin_address?.split(' | ')[0] || ''
            const dropInfo = s.destination_type === 'client'
              ? { address: s.destination_address?.split(' | ')[0] || '' }
              : { terminal: s.destination_address?.split(' | ')[0] || '' }
            const myStatus = myOffers[s.id]
            
            return (
              <Card key={s.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-50 to-blue-50 border-b">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-300 hover:text-red-500">
                        <Heart className="h-4 w-4" />
                      </button>
                      <Link href={`/dashboard/transporter/shipments/${s.id}`} className="text-sm font-bold text-cyan-600">
                        {s.id.slice(0, 8)}
                      </Link>
                    </div>
                    {myStatus ? (
                      <Badge variant="secondary" className={
                        myStatus === 'pending' ? 'bg-emerald-100 text-emerald-700' :
                        myStatus === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                        myStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }>
                        {myStatus === 'pending' ? '⏳ Pending' :
                         myStatus === 'accepted' ? '✓ Accepted' :
                         myStatus === 'rejected' ? '✗ Rejected' :
                         myStatus}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">Available</Badge>
                    )}
                  </div>

                  {/* Container & Type Badges */}
                  <div className="flex flex-wrap gap-1.5 p-3 border-b bg-white">
                    <Badge variant="outline" className="text-xs font-medium">{s.container_type}</Badge>
                    {category && <Badge variant="outline" className="text-xs">{category}</Badge>}
                    {s.transport_type === 'fcl' && <Badge className="text-xs bg-emerald-500">Full</Badge>}
                    {s.transport_type === 'lcl' && <Badge className="text-xs bg-blue-500">Empty</Badge>}
                    {s.cargo_type === 'dangerous' && <Badge variant="destructive" className="text-xs">Dangerous</Badge>}
                    {s.cargo_type === 'reefer' && <Badge className="text-xs bg-purple-500">Reefer</Badge>}
                  </div>

                  {/* Route */}
                  <div className="p-3 space-y-2 bg-white">
                    {/* Origin */}
                    <div className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900">{s.origin_city}</div>
                        {pickupTerminal && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <Building2 className="h-3 w-3" />
                            {pickupTerminal}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Intermediate Stops */}
                    {allStops.filter(st => st.type === 'intermediate').map((stop, idx) => (
                      <div key={`int-${idx}`} className="flex items-start gap-2 pl-6">
                        <Truck className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="text-xs text-gray-700">{stop.address}</div>
                          <div className="text-xs text-gray-500">{stop.operation}</div>
                        </div>
                      </div>
                    ))}

                    {/* Destination */}
                    <div className="flex items-start gap-2">
                      {s.destination_type === 'client' ? (
                        <MapPin className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      ) : (
                        <Flag className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900">{s.destination_city}</div>
                        {s.destination_type === 'client' ? (
                          'address' in dropInfo && dropInfo.address && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                              <Building2 className="h-3 w-3" />
                              {dropInfo.address}
                            </div>
                          )
                        ) : (
                          'terminal' in dropInfo && dropInfo.terminal && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                              <Building2 className="h-3 w-3" />
                              {dropInfo.terminal}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dates & Price */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 border-t">
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(s.pickup_date).toLocaleDateString('en-GB')}</span>
                      </div>
                      {s.delivery_date && (
                        <div className="flex items-center gap-1 text-gray-900 font-medium">
                          <ArrowRight className="h-3 w-3" />
                          <span>{new Date(s.delivery_date).toLocaleDateString('en-GB')}</span>
                        </div>
                      )}
                    </div>
                    {s.budget && s.budget_visible ? (
                      <div className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                        <Euro className="h-4 w-4" />
                        {s.budget.toLocaleString()}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">Price hidden</div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="p-3 bg-white border-t">
                    {alreadyOffered ? (
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accepted
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-cyan-500 hover:bg-cyan-600" 
                        onClick={() => openModal(s)}
                      >
                        Accept Shipment
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Package className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">
              {shipments.length === 0 ? 'No open shipments' : 'No shipments match your search'}
            </p>
          </div>
        )}

        {/* Load More */}
        {page * perPage < filtered.length && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setPage(p => p + 1)}
          >
            Load More ({filtered.length - page * perPage} remaining)
          </Button>
        )}
      </main>

      {/* Accept Modal */}
      {modalShipment && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-4 py-3 rounded-t-2xl">
              <div>
                <h2 className="text-base font-bold text-gray-900">Accept Shipment</h2>
                <p className="text-xs text-gray-500">
                  {modalShipment.origin_city} → {modalShipment.destination_city}
                </p>
              </div>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {offerSuccess ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">Shipment Accepted!</p>
                  <p className="text-sm text-gray-500 mt-1">The client will review your acceptance.</p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg bg-gray-50 p-3 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Container</span>
                      <span className="font-medium text-gray-900">{modalShipment.container_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pickup</span>
                      <span className="font-medium text-gray-900">{new Date(modalShipment.pickup_date).toLocaleDateString('en-GB')}</span>
                    </div>
                    {modalShipment.delivery_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery</span>
                        <span className="font-medium text-gray-900">{new Date(modalShipment.delivery_date).toLocaleDateString('en-GB')}</span>
                      </div>
                    )}
                    {modalShipment.budget && modalShipment.budget_visible && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price</span>
                        <span className="font-semibold text-emerald-600">€{modalShipment.budget.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {offerError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{offerError}</div>
                  )}

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-sm">Estimated Delivery Days *</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 3"
                        min="1"
                        value={offerForm.estimated_days}
                        onChange={e => setOfferForm(f => ({ ...f, estimated_days: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Available From *</Label>
                      <Input
                        type="date"
                        value={offerForm.available_from}
                        onChange={e => setOfferForm(f => ({ ...f, available_from: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Message to Client (optional)</Label>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                        placeholder="Any additional details..."
                        value={offerForm.message}
                        onChange={e => setOfferForm(f => ({ ...f, message: e.target.value }))}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {!offerSuccess && (
              <div className="sticky bottom-0 flex gap-3 border-t bg-white px-4 py-3">
                <Button variant="outline" className="flex-1" onClick={closeModal} disabled={submitting}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600" onClick={handleAcceptShipment} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  {submitting ? 'Accepting…' : 'Accept'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
