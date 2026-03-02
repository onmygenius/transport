'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Review {
  id: string
  stars: number
  review_text: string | null
  punctuality: number | null
  communication: number | null
  cargo_care: number | null
  documentation: number | null
  created_at: string
  shipment: {
    id: string
  } | null
  from_user: {
    company_name: string | null
    full_name: string | null
  } | null
}

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
  const router = useRouter()
  const supabase = createClient()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReviews() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          from_user:profiles!ratings_from_user_id_fkey(company_name, full_name),
          shipment:shipments(id)
        `)
        .eq('to_user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching reviews:', error)
      } else {
        setReviews(data || [])
      }

      setLoading(false)
    }

    loadReviews()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <TransporterHeader title="Reviews" subtitle="Ratings received from clients" />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.stars, 0) / reviews.length : 0

  const categories = [
    { label: 'Punctuality', key: 'punctuality' as const },
    { label: 'Communication', key: 'communication' as const },
    { label: 'Cargo Care', key: 'cargo_care' as const },
    { label: 'Documentation', key: 'documentation' as const },
  ]

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <TransporterHeader title="Reviews" subtitle="Ratings received from clients" />
      <main className="flex-1 p-6 space-y-6">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</p>
              <p className="text-sm text-gray-500">Complete shipments to start receiving reviews from clients</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              <Card className="lg:col-span-1">
                <CardContent className="p-6 text-center">
                  <p className="text-5xl font-bold text-gray-900">{avg.toFixed(1)}</p>
                  <StarRating value={Math.round(avg)} />
                  <p className="text-xs text-gray-500 mt-2">{reviews.length} reviews</p>
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardContent className="p-6 grid grid-cols-2 gap-4">
                  {categories.map(cat => {
                    const validReviews = reviews.filter(r => r[cat.key] !== null)
                    const catAvg = validReviews.length > 0
                      ? validReviews.reduce((s, r) => s + (r[cat.key] || 0), 0) / validReviews.length
                      : 0
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
              {reviews.map(review => (
                <Card key={review.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.from_user?.company_name || review.from_user?.full_name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {review.shipment?.id || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <StarRating value={review.stars} />
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {review.review_text && (
                      <p className="text-sm text-gray-600">{review.review_text}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
