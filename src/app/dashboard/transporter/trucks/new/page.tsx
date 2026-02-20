'use client'

import { useState } from 'react'
import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, Truck } from 'lucide-react'

export default function NewTruckPage() {
  const [submitted, setSubmitted] = useState(false)

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
              <Button onClick={() => setSubmitted(false)} variant="outline">Post Another</Button>
              <Button onClick={() => window.location.href = '/dashboard/transporter/trucks'}>View My Trucks</Button>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Truck Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>License Plate</Label>
                  <Input placeholder="e.g. B-123-TRK" />
                </div>
                <div className="space-y-2">
                  <Label>Equipment Type</Label>
                  <Select>
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
                  <Label>Container Type</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select container" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20ft">20ft Standard</SelectItem>
                      <SelectItem value="40ft">40ft Standard</SelectItem>
                      <SelectItem value="40ft_hc">40ft High Cube</SelectItem>
                      <SelectItem value="reefer_20ft">Reefer 20ft</SelectItem>
                      <SelectItem value="reefer_40ft">Reefer 40ft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max Weight (tons)</Label>
                  <Input type="number" placeholder="e.g. 24" />
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
                  <Label>Current City</Label>
                  <Input placeholder="e.g. Bucharest" />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input placeholder="e.g. RO" />
                </div>
                <div className="space-y-2">
                  <Label>Available From</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Available Until</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Destination (optional)</Label>
                  <Input placeholder="Any destination" />
                </div>
                <div className="space-y-2">
                  <Label>Radius (km)</Label>
                  <Input type="number" defaultValue="200" />
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
                  <Input type="number" placeholder="e.g. 1.20" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label>Fixed Price (EUR, optional)</Label>
                  <Input type="number" placeholder="Leave empty to use per km" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
            <Button onClick={() => setSubmitted(true)} className="gap-2 px-8">
              <Truck className="h-4 w-4" />
              Post Truck
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
