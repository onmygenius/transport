import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Package, Truck, CreditCard, Star, TrendingUp,
  Clock, CheckCircle, AlertTriangle, ArrowRight, Search
} from 'lucide-react'


const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'default' | 'success' | 'destructive' | 'secondary' }> = {
  confirmed: { label: 'Confirmed', variant: 'default' },
  in_transit: { label: 'In Transit', variant: 'info' },
  delivered: { label: 'Delivered', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  accepted: { label: 'Accepted', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
}

export default async function TransporterDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_name, full_name, kyc_status, email')
    .eq('id', user.id)
    .single()

  const companyName = profile?.company_name || profile?.full_name || 'My Company'
  const kycApproved = profile?.kyc_status === 'approved'

  // Get real active jobs (shipments where transporter has accepted offer)
  const { data: activeJobs } = await supabase
    .from('offers')
    .select(`
      id,
      price,
      status,
      shipment:shipment_id(
        id,
        display_id,
        origin_city,
        origin_country,
        destination_city,
        destination_country,
        pickup_date,
        status,
        client:client_id(
          company_name,
          full_name
        )
      )
    `)
    .eq('transporter_id', user.id)
    .in('status', ['accepted'])
    .order('created_at', { ascending: false })
    .limit(3)

  // Get real stats
  const { count: activeJobsCount } = await supabase
    .from('offers')
    .select('*', { count: 'exact', head: true })
    .eq('transporter_id', user.id)
    .eq('status', 'accepted')

  const { count: pendingOffersCount } = await supabase
    .from('offers')
    .select('*', { count: 'exact', head: true })
    .eq('transporter_id', user.id)
    .eq('status', 'pending')

  const { count: completedShipmentsCount } = await supabase
    .from('offers')
    .select('shipment:shipment_id!inner(status)', { count: 'exact', head: true })
    .eq('transporter_id', user.id)
    .eq('status', 'accepted')
    .eq('shipment.status', 'completed')

  // Get average rating from reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('transporter_id', user.id)

  const averageRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  // Get recent offers
  const { data: recentOffers } = await supabase
    .from('offers')
    .select(`
      id,
      price,
      status,
      created_at,
      shipment:shipment_id(
        display_id,
        origin_city,
        origin_country,
        destination_city,
        destination_country
      )
    `)
    .eq('transporter_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  // Get subscription data
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_name, status, expires_at')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <TransporterHeader
        title="Dashboard"
        subtitle={`Welcome back, ${companyName}`}
        companyName={companyName}
      />

      <main className="flex-1 p-6 space-y-6">

        {!kycApproved && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 flex items-center gap-4">
            <AlertTriangle className="h-5 w-5 text-emerald-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-800">KYC verification pending</p>
              <p className="text-xs text-emerald-600 mt-0.5">Complete your company verification to access all features and post trucks.</p>
            </div>
            <Link href="/dashboard/transporter/settings" className="shrink-0 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors">
              Complete KYC
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Active Jobs', value: activeJobsCount || 0, icon: Truck, color: 'bg-blue-100 text-blue-700', href: '/dashboard/transporter/jobs' },
            { label: 'Pending Offers', value: pendingOffersCount || 0, icon: Package, color: 'bg-emerald-100 text-emerald-700', href: '/dashboard/transporter/offers' },
            { label: 'Completed', value: completedShipmentsCount || 0, icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700', href: '/dashboard/transporter/jobs' },
            { label: 'Rating', value: `${averageRating} ★`, icon: Star, color: 'bg-violet-100 text-violet-700', href: '/dashboard/transporter/reviews' },
          ].map(s => (
            <Link key={s.label} href={s.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.color}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                  <CreditCard className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Subscription</p>
                  <p className="text-xl font-bold text-gray-900">{subscription?.plan_name || 'No Plan'}</p>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 mb-4 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Next renewal</span>
                  <span className="font-semibold text-gray-700">
                    {subscription?.expires_at ? new Date(subscription.expires_at).toLocaleDateString('en-GB') : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-semibold ${subscription?.status === 'active' || subscription?.status === 'trialing' ? 'text-emerald-600' : 'text-gray-600'}`}>
                    {subscription?.status === 'trialing' ? 'Trial' : subscription?.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <Link
                href="/dashboard/transporter/wallet"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                View Billing
              </Link>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Active Jobs</CardTitle>
                <Link href="/dashboard/transporter/jobs" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {activeJobs && activeJobs.length > 0 ? activeJobs.map(job => {
                  const shipment = job.shipment as any
                  const cfg = statusConfig[shipment?.status] || { label: shipment?.status || 'Unknown', variant: 'default' as const }
                  return (
                    <div key={job.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-gray-500">{shipment?.display_id}</span>
                          <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">
                          {shipment?.client?.company_name || shipment?.client?.full_name || 'Unknown Client'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {shipment?.origin_city}, {shipment?.origin_country} → {shipment?.destination_city}, {shipment?.destination_country}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-sm font-bold text-gray-900">€{job.price.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{shipment?.pickup_date ? new Date(shipment.pickup_date).toLocaleDateString() : '—'}</p>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="px-6 py-8 text-center text-sm text-gray-500">
                    No active jobs yet. <Link href="/dashboard/transporter/shipments" className="text-blue-600 hover:underline">Browse shipments</Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Offers</CardTitle>
                <Link href="/dashboard/transporter/offers" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {recentOffers && recentOffers.length > 0 ? recentOffers.map(offer => {
                  const shipment = offer.shipment as any
                  const cfg = statusConfig[offer.status] || { label: offer.status, variant: 'default' as const }
                  return (
                    <div key={offer.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-gray-500">{shipment?.display_id}</span>
                          <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">
                          {shipment?.origin_city}, {shipment?.origin_country} → {shipment?.destination_city}, {shipment?.destination_country}
                        </p>
                        <p className="text-xs text-gray-400">{new Date(offer.created_at).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">€{offer.price.toLocaleString()}</p>
                    </div>
                  )
                }) : (
                  <div className="px-6 py-8 text-center text-sm text-gray-500">
                    No offers yet. <Link href="/dashboard/transporter/shipments" className="text-blue-600 hover:underline">Browse shipments</Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Browse Available Shipments', href: '/dashboard/transporter/shipments', icon: Search, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                { label: 'Post Truck Availability', href: '/dashboard/transporter/trucks/new', icon: Truck, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
                { label: 'Upload Documents', href: '/dashboard/transporter/documents', icon: Package, color: 'bg-violet-50 text-violet-700 hover:bg-violet-100' },
                { label: 'View Subscription', href: '/dashboard/transporter/subscription', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
              ].map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${action.color}`}
                >
                  <action.icon className="h-4 w-4 shrink-0" />
                  {action.label}
                  <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
