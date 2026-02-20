'use client'

import { useState } from 'react'
import { ClientHeader } from '@/components/client/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Star, CheckCircle, Truck } from 'lucide-react'

const mockTransporters = [
  { id: '1', name: 'Trans Cargo SRL', country: 'RO', rating: 4.8, reviews: 47, completed: 47, fleet: 8, verified: true, equipment: ['40ft', 'reefer_40ft'] },
  { id: '2', name: 'Fast Logistics SA', country: 'FR', rating: 4.6, reviews: 32, completed: 32, fleet: 5, verified: true, equipment: ['20ft', '40ft'] },
  { id: '3', name: 'Iberian Cargo SL', country: 'ES', rating: 4.3, reviews: 21, completed: 21, fleet: 4, verified: true, equipment: ['40ft', '40ft_hc'] },
  { id: '4', name: 'Balkan Transport DOO', country: 'RS', rating: 4.1, reviews: 15, completed: 15, fleet: 3, verified: false, equipment: ['20ft', '40ft'] },
  { id: '5', name: 'Alpine Logistics AG', country: 'CH', rating: 4.9, reviews: 63, completed: 63, fleet: 12, verified: true, equipment: ['40ft_hc', 'reefer_40ft'] },
]

export default function ClientTransportersPage() {
  const [search, setSearch] = useState('')

  const filtered = mockTransporters.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.country.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <ClientHeader title="Browse Transporters" subtitle="Find verified transporters for your shipments" />
      <main className="flex-1 p-6 space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or country..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(t => (
            <Card key={t.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  {t.verified && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Verified
                    </div>
                  )}
                </div>
                <p className="font-bold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-500 mb-3">{t.country} · {t.fleet} trucks</p>
                <div className="flex items-center gap-1 mb-3">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-gray-900">{t.rating}</span>
                  <span className="text-xs text-gray-400">({t.reviews} reviews)</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {t.equipment.map(e => (
                    <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>
                  ))}
                </div>
                <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">View Profile</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
