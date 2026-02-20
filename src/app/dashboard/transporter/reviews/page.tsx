'use client'

import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'

const mockReviews = [
  { id: '1', client: 'EuroShip GmbH', shipmentId: 'SHP-1834', stars: 5, text: 'Excellent service! Cargo delivered on time and in perfect condition.', date: '2026-02-15', categories: { punctuality: 5, communication: 5, cargoCare: 5, documentation: 4 } },
  { id: '2', client: 'Adriatic Shipping DOO', shipmentId: 'SHP-1830', stars: 4, text: 'Good transporter, minor delay but communicated well.', date: '2026-02-10', categories: { punctuality: 4, communication: 5, cargoCare: 4, documentation: 4 } },
  { id: '3', client: 'Nordic Freight AS', shipmentId: 'SHP-1825', stars: 5, text: 'Very professional. Will use again.', date: '2026-01-28', categories: { punctuality: 5, communication: 5, cargoCare: 5, documentation: 5 } },
]

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
      ))}
    </div>
  )
}

export default function TransporterReviewsPage() {
  const avg = mockReviews.reduce((s, r) => s + r.stars, 0) / mockReviews.length

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <TransporterHeader title="Reviews" subtitle="Ratings received from clients" />
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <Card className="lg:col-span-1">
            <CardContent className="p-6 text-center">
              <p className="text-5xl font-bold text-gray-900">{avg.toFixed(1)}</p>
              <StarRating value={Math.round(avg)} />
              <p className="text-xs text-gray-500 mt-2">{mockReviews.length} reviews</p>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardContent className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: 'Punctuality', key: 'punctuality' },
                { label: 'Communication', key: 'communication' },
                { label: 'Cargo Care', key: 'cargoCare' },
                { label: 'Documentation', key: 'documentation' },
              ].map(cat => {
                const catAvg = mockReviews.reduce((s, r) => s + (r.categories as any)[cat.key], 0) / mockReviews.length
                return (
                  <div key={cat.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">{cat.label}</span>
                      <span className="text-xs font-bold text-gray-900">{catAvg.toFixed(1)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-amber-400" style={{ width: `${(catAvg / 5) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {mockReviews.map(review => (
            <Card key={review.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{review.client}</p>
                    <p className="text-xs text-gray-400 font-mono">{review.shipmentId}</p>
                  </div>
                  <div className="text-right">
                    <StarRating value={review.stars} />
                    <p className="text-xs text-gray-400 mt-1">{review.date}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{review.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
