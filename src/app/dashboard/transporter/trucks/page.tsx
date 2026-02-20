'use client'

import { useState } from 'react'
import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Truck, PlusCircle, MapPin, Calendar, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

const mockTrucks = [
  { id: 'TRK-001', plate: 'B-123-TRK', type: '40ft', location: 'Bucharest, RO', availableFrom: '2026-02-22', availableTo: '2026-03-05', status: 'available' },
  { id: 'TRK-007', plate: 'B-456-TRK', type: 'reefer_20ft', location: 'Cluj-Napoca, RO', availableFrom: '2026-02-24', availableTo: '2026-03-03', status: 'available' },
  { id: 'TRK-003', plate: 'B-789-TRK', type: '20ft', location: 'Timișoara, RO', availableFrom: '2026-02-21', availableTo: '2026-02-28', status: 'booked' },
]

const containerLabels: Record<string, string> = {
  '20ft': '20ft Standard', '40ft': '40ft Standard', '40ft_hc': '40ft High Cube',
  'reefer_20ft': 'Reefer 20ft', 'reefer_40ft': 'Reefer 40ft',
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'default' | 'secondary' }> = {
  available: { label: 'Available', variant: 'success' },
  booked: { label: 'Booked', variant: 'default' },
  expired: { label: 'Expired', variant: 'secondary' },
}

export default function TransporterTrucksPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <TransporterHeader title="My Trucks" subtitle="Manage your truck availability posts" />

      <main className="flex-1 p-6 space-y-6">
        <div className="flex justify-end">
          <Link href="/dashboard/transporter/trucks/new">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Post Truck Availability
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockTrucks.map(truck => {
            const cfg = statusConfig[truck.status]
            return (
              <Card key={truck.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>
                  <p className="font-mono text-sm font-bold text-gray-900 mb-1">{truck.plate}</p>
                  <p className="text-xs text-gray-500 mb-3">{containerLabels[truck.type] || truck.type}</p>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      {truck.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {truck.availableFrom} → {truck.availableTo}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1 gap-1.5 h-8 text-xs">
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          <Link href="/dashboard/transporter/trucks/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 border-gray-200 hover:border-blue-300">
              <CardContent className="flex flex-col items-center justify-center p-10 text-gray-400 hover:text-blue-500 transition-colors">
                <PlusCircle className="h-8 w-8 mb-2" />
                <p className="text-sm font-medium">Post New Truck</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
