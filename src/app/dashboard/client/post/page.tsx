'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClientHeader } from '@/components/client/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Package, Loader2 } from 'lucide-react'
import { createShipment } from '@/lib/actions/shipments'
import type { ContainerType, CargoType, TransportType } from '@/lib/types'

export default function PostShipmentPage() {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [budgetVisible, setBudgetVisible] = useState(true)

  const [form, setForm] = useState({
    origin_city: '',
    origin_country: '',
    origin_address: '',
    destination_city: '',
    destination_country: '',
    destination_address: '',
    container_type: '' as ContainerType,
    container_count: 1,
    cargo_weight: '',
    cargo_type: 'general' as CargoType,
    transport_type: 'fcl' as TransportType,
    pickup_date: '',
    delivery_date: '',
    budget: '',
    currency: 'EUR',
    special_instructions: '',
  })

  const set = (field: string, value: string | number | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    setError(null)
    if (!form.origin_city || !form.origin_country || !form.destination_city || !form.destination_country) {
      setError('Please fill in origin and destination fields.')
      return
    }
    if (!form.container_type) { setError('Please select a container type.'); return }
    if (!form.cargo_weight) { setError('Please enter cargo weight.'); return }
    if (!form.pickup_date) { setError('Please select a pickup date.'); return }

    setLoading(true)
    const result = await createShipment({
      origin_city: form.origin_city,
      origin_country: form.origin_country.toUpperCase(),
      origin_address: form.origin_address || undefined,
      destination_city: form.destination_city,
      destination_country: form.destination_country.toUpperCase(),
      destination_address: form.destination_address || undefined,
      container_type: form.container_type,
      container_count: form.container_count,
      cargo_weight: parseFloat(form.cargo_weight),
      cargo_type: form.cargo_type,
      transport_type: form.transport_type,
      pickup_date: form.pickup_date,
      delivery_date: form.delivery_date || undefined,
      budget: form.budget ? parseFloat(form.budget) : undefined,
      budget_visible: budgetVisible,
      currency: form.currency,
      special_instructions: form.special_instructions || undefined,
    })
    setLoading(false)

    if (result.success) {
      setSubmitted(true)
    } else {
      setError(result.error || 'Failed to post shipment.')
    }
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
              <Button onClick={() => { setSubmitted(false); setForm({ origin_city: '', origin_country: '', origin_address: '', destination_city: '', destination_country: '', destination_address: '', container_type: '' as ContainerType, container_count: 1, cargo_weight: '', cargo_type: 'general', transport_type: 'fcl', pickup_date: '', delivery_date: '', budget: '', currency: 'EUR', special_instructions: '' }) }} variant="outline">Post Another</Button>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Route Details</CardTitle>
              <CardDescription>Where is the cargo going?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Origin City *</Label>
                  <Input placeholder="e.g. Warsaw" value={form.origin_city} onChange={e => set('origin_city', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Origin Country * (2-letter code)</Label>
                  <Input placeholder="e.g. PL" maxLength={2} value={form.origin_country} onChange={e => set('origin_country', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Origin Address (optional)</Label>
                  <Input placeholder="Street address" value={form.origin_address} onChange={e => set('origin_address', e.target.value)} />
                </div>
                <div className="space-y-2 col-start-1">
                  <Label>Destination City *</Label>
                  <Input placeholder="e.g. Rome" value={form.destination_city} onChange={e => set('destination_city', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Destination Country * (2-letter code)</Label>
                  <Input placeholder="e.g. IT" maxLength={2} value={form.destination_country} onChange={e => set('destination_country', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Destination Address (optional)</Label>
                  <Input placeholder="Street address" value={form.destination_address} onChange={e => set('destination_address', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cargo Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Container Type *</Label>
                  <Select value={form.container_type} onValueChange={v => set('container_type', v)}>
                    <SelectTrigger><SelectValue placeholder="Select container" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20ft">20ft Standard</SelectItem>
                      <SelectItem value="40ft">40ft Standard</SelectItem>
                      <SelectItem value="40ft_hc">40ft High Cube</SelectItem>
                      <SelectItem value="45ft">45ft</SelectItem>
                      <SelectItem value="reefer_20ft">Reefer 20ft</SelectItem>
                      <SelectItem value="reefer_40ft">Reefer 40ft</SelectItem>
                      <SelectItem value="open_top">Open Top</SelectItem>
                      <SelectItem value="flat_rack">Flat Rack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Containers</Label>
                  <Input type="number" min="1" value={form.container_count} onChange={e => set('container_count', parseInt(e.target.value) || 1)} />
                </div>
                <div className="space-y-2">
                  <Label>Total Cargo Weight (tons) *</Label>
                  <Input type="number" placeholder="e.g. 20" value={form.cargo_weight} onChange={e => set('cargo_weight', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Cargo Type</Label>
                  <Select value={form.cargo_type} onValueChange={v => set('cargo_type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="dangerous">Dangerous Goods</SelectItem>
                      <SelectItem value="perishable">Perishable</SelectItem>
                      <SelectItem value="oversized">Oversized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Transport Type</Label>
                  <Select value={form.transport_type} onValueChange={v => set('transport_type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fcl">FCL — Full Container Load</SelectItem>
                      <SelectItem value="lcl">LCL — Less than Container Load</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schedule & Budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pickup Date *</Label>
                  <Input type="date" value={form.pickup_date} onChange={e => set('pickup_date', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Delivery Date (optional)</Label>
                  <Input type="date" value={form.delivery_date} onChange={e => set('delivery_date', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Budget (EUR)</Label>
                  <Input type="number" placeholder="e.g. 2000" value={form.budget} onChange={e => set('budget', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Show Budget to Transporters</Label>
                  <div className="flex items-center gap-3 h-10">
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Special Instructions (optional)</Label>
                <Textarea
                  placeholder="Any special handling requirements, loading instructions, etc."
                  rows={4}
                  value={form.special_instructions}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set('special_instructions', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
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
