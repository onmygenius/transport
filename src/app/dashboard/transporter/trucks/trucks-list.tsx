'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Truck, PlusCircle, MapPin, Calendar, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { deleteTruckAvailability, TruckAvailability } from '@/lib/actions/trucks'
import { useRouter } from 'next/navigation'

const equipmentLabels: Record<string, string> = {
  'flatbed': 'Flatbed',
  'curtainsider': 'Curtainsider',
  'reefer': 'Reefer',
  'tank': 'Tank',
  'lowbed': 'Lowbed',
  'mega_trailer': 'Mega Trailer',
  '20ft': '20ft Standard',
  '40ft': '40ft Standard',
  '40ft_hc': '40ft High Cube',
  'reefer_20ft': 'Reefer 20ft',
  'reefer_40ft': 'Reefer 40ft',
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'default' | 'secondary' }> = {
  active: { label: 'Available', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'secondary' },
}

export default function TrucksList({ trucks }: { trucks: TruckAvailability[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this truck availability?')) return
    
    setDeleting(id)
    const result = await deleteTruckAvailability(id)
    
    if (!result.success) {
      alert(result.error || 'Failed to delete truck')
    }
    
    setDeleting(null)
    router.refresh()
  }

  if (trucks.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/transporter/trucks/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 border-gray-200 hover:border-blue-300">
            <CardContent className="flex flex-col items-center justify-center p-10 text-gray-400 hover:text-blue-500 transition-colors">
              <PlusCircle className="h-8 w-8 mb-2" />
              <p className="text-sm font-medium">Post Your First Truck</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {trucks.map(truck => {
        const cfg = statusConfig[truck.is_active ? 'active' : 'inactive']
        const isDeleting = deleting === truck.id
        
        return (
          <Card key={truck.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
                <Badge variant={cfg.variant}>{cfg.label}</Badge>
              </div>
              <p className="font-semibold text-sm text-gray-900 mb-1">{equipmentLabels[truck.equipment_type] || truck.equipment_type}</p>
              <p className="text-xs text-gray-500 mb-3">Max: {truck.max_weight}t</p>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  {truck.origin_city}, {truck.origin_country}
                  {truck.destination_city && ` → ${truck.destination_city}, ${truck.destination_country}`}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  {truck.available_from?.split('T')[0]} → {truck.available_until?.split('T')[0]}
                </div>
                {truck.price_per_km && (
                  <div className="text-xs font-semibold text-blue-600 mt-2">
                    €{truck.price_per_km}/km
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-1.5 h-8 text-xs"
                  onClick={() => router.push(`/dashboard/transporter/trucks/${truck.id}/edit`)}
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(truck.id)}
                  disabled={isDeleting}
                >
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
  )
}
