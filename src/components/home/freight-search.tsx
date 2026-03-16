'use client'

import { useState } from 'react'
import { Search, MapPin, Calendar, Package, Truck, Ship, Lock, Star, CheckCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'

interface SearchResult {
  id: string
  type: string
  company: string
  verified: boolean
  route: string
  pickup?: string
  delivery?: string
  containerType: string
  transportType?: string
  price: number | null
  priceVisible: boolean
  currency: string
  status: string
}

export default function FreightSearch() {
  const [searchType, setSearchType] = useState<'client' | 'transporter'>('client')
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [filters, setFilters] = useState({
    originCountry: '',
    originCity: '',
    destinationCountry: '',
    destinationCity: '',
    date: '',
    containerType: '',
    shippingType: 'fcl'
  })

  const europeanCountries = [
    { code: 'NL', name: 'Netherlands' },
    { code: 'DE', name: 'Germany' },
    { code: 'BE', name: 'Belgium' },
    { code: 'FR', name: 'France' },
    { code: 'PL', name: 'Poland' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'RO', name: 'Romania' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'AT', name: 'Austria' },
    { code: 'HU', name: 'Hungary' },
    { code: 'DK', name: 'Denmark' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'FI', name: 'Finland' },
  ]

  const handleSearch = async () => {
    setLoading(true)
    setShowResults(true)
    
    try {
      const params = new URLSearchParams()
      params.append('searchType', searchType)
      params.append('sortBy', sortBy)
      if (filters.originCountry) params.append('originCountry', filters.originCountry)
      if (filters.originCity) params.append('originCity', filters.originCity)
      if (filters.destinationCountry) params.append('destinationCountry', filters.destinationCountry)
      if (filters.destinationCity) params.append('destinationCity', filters.destinationCity)
      if (filters.date) params.append('date', filters.date)
      if (filters.containerType) params.append('containerType', filters.containerType)
      if (filters.shippingType) params.append('shippingType', filters.shippingType)
      
      const response = await fetch(`/api/search-shipments?${params.toString()}`)
      
      if (!response.ok) {
        console.error('API error:', response.status, response.statusText)
        setResults([])
        return
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('API returned non-JSON response')
        setResults([])
        return
      }

      const data = await response.json()
      
      if (data.results) {
        setResults(data.results)
        setHasActiveSubscription(data.hasActiveSubscription || false)
      } else {
        setResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl px-6">
        {/* Search Widget */}
        <Card className="shadow-xl border-2 border-gray-100">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Find Transport or Cargo</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Search across Europe's largest freight network</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant={searchType === 'client' ? 'default' : 'outline'}
                  onClick={() => setSearchType('client')}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Package className="h-4 w-4" />
                  I'm a Client
                </Button>
                <Button
                  variant={searchType === 'transporter' ? 'default' : 'outline'}
                  onClick={() => setSearchType('transporter')}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Truck className="h-4 w-4" />
                  I'm a Transporter
                </Button>
              </div>
            </div>

            {/* Location Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
              {/* Origin Country */}
              <div className="space-y-2">
                <Label className="text-xs">Origin Country</Label>
                <Select value={filters.originCountry} onValueChange={(v) => setFilters({ ...filters, originCountry: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {europeanCountries.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Origin City (Optional) */}
              <div className="space-y-2">
                <Label className="text-xs">Origin City (optional)</Label>
                <Input
                  placeholder="e.g. Rotterdam"
                  value={filters.originCity}
                  onChange={(e) => setFilters({ ...filters, originCity: e.target.value })}
                />
              </div>

              {/* Destination Country */}
              <div className="space-y-2">
                <Label className="text-xs">Destination Country</Label>
                <Select value={filters.destinationCountry} onValueChange={(v) => setFilters({ ...filters, destinationCountry: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {europeanCountries.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Destination City (Optional) */}
              <div className="space-y-2">
                <Label className="text-xs">Destination City (optional)</Label>
                <Input
                  placeholder="e.g. Hamburg"
                  value={filters.destinationCity}
                  onChange={(e) => setFilters({ ...filters, destinationCity: e.target.value })}
                />
              </div>
            </div>

            {/* Other Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
              {/* Date */}
              <div className="space-y-2">
                <Label className="text-xs">
                  {searchType === 'client' ? 'Pickup Date' : 'Available From'}
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    className="pl-10"
                    value={filters.date}
                    onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                  />
                </div>
              </div>

              {/* Container Type */}
              <div className="space-y-2">
                <Label className="text-xs">Container Type</Label>
                <Select value={filters.containerType} onValueChange={(v) => setFilters({ ...filters, containerType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20ft">20 FT</SelectItem>
                    <SelectItem value="30ft">30 FT</SelectItem>
                    <SelectItem value="40ft">40 FT</SelectItem>
                    <SelectItem value="45ft">45 FT</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Shipping Type */}
              <div className="space-y-2">
                <Label className="text-xs">Shipping Type</Label>
                <Select value={filters.shippingType} onValueChange={(v) => setFilters({ ...filters, shippingType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fcl">FCL (Full Container Load)</SelectItem>
                    <SelectItem value="lcl">LCL (Less than Container Load)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSearch} disabled={loading} className="w-full gap-2 bg-emerald-400 hover:bg-emerald-300 text-zinc-900 text-sm sm:text-base" size="lg">
              {loading ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              <span className="hidden sm:inline">{loading ? 'Searching...' : `Search ${searchType === 'client' ? 'Transporters' : 'Available Cargo'}`}</span>
              <span className="sm:hidden">{loading ? 'Searching...' : 'Search'}</span>
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {showResults && (
          <div className="mt-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-xs sm:text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{results.length} results</span> found for your search
              </p>
              <Select value={sortBy} onValueChange={(v) => { setSortBy(v); handleSearch(); }}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="date">Earliest Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : results.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No shipments found. Try adjusting your filters.</p>
                </CardContent>
              </Card>
            ) : results.map((result) => (
              <Card key={result.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row items-start justify-between gap-4 lg:gap-6">
                    {/* Left: Company Info */}
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-emerald-100">
                          <Ship className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{result.company}</h3>
                            {result.verified && (
                              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                            <Badge variant="secondary" className="text-xs">{result.status}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Route</p>
                          <p className="font-medium text-gray-900 text-xs sm:text-sm">{result.route}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Pickup</p>
                          <p className="font-medium text-gray-900 text-xs sm:text-sm">{result.pickup}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Container</p>
                          <Badge variant="outline" className="text-xs">{result.containerType}</Badge>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Transport</p>
                          <Badge variant="outline" className="text-xs">{result.transportType?.toUpperCase()}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Right: Price & Actions (LOCKED for non-premium) */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 sm:gap-3 w-full lg:w-auto lg:min-w-[200px] mt-3 lg:mt-0">
                      {/* Price - VISIBLE or BLURRED based on subscription */}
                      <div className="relative flex-1 lg:flex-none lg:w-full">
                        {hasActiveSubscription ? (
                          // User has active subscription - show real price
                          <div className="text-center lg:text-right">
                            {result.price && result.priceVisible ? (
                              <>
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{result.currency === 'EUR' ? '€' : '$'}{result.price.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Total</p>
                              </>
                            ) : (
                              <>
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-500">—</p>
                                <p className="text-xs text-gray-500">Price hidden</p>
                              </>
                            )}
                          </div>
                        ) : (
                          // User doesn't have subscription - blur price
                          <>
                            {result.price && result.priceVisible ? (
                              <div className="text-center lg:text-right blur-sm pointer-events-none select-none">
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{result.currency === 'EUR' ? '€' : '$'}{result.price.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Total</p>
                              </div>
                            ) : (
                              <div className="text-center lg:text-right blur-sm pointer-events-none select-none">
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">€****</p>
                                <p className="text-xs text-gray-500">Total</p>
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex items-center gap-1.5 bg-gray-900/80 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium">
                                <Lock className="h-3 w-3" />
                                <span className="hidden sm:inline">Locked</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* View Details or Unlock Details based on subscription */}
                      {hasActiveSubscription ? (
                        <Button className="flex-1 lg:w-full gap-1.5 sm:gap-2 bg-emerald-400 hover:bg-emerald-300 text-zinc-900 text-xs sm:text-sm" size="sm" asChild>
                          <Link href={`/dashboard/${searchType === 'client' ? 'client' : 'transporter'}/shipments/${result.id}`}>
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">View</span>
                          </Link>
                        </Button>
                      ) : (
                        <Button className="flex-1 lg:w-full gap-1.5 sm:gap-2 bg-emerald-400 hover:bg-emerald-300 text-zinc-900 text-xs sm:text-sm" size="sm" asChild>
                          <Link href="/register">
                            <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Unlock Details</span>
                            <span className="sm:hidden">Unlock</span>
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* CTA Card after 3 results */}
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Want to see full details?</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">
                  Subscribe to unlock prices, contact details, and connect directly with {searchType === 'client' ? 'transporters' : 'shippers'}.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto mb-6">
                  {[
                    'View exact prices',
                    'Contact details & messaging',
                    'Accept shipments instantly',
                    'Unlimited searches & alerts'
                  ].map(feature => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" className="gap-2 bg-emerald-400 hover:bg-emerald-300 text-zinc-900 text-sm sm:text-base" asChild>
                    <Link href="/register">
                      Subscribe Now - €{searchType === 'client' ? '29' : '49'}/month
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-sm sm:text-base" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-4">No free trial. Cancel anytime.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  )
}
