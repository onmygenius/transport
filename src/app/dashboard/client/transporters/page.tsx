'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ClientHeader } from '@/components/client/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Star, CheckCircle, Truck, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Transporter {
  id: string
  profile_id: string
  fleet_size: number
  equipment_types: string[]
  container_types: string[]
  operating_countries: string[]
  rating_average: number
  rating_count: number
  completed_shipments: number
  profile: {
    company_name: string
    company_country: string
    kyc_status: string
  }
}

export default function ClientTransportersPage() {
  const [search, setSearch] = useState('')
  const [transporters, setTransporters] = useState<Transporter[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchTransporters() {
      const { data, error } = await supabase
        .from('transporter_profiles')
        .select(`
          *,
          profile:profiles!transporter_profiles_profile_id_fkey(
            company_name,
            company_country,
            kyc_status
          )
        `)
        .order('rating_average', { ascending: false })

      if (error) {
        console.error('Error fetching transporters:', error)
      } else {
        setTransporters(data || [])
      }
      setLoading(false)
    }

    fetchTransporters()
  }, [])

  const filtered = transporters.filter(t =>
    t.profile?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.profile?.company_country?.toLowerCase().includes(search.toLowerCase())
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No transporters found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(t => (
              <Card key={t.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    {t.profile?.kyc_status === 'approved' && (
                      <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Verified
                      </div>
                    )}
                  </div>
                  <p className="font-bold text-gray-900">{t.profile?.company_name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 mb-3">{t.profile?.company_country || 'N/A'} · {t.fleet_size} trucks</p>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-gray-900">{t.rating_average?.toFixed(1) || '0.0'}</span>
                    <span className="text-xs text-gray-400">({t.rating_count || 0} reviews)</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {t.container_types?.slice(0, 3).map((ct, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">{ct}</Badge>
                    ))}
                    {t.container_types?.length > 3 && (
                      <Badge variant="secondary" className="text-xs">+{t.container_types.length - 3}</Badge>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => router.push(`/dashboard/client/transporters/${t.profile_id}`)}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
