'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ClientHeader } from '@/components/client/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PlacesAutocomplete } from '@/components/ui/places-autocomplete'
import { PortSelect, TerminalSelect, EUROPEAN_PORTS } from '@/components/ui/port-select'
import { CheckCircle, Package, Loader2, Plus, Trash2, ArrowDown } from 'lucide-react'
import { createShipment } from '@/lib/actions/shipments'
import type { ContainerType, CargoType, TransportType } from '@/lib/types'

interface PickupStop { port: string; terminal: string; container_ref: string; seal: string; date: string; time: string }
interface Stop {
  id: string
  type: 'intermediate' | 'location'
  // For intermediate stops
  port?: string
  terminal?: string
  operation?: 'weighbridge' | 'customs'
  customsDetails?: string
  weighbridgeDetails?: string
  // For locations
  address?: string
  lat?: number
  lng?: number
  operationType?: 'loading' | 'unloading'
  // Common
  date: string
  time: string
}
interface DropStop { port: string; terminal: string; container_ref: string; seal: string; date: string; time: string }

const emptyIntermediateStop = (): Stop => ({
  id: Math.random().toString(36).slice(2),
  type: 'intermediate',
  port: '',
  terminal: '',
  operation: 'weighbridge',
  date: '',
  time: '',
  customsDetails: '',
  weighbridgeDetails: ''
})

const emptyLocation = (): Stop => ({
  id: Math.random().toString(36).slice(2),
  type: 'location',
  address: '',
  lat: undefined,
  lng: undefined,
  operationType: 'unloading',
  date: '',
  time: ''
})

