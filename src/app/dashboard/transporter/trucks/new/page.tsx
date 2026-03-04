'use client'

import { useState } from 'react'
import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, Truck, Loader2 } from 'lucide-react'
import { createTruckAvailability } from '@/lib/actions/trucks'
import { useRouter } from 'next/navigation'

export default function NewTruckPage() {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    equipment_type: '',
    max_weight: '',
    origin_city: '',
    origin_country: '',
    destination_city: '',
    destination_country: '',
    available_from: '',
    available_until: '',
    price_per_km: '',
    fixed_price: '',
    radius_km: '200'
  })

  const handleSubmit = async () => {
    if (!formData.equipment_type || !formData.origin_city || !formData.origin_country || !formData.available_from || !formData.available_until) {
      setError('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    setError(null)

    const result = await createTruckAvailability({
      equipment_type: formData.equipment_type,
      max_weight: formData.max_weight ? parseFloat(formData.max_weight) : undefined,
      origin_city: formData.origin_city,
      origin_country: formData.origin_country,
      destination_city: formData.destination_city || undefined,
      destination_country: formData.destination_country || undefined,
      available_from: formData.available_from,
      available_until: formData.available_until,
      price_per_km: formData.price_per_km ? parseFloat(formData.price_per_km) : undefined,
      fixed_price: formData.fixed_price ? parseFloat(formData.fixed_price) : undefined,
      radius_km: formData.radius_km ? parseInt(formData.radius_km) : undefined
    })

    setSubmitting(false)

    if (!result.success) {
      setError(result.error || 'Failed to post truck')
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen overflow-y-auto">
        <TransporterHeader title="Post Truck" />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Truck Posted!</h2>
            <p className="text-gray-500 mb-6">Your truck availability is now visible to clients with active subscriptions.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => { setSubmitted(false); setFormData({ equipment_type: '', max_weight: '', origin_city: '', origin_country: '', destination_city: '', destination_country: '', available_from: '', available_until: '', price_per_km: '', fixed_price: '', radius_km: '200' }); }} variant="outline">Post Another</Button>
              <Button onClick={() => router.push('/dashboard/transporter/trucks')}>View My Trucks</Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <TransporterHeader title="Post Truck Availability" subtitle="Let clients know your truck is available" />
      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Truck Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Equipment Type *</Label>
                  <Select value={formData.equipment_type} onValueChange={(v) => setFormData({...formData, equipment_type: v})}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flatbed">Flatbed</SelectItem>
                      <SelectItem value="curtainsider">Curtainsider</SelectItem>
                      <SelectItem value="reefer">Reefer</SelectItem>
                      <SelectItem value="tank">Tank</SelectItem>
                      <SelectItem value="lowbed">Lowbed</SelectItem>
                      <SelectItem value="mega_trailer">Mega Trailer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max Weight (tons) *</Label>
                  <Input type="number" placeholder="e.g. 24" value={formData.max_weight} onChange={(e) => setFormData({...formData, max_weight: e.target.value})} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Location & Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current City *</Label>
                  <Input placeholder="e.g. Rotterdam" value={formData.origin_city} onChange={(e) => setFormData({...formData, origin_city: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Input placeholder="e.g. NL" value={formData.origin_country} onChange={(e) => setFormData({...formData, origin_country: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Available From *</Label>
                  <Input type="date" value={formData.available_from} onChange={(e) => setFormData({...formData, available_from: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Available Until *</Label>
                  <Input type="date" value={formData.available_until} onChange={(e) => setFormData({...formData, available_until: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Destination City</Label>
                  <Input placeholder="e.g. Hamburg" value={formData.destination_city} onChange={(e) => setFormData({...formData, destination_city: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Destination Country</Label>
                  <Input placeholder="e.g. DE" value={formData.destination_country} onChange={(e) => setFormData({...formData, destination_country: e.target.value})} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price per km (EUR)</Label>
                  <Input type="number" placeholder="e.g. 1.20" step="0.01" value={formData.price_per_km} onChange={(e) => setFormData({...formData, price_per_km: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Fixed Price (EUR)</Label>
                  <Input type="number" placeholder="Leave empty to use per km" value={formData.fixed_price} onChange={(e) => setFormData({...formData, fixed_price: e.target.value})} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => router.back()} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2 px-8">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
              {submitting ? 'Posting...' : 'Post Truck'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
