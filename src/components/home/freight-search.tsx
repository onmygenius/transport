'use client'

import { useState } from 'react'
import { Search, MapPin, Calendar, Package, Truck, Ship, Lock, Star, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'

// Mock data - hardcoded realistic results
const MOCK_RESULTS = [
  {
    id: '1',
    type: 'transporter',
    company: 'EuroTrans Logistics',
    rating: 4.8,
    reviews: 127,
    route: 'Rotterdam → Hamburg',
    available: 'Mar 15-20, 2024',
    containerType: '40ft HC',
    price: 1250,
    verified: true,
    fleet: '45 trucks',
    country: 'Netherlands'
  },
  {
    id: '2',
    type: 'transporter',
    company: 'Baltic Freight Solutions',
    rating: 4.9,
    reviews: 203,
    route: 'Rotterdam → Hamburg',
    available: 'Mar 16-22, 2024',
    containerType: '40ft HC, 20ft',
    price: 1180,
    verified: true,
    fleet: '62 trucks',
    country: 'Germany'
  },
  {
    id: '3',
    type: 'shipment',
    company: 'Global Trade GmbH',
    rating: 4.7,
    reviews: 89,
    route: 'Rotterdam → Berlin',
    pickup: 'Mar 18, 2024',
    delivery: 'Mar 20, 2024',
    containerType: '40ft HC',
    cargoType: 'Electronics',
    price: 1400,
    verified: true,
    terminal: 'APM Terminal Rotterdam'
  },
  {
    id: '4',
    type: 'transporter',
    company: 'Scandinavia Express',
    rating: 4.6,
    reviews: 156,
    route: 'Hamburg → Copenhagen',
    available: 'Mar 17-25, 2024',
    containerType: '40ft HC, Reefer',
    price: 980,
    verified: true,
    fleet: '38 trucks',
    country: 'Denmark'
  },
  {
    id: '5',
    type: 'shipment',
    company: 'Mediterranean Shipping Co',
    rating: 4.9,
    reviews: 234,
    route: 'Antwerp → Milan',
    pickup: 'Mar 19, 2024',
    delivery: 'Mar 22, 2024',
    containerType: '20ft',
    cargoType: 'Textiles',
    price: 1650,
    verified: true,
    terminal: 'Port of Antwerp'
  }
]

export default function FreightSearch() {
  const [searchType, setSearchType] = useState<'client' | 'transporter'>('client')
  const [showResults, setShowResults] = useState(false)
  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    date: '',
    containerType: '',
    shippingType: 'FCL'
  })

  const handleSearch = () => {
    setShowResults(true)
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl px-6">
        {/* Search Widget */}
        <Card className="shadow-xl border-2 border-gray-100">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Find Transport or Cargo</h2>
                <p className="text-sm text-gray-500 mt-1">Search across Europe's largest freight network</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={searchType === 'client' ? 'default' : 'outline'}
                  onClick={() => setSearchType('client')}
                  className="gap-2"
                >
                  <Package className="h-4 w-4" />
                  I'm a Client
                </Button>
                <Button
                  variant={searchType === 'transporter' ? 'default' : 'outline'}
                  onClick={() => setSearchType('transporter')}
                  className="gap-2"
                >
                  <Truck className="h-4 w-4" />
                  I'm a Transporter
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {/* Origin */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">Origin</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rotterdam, NL"
                    className="pl-10"
                    value={filters.origin}
                    onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">Destination</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Hamburg, DE"
                    className="pl-10"
                    value={filters.destination}
                    onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">
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
                <Label className="text-xs font-medium text-gray-700">Container Type</Label>
                <Select value={filters.containerType} onValueChange={(v) => setFilters({ ...filters, containerType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20ft">20ft Standard</SelectItem>
                    <SelectItem value="40ft">40ft Standard</SelectItem>
                    <SelectItem value="40hc">40ft High Cube</SelectItem>
                    <SelectItem value="45hc">45ft High Cube</SelectItem>
                    <SelectItem value="reefer20">20ft Reefer</SelectItem>
                    <SelectItem value="reefer40">40ft Reefer</SelectItem>
                    <SelectItem value="opentop">Open Top</SelectItem>
                    <SelectItem value="flatrack">Flat Rack</SelectItem>
                    <SelectItem value="tank">Tank Container</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Shipping Type */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">Shipping Type</Label>
                <Select value={filters.shippingType} onValueChange={(v) => setFilters({ ...filters, shippingType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FCL">FCL (Full Container Load)</SelectItem>
                    <SelectItem value="LCL">LCL (Less than Container)</SelectItem>
                    <SelectItem value="FTL">FTL (Full Truck Load)</SelectItem>
                    <SelectItem value="LTL">LTL (Less than Truck)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSearch} className="w-full gap-2 bg-blue-600 hover:bg-blue-700" size="lg">
              <Search className="h-5 w-5" />
              Search {searchType === 'client' ? 'Transporters' : 'Available Cargo'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {showResults && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{MOCK_RESULTS.length} results</span> found for your search
              </p>
              <Select defaultValue="relevance">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="date">Earliest Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {MOCK_RESULTS.map((result, idx) => (
              <Card key={result.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-6">
                    {/* Left: Company Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                          {result.type === 'transporter' ? (
                            <Truck className="h-6 w-6 text-blue-600" />
                          ) : (
                            <Ship className="h-6 w-6 text-emerald-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{result.company}</h3>
                            {result.verified && (
                              <CheckCircle className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-sm font-medium text-gray-700">{result.rating}</span>
                              <span className="text-xs text-gray-500">({result.reviews} reviews)</span>
                            </div>
                            {result.type === 'transporter' && result.fleet && (
                              <Badge variant="secondary" className="text-xs">{result.fleet}</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Route</p>
                          <p className="font-medium text-gray-900">{result.route}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            {result.type === 'transporter' ? 'Available' : 'Pickup'}
                          </p>
                          <p className="font-medium text-gray-900">
                            {result.type === 'transporter' ? result.available : result.pickup}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Container Type</p>
                          <Badge variant="outline" className="text-xs">{result.containerType}</Badge>
                        </div>
                        {result.type === 'shipment' && result.cargoType && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Cargo Type</p>
                            <Badge variant="outline" className="text-xs">{result.cargoType}</Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Price & Actions (LOCKED for non-premium) */}
                    <div className="flex flex-col items-end gap-4 min-w-[200px]">
                      {/* Price - BLURRED */}
                      <div className="relative">
                        <div className="text-right blur-sm pointer-events-none select-none">
                          <p className="text-2xl font-bold text-gray-900">€{result.price}</p>
                          <p className="text-xs text-gray-500">Total price</p>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex items-center gap-2 bg-gray-900/80 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                            <Lock className="h-3 w-3" />
                            Locked
                          </div>
                        </div>
                      </div>

                      {/* Contact - LOCKED */}
                      <div className="w-full">
                        <Button variant="outline" className="w-full gap-2 relative" disabled>
                          <div className="blur-sm">Contact</div>
                          <Lock className="h-4 w-4 absolute right-3" />
                        </Button>
                      </div>

                      {/* View Details - LOCKED */}
                      <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700" asChild>
                        <Link href="/register">
                          <Lock className="h-4 w-4" />
                          Unlock Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* CTA Card after 3 results */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Want to see full details?</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Subscribe to unlock prices, contact details, and connect directly with {searchType === 'client' ? 'transporters' : 'shippers'}.
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
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
                  <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href="/register">
                      Subscribe Now - €{searchType === 'client' ? '29' : '49'}/month
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
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