export default function PostShipmentPage() {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [budgetVisible, setBudgetVisible] = useState(true)

  const [pickup, setPickup] = useState<PickupStop>({ port: '', terminal: '', container_ref: '', seal: '', date: '', time: '' })
  const [stops, setStops] = useState<Stop[]>([])
  const [drop, setDrop] = useState<DropStop>({ port: '', terminal: '', container_ref: '', seal: '', date: '', time: '' })
  const [cargo, setCargo] = useState({ container_type: '' as ContainerType, container_count: 1, container_category: '', cargo_weight: '', cargo_type: '' as CargoType, transport_type: 'fcl' as TransportType })
  const [extra, setExtra] = useState({ budget: '', currency: 'EUR', special_instructions: '' })

  const setPickupField = (field: keyof PickupStop, value: string) => setPickup(p => ({ ...p, [field]: value }))
  const setDropField = (field: keyof DropStop, value: string) => setDrop(p => ({ ...p, [field]: value }))
  const updateStop = (id: string, field: keyof Stop, value: any) => setStops(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  const updateStopAddress = (id: string, address: string, lat?: number, lng?: number) => setStops(prev => prev.map(s => s.id === id ? { ...s, address, lat, lng } : s))
  const addIntermediateStop = () => { if (stops.length < 10) setStops(p => [...p, emptyIntermediateStop()]) }
  const addLocation = () => { if (stops.length < 10) setStops(p => [...p, emptyLocation()]) }
  const removeStop = (id: string) => setStops(p => p.filter(s => s.id !== id))

  const pickupPortCode = EUROPEAN_PORTS.find(p => `${p.name}, ${p.country}` === pickup.port)?.code ?? ''
  const dropPortCode = EUROPEAN_PORTS.find(p => `${p.name}, ${p.country}` === drop.port)?.code ?? ''
  const getStopPortCode = (port: string) => EUROPEAN_PORTS.find(p => `${p.name}, ${p.country}` === port)?.code ?? ''

  const handleSubmit = async () => {
    setError(null)
    if (!pickup.port) { setError('Please enter a Pick-up port.'); return }
    if (!pickup.date) { setError('Please enter a Pick-up date.'); return }
    if (!drop.port) { setError('Please enter a Drop port.'); return }
    if (!drop.date) { setError('Please enter a Drop date.'); return }
    if (!cargo.container_type) { setError('Please select a container type.'); return }
    if (!cargo.cargo_weight) { setError('Please select cargo weight range.'); return }

    setLoading(true)
    const result = await createShipment({
      origin_city: pickup.port,
      origin_country: 'EU',
      origin_address: [pickup.terminal, pickup.container_ref, pickup.seal ? `Seal: ${pickup.seal}` : ''].filter(Boolean).join(' | ') || undefined,
      destination_city: drop.port,
      destination_country: 'EU',
      destination_address: [drop.terminal, drop.container_ref, drop.seal ? `Seal: ${drop.seal}` : ''].filter(Boolean).join(' | ') || undefined,
      container_type: cargo.container_type,
      container_count: cargo.container_count,
      cargo_weight: parseFloat(cargo.cargo_weight) || 1,
      cargo_type: (cargo.cargo_type || 'general') as CargoType,
      transport_type: cargo.transport_type,
      pickup_date: pickup.time ? `${pickup.date}T${pickup.time}` : pickup.date,
      delivery_date: drop.date ? (drop.time ? `${drop.date}T${drop.time}` : drop.date) : undefined,
      budget: extra.budget ? parseFloat(extra.budget) : undefined,
      budget_visible: budgetVisible,
      currency: extra.currency,
      special_instructions: [
        extra.special_instructions,
        cargo.cargo_weight ? `Weight: ${cargo.cargo_weight} kg` : '',
        cargo.container_category ? `Category: ${cargo.container_category}` : '',
        stops.filter(s => s.type === 'intermediate').length > 0 ? `Intermediate Stops: ${stops.filter(s => s.type === 'intermediate').map((s, i) => `${i + 1}. ${s.port} [${s.operation}${s.weighbridgeDetails ? ` - ${s.weighbridgeDetails}` : ''}${s.customsDetails ? ` - ${s.customsDetails}` : ''}] ${s.date} ${s.time}`).join(' | ')}` : '',
        stops.filter(s => s.type === 'location').length > 0 ? `Destinations: ${stops.filter(s => s.type === 'location').map((s, i) => `${i + 1}. ${s.address} [${s.operationType}] ${s.date} ${s.time}`).join(' | ')}` : '',
      ].filter(Boolean).join('\n') || undefined,
    })
    setLoading(false)
    if (result.success) setSubmitted(true)
    else setError(result.error || 'Failed to post shipment.')
  }

  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen overflow-y-auto">
        <ClientHeader title="Post Shipment" />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Shipment Posted!</h2>
            <p className="text-gray-500 mb-6">Your transport request is now live. Transporters will start sending offers shortly.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => { setSubmitted(false); setPickup({ port: '', terminal: '', container_ref: '', seal: '', date: '', time: '' }); setStops([]); setDrop({ port: '', terminal: '', container_ref: '', seal: '', date: '', time: '' }); setCargo({ container_type: '' as ContainerType, container_count: 1, container_category: '', cargo_weight: '', cargo_type: '' as CargoType, transport_type: 'fcl' }); setExtra({ budget: '', currency: 'EUR', special_instructions: '' }) }} variant="outline">Post Another</Button>
              <Button onClick={() => router.push('/dashboard/client/shipments')}>View My Shipments</Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <ClientHeader title="Post Shipment" subtitle="Create a new transport request for transporters to bid on" />

      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {/* PICK-UP */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">1</span>
                <CardTitle className="text-base">Pick-up</CardTitle>
              </div>
              <CardDescription>Where is the container being picked up?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Port *</Label>
                  <PortSelect placeholder="Select pick-up port..." value={pickup.port} onChange={v => setPickup(p => ({ ...p, port: v, terminal: '' }))} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Terminal</Label>
                  <TerminalSelect portCode={pickupPortCode} value={pickup.terminal} onChange={v => setPickupField('terminal', v)} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Container / Reference</Label>
                  <Input placeholder="e.g. ECHU1234567 or booking ref" value={pickup.container_ref} onChange={e => setPickupField('container_ref', e.target.value)} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Seal Number <span className="text-gray-400 font-normal text-xs">(optional)</span></Label>
                  <Input placeholder="e.g. SL123456" value={pickup.seal} onChange={e => setPickupField('seal', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input type="date" value={pickup.date} onChange={e => setPickupField('date', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" value={pickup.time} onChange={e => setPickupField('time', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center"><ArrowDown className="h-5 w-5 text-gray-400" /></div>

          {/* STOPS (Intermediate + Locations) - În ordinea adăugării */}
          {stops.map((stop, index) => (
            <div key={stop.id}>
              {stop.type === 'intermediate' ? (
                <Card className="border-l-4 border-l-amber-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">{index + 2}</span>
                        <CardTitle className="text-base">Intermediate Stop {index + 1}</CardTitle>
                      </div>
                      <button type="button" onClick={() => removeStop(stop.id)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                    <CardDescription>Weighbridge, loading/unloading point, or customs checkpoint</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label>Location *</Label>
                        <Input 
                          placeholder="e.g. Weighbridge Hamburg, Customs Aachen, Loading Point Berlin, etc." 
                          value={stop.port || ''} 
                          onChange={e => updateStop(stop.id, 'port', e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Stop Type *</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <button type="button" onClick={() => updateStop(stop.id, 'operation', 'weighbridge')}
                            className={`rounded-lg border py-2 text-sm font-medium transition-colors ${stop.operation === 'weighbridge' ? 'border-orange-600 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                            Weighbridge
                          </button>
                          <button type="button" onClick={() => updateStop(stop.id, 'operation', 'customs')}
                            className={`rounded-lg border py-2 text-sm font-medium transition-colors ${stop.operation === 'customs' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                            Customs
                          </button>
                        </div>
                      </div>
                      {stop.operation === 'weighbridge' && (
                        <div className="space-y-2 col-span-2">
                          <Label>Weighbridge Details <span className="text-gray-400 font-normal text-xs">(e.g. hour, reference, other details)</span></Label>
                          <Input 
                            placeholder="e.g. 14:00, Reference #12345, Driver contact, etc." 
                            value={stop.weighbridgeDetails || ''} 
                            onChange={e => updateStop(stop.id, 'weighbridgeDetails', e.target.value)} 
                          />
                        </div>
                      )}
                      {stop.operation === 'customs' && (
                        <div className="space-y-2 col-span-2">
                          <Label>Customs Details <span className="text-gray-400 font-normal text-xs">(e.g. scan, gas control, other)</span></Label>
                          <Input 
                            placeholder="e.g. X-ray scan, gas control, document check, etc." 
                            value={stop.customsDetails || ''} 
                            onChange={e => updateStop(stop.id, 'customsDetails', e.target.value)} 
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Date *</Label>
                        <Input type="date" value={stop.date} onChange={e => updateStop(stop.id, 'date', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Time</Label>
                        <Input type="time" value={stop.time} onChange={e => updateStop(stop.id, 'time', e.target.value)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-l-4 border-l-emerald-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">{index + 2}</span>
                        <CardTitle className="text-base">Location {index + 1}</CardTitle>
                      </div>
                      <button type="button" onClick={() => removeStop(stop.id)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label>Address / Location *</Label>
                        <PlacesAutocomplete
                          placeholder="e.g. Europastraße 5, Gelsenkirchen, Germany"
                          value={stop.address || ''}
                          onChange={(v, _pid, lat, lng) => updateStopAddress(stop.id, v, lat, lng)}
                          types={['geocode', 'establishment']}
                        />
                      </div>
                      {stop.lat && stop.lng && (
                        <div className="col-span-2 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                          <iframe
                            title={`map-${stop.id}`}
                            width="100%"
                            height="180"
                            style={{ border: 0, display: 'block' }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${stop.lat},${stop.lng}&zoom=14`}
                          />
                        </div>
                      )}
                      <div className="space-y-2 col-span-2">
                        <Label>Operation Type</Label>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => updateStop(stop.id, 'operationType', 'loading')}
                            className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${stop.operationType === 'loading' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                            Loading
                          </button>
                          <button type="button" onClick={() => updateStop(stop.id, 'operationType', 'unloading')}
                            className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${stop.operationType === 'unloading' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                            Unloading
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input type="date" value={stop.date} onChange={e => updateStop(stop.id, 'date', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Time</Label>
                        <Input type="time" value={stop.time} onChange={e => updateStop(stop.id, 'time', e.target.value)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="flex justify-center mt-4"><ArrowDown className="h-5 w-5 text-gray-400" /></div>
            </div>
          ))}

          {/* BUTTONS ROW: Add Intermediate Stop + Add Location - MEREU JOS */}
          <div className="grid grid-cols-2 gap-4">
            {stops.length < 10 && (
              <button type="button" onClick={addIntermediateStop}
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-amber-300 py-3 text-sm text-amber-600 hover:border-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-colors">
                <Plus className="h-4 w-4" /> Add intermediate stop
              </button>
            )}
            {stops.length < 10 && (
              <button type="button" onClick={addLocation}
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-emerald-300 py-3 text-sm text-emerald-600 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors">
                <Plus className="h-4 w-4" /> Add location
              </button>
            )}
          </div>
          <div className="flex justify-center"><ArrowDown className="h-5 w-5 text-gray-400" /></div>

          {/* DROP */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">{stops.length + 2}</span>
                <CardTitle className="text-base">Drop Container</CardTitle>
              </div>
              <CardDescription>Where is the container being dropped off?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Port *</Label>
                  <PortSelect placeholder="Select drop port..." value={drop.port} onChange={v => setDrop(p => ({ ...p, port: v, terminal: '' }))} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Terminal</Label>
                  <TerminalSelect portCode={dropPortCode} value={drop.terminal} onChange={v => setDropField('terminal', v)} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Container / Reference</Label>
                  <Input placeholder="e.g. ECHU1234567 or booking ref" value={drop.container_ref} onChange={e => setDropField('container_ref', e.target.value)} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Seal Number <span className="text-gray-400 font-normal text-xs">(optional)</span></Label>
                  <Input placeholder="e.g. SL123456" value={drop.seal} onChange={e => setDropField('seal', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input type="date" value={drop.date} onChange={e => setDropField('date', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" value={drop.time} onChange={e => setDropField('time', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARGO */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cargo Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Container Size *</Label>
                  <Select value={cargo.container_type} onValueChange={v => setCargo(p => ({ ...p, container_type: v as ContainerType }))}>
                    <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20ft">20 FT Standard</SelectItem>
                      <SelectItem value="40ft">40 FT Standard</SelectItem>
                      <SelectItem value="40ft_hc">40 FT High Cube</SelectItem>
                      <SelectItem value="45ft">45 FT High Cube</SelectItem>
                      <SelectItem value="reefer_20ft">20 FT Reefer</SelectItem>
                      <SelectItem value="reefer_40ft">40 FT Reefer</SelectItem>
                      <SelectItem value="open_top">Open Top</SelectItem>
                      <SelectItem value="flat_rack">Flat Rack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Containers</Label>
                  <Input type="number" min="1" value={cargo.container_count} onChange={e => setCargo(p => ({ ...p, container_count: parseInt(e.target.value) || 1 }))} />
                </div>
                <div className="space-y-2">
                  <Label>Container Category</Label>
                  <Select value={cargo.container_category} onValueChange={v => setCargo(p => ({ ...p, container_category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high_cube">High Cube (HC)</SelectItem>
                      <SelectItem value="hc_dry">HC Dry</SelectItem>
                      <SelectItem value="reefer">Reefer</SelectItem>
                      <SelectItem value="hc_reefer">HC Reefer</SelectItem>
                      <SelectItem value="tank">Tank</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cargo Weight (kg) *</Label>
                  <Select value={cargo.cargo_weight} onValueChange={v => setCargo(p => ({ ...p, cargo_weight: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select weight range" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5000">1 – 5,000 kg</SelectItem>
                      <SelectItem value="5000-10000">5,000 – 10,000 kg</SelectItem>
                      <SelectItem value="10000-20000">10,000 – 20,000 kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cargo Type</Label>
                  <Select value={cargo.cargo_type} onValueChange={v => setCargo(p => ({ ...p, cargo_type: v as CargoType }))}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Cargo</SelectItem>
                      <SelectItem value="dangerous">Dangerous Goods</SelectItem>
                      <SelectItem value="perishable">Perishable (temperature controlled)</SelectItem>
                      <SelectItem value="oversized">Oversized / Heavy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Transport Type</Label>
                  <Select value={cargo.transport_type} onValueChange={v => setCargo(p => ({ ...p, transport_type: v as TransportType }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fcl">FCL (Full Container Load)</SelectItem>
                      <SelectItem value="lcl">LCL (Less than Container Load)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BUDGET & NOTES */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Budget & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estimated Budget (EUR)</Label>
                  <Input type="number" placeholder="e.g. 2000" value={extra.budget} onChange={e => setExtra(p => ({ ...p, budget: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Show Budget to Transporters</Label>
                  <div className="flex items-center gap-3 h-9">
                    <button
                      type="button"
                      onClick={() => setBudgetVisible(!budgetVisible)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${budgetVisible ? 'bg-emerald-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${budgetVisible ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm text-gray-600">{budgetVisible ? 'Visible' : 'Hidden'}</span>
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Special Instructions (optional)</Label>
                  <Textarea
                    placeholder="Shipping line, cargo description, driver need to speak english, other relevant details, etc."
                    rows={3}
                    value={extra.special_instructions}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setExtra(p => ({ ...p, special_instructions: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end pb-8">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading} className="gap-2 px-8">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
              {loading ? 'Posting...' : 'Post Shipment'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
