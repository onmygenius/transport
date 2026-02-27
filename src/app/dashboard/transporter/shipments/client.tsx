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
import { Search, Package, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, Truck, Building2, Lock, X, Loader2, CheckCircle, Info, Heart, Flag, FlagTriangleRight } from 'lucide-react'
import { createOffer } from '@/lib/actions/offers'
import Link from 'next/link'

// Helper functions pentru parsing special_instructions
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
}

function parseStops(instructions: string | null): Stop[] {
  if (!instructions) return []
  const match = instructions.match(/Intermediate Stops:\s*([\s\S]+?)(?=\n|Destinations:|$)/)
  if (!match) return []
  
  const stopsStr = match[1]
  const stopMatches = stopsStr.matchAll(/(\d+)\.\s*([^\[]+)\s*\[([^\]]+)\]\s*([\d-]+)\s*([\d:]+)/g)
  
  const stops: Stop[] = []
  for (const m of stopMatches) {
    stops.push({
      address: m[2].trim(),
      operation: m[3].trim() as 'loading' | 'unloading',
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
      operation: m[3].trim() as 'loading' | 'unloading',
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
  myOfferShipmentIds: string[]
}

export default function TransporterShipmentsClient({ shipments, myOfferShipmentIds }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10
  
  // Filter states
  const [originFilter, setOriginFilter] = useState('')
  const [destinationFilter, setDestinationFilter] = useState('')
  const [availableFromFilter, setAvailableFromFilter] = useState('')
  const [containerTypeFilter, setContainerTypeFilter] = useState('')
  const [shippingTypeFilter, setShippingTypeFilter] = useState('')

  const [modalShipment, setModalShipment] = useState<Shipment | null>(null)
  const [offerForm, setOfferForm] = useState({
    estimated_days: '',
    available_from: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [offerError, setOfferError] = useState<string | null>(null)
  const [offerSuccess, setOfferSuccess] = useState(false)
  const [acceptedShipmentIds, setAcceptedShipmentIds] = useState<string[]>(myOfferShipmentIds)

  const myOfferSet = new Set(acceptedShipmentIds)

  const filtered = shipments.filter(s => {
    const origin = `${s.origin_city} ${s.origin_country}`
    const dest = `${s.destination_city} ${s.destination_country}`
    const client = s.client?.company_name || s.client?.full_name || ''
    
    // Search filter
    const matchesSearch = (
      origin.toLowerCase().includes(search.toLowerCase()) ||
      dest.toLowerCase().includes(search.toLowerCase()) ||
      client.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
    )
    
    // Origin filter
    const matchesOrigin = !originFilter || s.origin_city.toLowerCase().includes(originFilter.toLowerCase())
    
    // Destination filter
    const matchesDestination = !destinationFilter || s.destination_city.toLowerCase().includes(destinationFilter.toLowerCase())
    
    // Available From filter (pickup_date >= selected date)
    const matchesAvailableFrom = !availableFromFilter || s.pickup_date >= availableFromFilter
    
    // Container Type filter
    const matchesContainerType = !containerTypeFilter || containerTypeFilter === 'all' || s.container_type === containerTypeFilter
    
    // Shipping Type filter
    const matchesShippingType = !shippingTypeFilter || shippingTypeFilter === 'all' || s.transport_type === shippingTypeFilter
    
    return matchesSearch && matchesOrigin && matchesDestination && matchesAvailableFrom && matchesContainerType && matchesShippingType
  })

  const totalPages = Math.ceil(filtered.length / perPage)
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

  const offerCount = (s: Shipment) => s.offers?.[0]?.count ?? 0

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <TransporterHeader title="Available Shipments" subtitle="Browse and send offers on open transport requests" />

      <main className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-base">Available Shipments ({shipments.length})</CardTitle>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Sort by</span>
                <Select defaultValue="relevance">
                  <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by client, origin, destination..."
                className="pl-9"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-5 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Origin</Label>
                <Input
                  placeholder="Rotterdam, NL"
                  value={originFilter}
                  onChange={e => { setOriginFilter(e.target.value); setPage(1) }}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Destination</Label>
                <Input
                  placeholder="Hamburg, DE"
                  value={destinationFilter}
                  onChange={e => { setDestinationFilter(e.target.value); setPage(1) }}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Available From</Label>
                <Input
                  type="date"
                  value={availableFromFilter}
                  onChange={e => { setAvailableFromFilter(e.target.value); setPage(1) }}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Container Type</Label>
                <Select value={containerTypeFilter} onValueChange={v => { setContainerTypeFilter(v); setPage(1) }}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="20ft">20 FT</SelectItem>
                    <SelectItem value="40ft">40 FT</SelectItem>
                    <SelectItem value="40ft_hc">40 FT HC</SelectItem>
                    <SelectItem value="45ft">45 FT</SelectItem>
                    <SelectItem value="reefer_20ft">20 FT Reefer</SelectItem>
                    <SelectItem value="reefer_40ft">40 FT Reefer</SelectItem>
                    <SelectItem value="open_top">Open Top</SelectItem>
                    <SelectItem value="flat_rack">Flat Rack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Shipping Type</Label>
                <Select value={shippingTypeFilter} onValueChange={v => { setShippingTypeFilter(v); setPage(1) }}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="FCL (Full Container Load)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="fcl">FCL (Full Container Load)</SelectItem>
                    <SelectItem value="lcl">LCL (Less than Container Load)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-12"></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Shipment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Details</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Locations</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">From - until</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map(s => {
                    const alreadyOffered = myOfferSet.has(s.id)
                    const weight = parseWeight(s.special_instructions)
                    const category = parseCategory(s.special_instructions)
                    const stops = parseStops(s.special_instructions)
                    const destinations = parseDestinations(s.special_instructions)
                    const pickupTerminal = s.origin_address?.split(' | ')[0] || ''
                    const dropTerminal = s.destination_address?.split(' | ')[0] || ''
                    
                    return (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <button className="text-gray-300 hover:text-red-500 transition-colors">
                            <Heart className="h-4 w-4" />
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <Link href={`/dashboard/transporter/shipments/${s.id}`} className="text-sm font-bold text-cyan-600 hover:text-cyan-700 hover:underline">
                            {s.id.slice(0, 8)}
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            <Badge variant="secondary" className="text-xs">{s.container_type}</Badge>
                            {category && <Badge variant="secondary" className="text-xs">{category}</Badge>}
                            {s.transport_type === 'fcl' && <Badge variant="default" className="text-xs bg-emerald-100 text-emerald-700">Full</Badge>}
                            {s.transport_type === 'lcl' && <Badge variant="default" className="text-xs bg-blue-100 text-blue-700">Empty</Badge>}
                            {s.cargo_type === 'dangerous' && <Badge variant="destructive" className="text-xs">Dangerous</Badge>}
                            {s.cargo_type === 'reefer' && <Badge variant="destructive" className="text-xs">Reefer</Badge>}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-0.5 text-xs">
                            <div className="flex items-center gap-2">
                              <FlagTriangleRight className="h-3.5 w-3.5 text-gray-900 shrink-0" />
                              <span className="font-medium text-gray-900">{s.origin_city}</span>
                            </div>
                            {pickupTerminal && (
                              <div className="flex items-center gap-2 pl-5">
                                <Building2 className="h-3 w-3 text-cyan-400 shrink-0" />
                                <span className="text-gray-500">{pickupTerminal}</span>
                              </div>
                            )}
                            {stops.map((stop, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Truck className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                                <span className="text-gray-600">{stop.address}</span>
                              </div>
                            ))}
                            {destinations.map((dest, idx) => (
                              <div key={`dest-${idx}`} className="flex items-center gap-2">
                                <Truck className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                                <span className="text-gray-600">{dest.address}</span>
                              </div>
                            ))}
                            <div className="flex items-center gap-2">
                              <Flag className="h-3.5 w-3.5 text-red-500 shrink-0" />
                              <span className="font-medium text-gray-900">{s.destination_city}</span>
                            </div>
                            {dropTerminal && (
                              <div className="flex items-center gap-2 pl-5">
                                <Building2 className="h-3 w-3 text-cyan-400 shrink-0" />
                                <span className="text-gray-500">{dropTerminal}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-xs space-y-0.5">
                            <div className="text-gray-500">{s.pickup_date.split('T')[0]}</div>
                            {s.delivery_date && (
                              <div className="font-semibold text-gray-900">{s.delivery_date.split('T')[0]}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {s.budget && s.budget_visible ? (
                            <span className="text-sm font-bold text-gray-900">€{s.budget.toLocaleString()}</span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Lock className="h-3 w-3" />
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-1.5">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="View details">
                              <Info className="h-4 w-4" />
                            </Button>
                            {alreadyOffered ? (
                              <Badge variant="default" className="bg-emerald-100 text-emerald-700 text-xs px-3">
                                <CheckCircle className="h-3 w-3 mr-1" /> Accepted
                              </Badge>
                            ) : (
                              <Button size="sm" className="gap-1.5 h-8 bg-cyan-500 hover:bg-cyan-600" onClick={() => openModal(s)}>
                                Accept
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
                <h2 className="text-base font-bold text-gray-900">Accept Shipment</h2>
                <p className="text-xs text-gray-500">
                  {modalShipment.origin_city} → {modalShipment.destination_city}
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
                  <p className="text-lg font-bold text-gray-900">Shipment Accepted!</p>
                  <p className="text-sm text-gray-500 mt-1">The client will review your acceptance.</p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Container</span>
                      <span className="font-medium">{modalShipment.container_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pickup</span>
                      <span className="font-medium">{modalShipment.pickup_date.split('T')[0]}</span>
                    </div>
                    {modalShipment.delivery_date && (
                      <div className="flex justify-between">
                        <span>Delivery</span>
                        <span className="font-medium">{modalShipment.delivery_date.split('T')[0]}</span>
                      </div>
                    )}
                    {modalShipment.budget && modalShipment.budget_visible && (
                      <div className="flex justify-between">
                        <span>Price</span>
                        <span className="font-semibold text-emerald-600">€{modalShipment.budget.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {offerError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{offerError}</div>
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

            {!offerSuccess && (
              <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
                <Button variant="outline" className="flex-1" onClick={closeModal} disabled={submitting}>
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
