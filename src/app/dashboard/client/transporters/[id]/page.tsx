'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ClientHeader } from '@/components/client/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Star, 
  CheckCircle, 
  Truck, 
  MapPin, 
  Package, 
  Calendar,
  Award,
  Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface TransporterProfile {
  id: string
  profile_id: string
  fleet_size: number
  equipment_types: string[]
  container_types: string[]
  operating_countries: string[]
  operating_regions: string[]
  rating_average: number
  rating_count: number
  completed_shipments: number
  avg_delivery_days: number
  profile: {
    company_name: string
    company_country: string
    company_address: string
    phone: string
    email: string
    kyc_status: string
  }
}

interface Rating {
  id: string
  stars: number
  review_text: string
  punctuality: number
  communication: number
  cargo_care: number
  documentation: number
  created_at: string
  from_user: {
    company_name: string
  }
}

export default function TransporterProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [transporter, setTransporter] = useState<TransporterProfile | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchTransporterProfile() {
      const { data: profileData, error: profileError } = await supabase
        .from('transporter_profiles')
        .select(`
          *,
          profile:profiles!transporter_profiles_profile_id_fkey(
            company_name,
            company_country,
            company_address,
            phone,
            email,
            kyc_status
          )
        `)
        .eq('profile_id', params.id)
        .single()

      if (profileError) {
        console.error('Error fetching transporter profile:', profileError)
      } else {
        setTransporter(profileData)
      }

      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select(`
          *,
          from_user:profiles!ratings_from_user_id_fkey(company_name)
        `)
        .eq('to_user_id', params.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (ratingsError) {
        console.error('Error fetching ratings:', ratingsError)
      } else {
        setRatings(ratingsData || [])
      }

      setLoading(false)
    }

    if (params.id) {
      fetchTransporterProfile()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <ClientHeader title="Transporter Profile" subtitle="Loading..." />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (!transporter) {
    return (
      <div className="flex flex-col min-h-screen">
        <ClientHeader title="Transporter Profile" subtitle="Not found" />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Transporter not found</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <ClientHeader 
        title={transporter.profile.company_name || 'Transporter Profile'} 
        subtitle="Detailed information about this transporter" 
      />
      
      <main className="flex-1 p-6 space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Transporters
        </Button>

        {/* Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100">
                  <Truck className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {transporter.profile.company_name}
                    </h2>
                    {transporter.profile.kyc_status === 'approved' && (
                      <div className="flex items-center gap-1 text-sm text-blue-600 font-semibold">
                        <CheckCircle className="h-4 w-4" />
                        Verified
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {transporter.profile.company_country || 'N/A'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Truck className="h-4 w-4" />
                      {transporter.fleet_size} trucks
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {transporter.completed_shipments} completed shipments
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="text-2xl font-bold text-gray-900">
                    {transporter.rating_average?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {transporter.rating_count || 0} reviews
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Avg Delivery Time</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {transporter.avg_delivery_days || 0} days
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Fleet Size</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {transporter.fleet_size} trucks
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Completed</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {transporter.completed_shipments} shipments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Company Name</p>
                <p className="font-medium">{transporter.profile.company_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Country</p>
                <p className="font-medium">{transporter.profile.company_country || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Address</p>
                <p className="font-medium">{transporter.profile.company_address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone</p>
                <p className="font-medium">{transporter.profile.phone || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipment & Coverage */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Equipment Types</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {transporter.equipment_types?.map((eq, idx) => (
                <Badge key={idx} variant="secondary" className="text-sm">
                  {eq}
                </Badge>
              ))}
            </div>

            <h3 className="text-lg font-semibold mb-4">Container Types</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {transporter.container_types?.map((ct, idx) => (
                <Badge key={idx} variant="outline" className="text-sm">
                  {ct}
                </Badge>
              ))}
            </div>

            <h3 className="text-lg font-semibold mb-4">Operating Countries</h3>
            <div className="flex flex-wrap gap-2">
              {transporter.operating_countries?.map((country, idx) => (
                <Badge key={idx} className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200">
                  {country}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Reviews ({ratings.length})</h3>
          {ratings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No reviews yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <Card key={rating.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {rating.from_user?.company_name || 'Anonymous'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(rating.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                        <span className="text-lg font-bold">{rating.stars}</span>
                      </div>
                    </div>

                    {rating.review_text && (
                      <p className="text-gray-700 mb-4">{rating.review_text}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {rating.punctuality && (
                        <div>
                          <p className="text-gray-500">Punctuality</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-medium">{rating.punctuality}/5</span>
                          </div>
                        </div>
                      )}
                      {rating.communication && (
                        <div>
                          <p className="text-gray-500">Communication</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-medium">{rating.communication}/5</span>
                          </div>
                        </div>
                      )}
                      {rating.cargo_care && (
                        <div>
                          <p className="text-gray-500">Cargo Care</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-medium">{rating.cargo_care}/5</span>
                          </div>
                        </div>
                      )}
                      {rating.documentation && (
                        <div>
                          <p className="text-gray-500">Documentation</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-medium">{rating.documentation}/5</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
