import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientHeader } from '@/components/client/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Package, Truck, CreditCard, AlertTriangle,
  ArrowRight, PlusCircle, CheckCircle, Clock, TrendingUp
} from 'lucide-react'


const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'default' | 'success' | 'destructive' | 'secondary' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  offer_received: { label: 'Offer Received', variant: 'info' },
  confirmed: { label: 'Confirmed', variant: 'default' },
  in_transit: { label: 'In Transit', variant: 'info' },
  delivered: { label: 'Delivered', variant: 'success' },
  completed: { label: 'Completed', variant: 'success' },
  disputed: { label: 'Disputed', variant: 'destructive' },
  cancelled: { label: 'Cancelled', variant: 'secondary' },
}

export default async function ClientDashboardPage() {
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

  // Get real shipments data
  const { data: shipments } = await supabase
    .from('shipments')
    .select('id, display_id, origin_city, origin_country, destination_city, destination_country, pickup_date, status')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })
    .limit(4)

  // Get real stats
  const { count: activeShipmentsCount } = await supabase
    .from('shipments')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', user.id)
    .in('status', ['pending', 'offer_received', 'confirmed', 'in_transit'])

  const { count: pendingOffersCount } = await supabase
    .from('offers')
    .select('shipments!inner(client_id)', { count: 'exact', head: true })
    .eq('shipments.client_id', user.id)
    .eq('status', 'pending')

  const { data: completedShipments } = await supabase
    .from('shipments')
    .select('agreed_price')
    .eq('client_id', user.id)
    .eq('status', 'completed')

  const totalSpent = completedShipments?.reduce((sum, s) => sum + (s.agreed_price || 0), 0) || 0

  const { count: openDisputesCount } = await supabase
    .from('shipments')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', user.id)
    .eq('status', 'disputed')

  // Get latest offers for first shipment with offers
  const shipmentWithOffers = shipments?.find(s => s.status === 'offer_received')
  let latestOffers: any[] = []
  
  if (shipmentWithOffers) {
    const { data: offers } = await supabase
      .from('offers')
      .select(`
        id,
        price,
        delivery_days,
        transporter:transporter_id(
          company_name,
          full_name
        )
      `)
      .eq('shipment_id', shipmentWithOffers.id)
      .eq('status', 'pending')
      .order('price', { ascending: true })
      .limit(3)
    
    latestOffers = offers || []
  }

  // Get subscription data
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_name, status, expires_at, shipments_used, shipments_limit')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <ClientHeader
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
              <p className="text-xs text-emerald-600 mt-0.5">Complete your company verification to post shipments and access transporters.</p>
            </div>
            <Link href="/dashboard/client/settings" className="shrink-0 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors">
              Complete KYC
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Active Shipments', value: activeShipmentsCount || 0, icon: Package, color: 'bg-blue-100 text-blue-700', href: '/dashboard/client/shipments' },
            { label: 'Pending Offers', value: pendingOffersCount || 0, icon: Clock, color: 'bg-emerald-100 text-emerald-700', href: '/dashboard/client/shipments' },
            { label: 'Total Spent', value: `€${totalSpent.toLocaleString()}`, icon: CreditCard, color: 'bg-emerald-100 text-emerald-700', href: '/dashboard/client/history' },
            { label: 'Open Disputes', value: openDisputesCount || 0, icon: AlertTriangle, color: 'bg-red-100 text-red-700', href: '/dashboard/client/disputes' },
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

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">My Shipments</CardTitle>
                <Link href="/dashboard/client/shipments" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {shipments && shipments.length > 0 ? shipments.map(s => {
                  const cfg = statusConfig[s.status] || { label: s.status, variant: 'default' as const }
                  return (
                    <div key={s.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-gray-500">{s.display_id}</span>
                          <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{s.origin_city}, {s.origin_country} → {s.destination_city}, {s.destination_country}</p>
                      </div>
                      <p className="text-xs text-gray-400 shrink-0 ml-4">{new Date(s.pickup_date).toLocaleDateString()}</p>
                    </div>
                  )
                }) : (
                  <div className="px-6 py-8 text-center text-sm text-gray-500">
                    No shipments yet. <Link href="/dashboard/client/post" className="text-emerald-600 hover:underline">Post your first shipment</Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Latest Offers{shipmentWithOffers ? ` — ${shipmentWithOffers.display_id}` : ''}</CardTitle>
                <Link href="/dashboard/client/shipments" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                  Compare <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {latestOffers.length > 0 ? latestOffers.map((offer, i) => (
                  <div key={offer.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{offer.transporter?.company_name || offer.transporter?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{offer.delivery_days} days delivery</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">€{offer.price.toLocaleString()}</p>
                      <Link href="/dashboard/client/shipments" className="mt-0.5 text-xs font-semibold text-emerald-600 hover:underline">View</Link>
                    </div>
                  </div>
                )) : (
                  <div className="px-6 py-8 text-center text-sm text-gray-500">
                    No pending offers
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Post New Shipment', href: '/dashboard/client/post', icon: PlusCircle, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
                { label: 'Browse Transporters', href: '/dashboard/client/transporters', icon: Truck, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                { label: 'View Documents', href: '/dashboard/client/documents', icon: Package, color: 'bg-violet-50 text-violet-700 hover:bg-violet-100' },
                { label: 'Expense Reports', href: '/dashboard/client/history', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
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

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Subscription Status</CardTitle>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{subscription.plan_name || 'Client Plan'}</p>
                      <Badge variant={subscription.status === 'active' || subscription.status === 'trialing' ? 'success' : 'secondary'} className="mt-1">
                        {subscription.status === 'trialing' ? 'Trial' : subscription.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Renewal date</span>
                      <span className="font-medium">{new Date(subscription.expires_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active shipments</span>
                      <span className="font-medium">{subscription.shipments_used || 0} / {subscription.shipments_limit || '∞'}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  No active subscription. <Link href="/dashboard/client/subscription" className="text-emerald-600 hover:underline">Choose a plan</Link>
                </div>
              )}
              <Link
                href="/dashboard/client/subscription"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Manage Subscription
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
