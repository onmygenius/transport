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

const mockStats = {
  activeShipments: 4,
  pendingOffers: 7,
  totalSpent: 18400,
  openDisputes: 1,
}

const mockShipments = [
  { id: 'SHP-1845', origin: 'Warsaw, PL', destination: 'Rome, IT', pickup: '2026-02-28', status: 'pending', offers: 3 },
  { id: 'SHP-1842', origin: 'Bucharest, RO', destination: 'Berlin, DE', pickup: '2026-02-22', status: 'confirmed', offers: 0 },
  { id: 'SHP-1840', origin: 'London, GB', destination: 'Madrid, ES', pickup: '2026-02-20', status: 'in_transit', offers: 0 },
  { id: 'SHP-1838', origin: 'Zurich, CH', destination: 'Lisbon, PT', pickup: '2026-02-15', status: 'completed', offers: 0 },
]

const mockOffers = [
  { id: 'OFF-021', shipmentId: 'SHP-1845', transporter: 'Trans Cargo SRL', price: 1900, rating: 4.8, days: 3 },
  { id: 'OFF-022', shipmentId: 'SHP-1845', transporter: 'Fast Logistics SA', price: 2100, rating: 4.6, days: 2 },
  { id: 'OFF-023', shipmentId: 'SHP-1845', transporter: 'Iberian Cargo SL', price: 1750, rating: 4.3, days: 4 },
]

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

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <ClientHeader
        title="Dashboard"
        subtitle={`Welcome back, ${companyName}`}
        companyName={companyName}
      />

      <main className="flex-1 p-6 space-y-6">

        {!kycApproved && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center gap-4">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">KYC verification pending</p>
              <p className="text-xs text-amber-600 mt-0.5">Complete your company verification to post shipments and access transporters.</p>
            </div>
            <Link href="/dashboard/client/settings" className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition-colors">
              Complete KYC
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Active Shipments', value: mockStats.activeShipments, icon: Package, color: 'bg-blue-100 text-blue-700', href: '/dashboard/client/shipments' },
            { label: 'Pending Offers', value: mockStats.pendingOffers, icon: Clock, color: 'bg-amber-100 text-amber-700', href: '/dashboard/client/shipments' },
            { label: 'Total Spent', value: `€${mockStats.totalSpent.toLocaleString()}`, icon: CreditCard, color: 'bg-emerald-100 text-emerald-700', href: '/dashboard/client/history' },
            { label: 'Open Disputes', value: mockStats.openDisputes, icon: AlertTriangle, color: 'bg-red-100 text-red-700', href: '/dashboard/client/disputes' },
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
                {mockShipments.map(s => {
                  const cfg = statusConfig[s.status]
                  return (
                    <div key={s.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-gray-500">{s.id}</span>
                          <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                          {s.offers > 0 && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">{s.offers} offers</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{s.origin} → {s.destination}</p>
                      </div>
                      <p className="text-xs text-gray-400 shrink-0 ml-4">{s.pickup}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Latest Offers — SHP-1845</CardTitle>
                <Link href="/dashboard/client/shipments" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                  Compare <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {mockOffers.map((offer, i) => (
                  <div key={offer.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{offer.transporter}</p>
                        <p className="text-xs text-gray-400">★ {offer.rating} · {offer.days} days delivery</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">€{offer.price.toLocaleString()}</p>
                      <button className="mt-0.5 text-xs font-semibold text-emerald-600 hover:underline">Accept</button>
                    </div>
                  </div>
                ))}
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
                { label: 'Expense Reports', href: '/dashboard/client/history', icon: TrendingUp, color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
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
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Client / Shipper Plan</p>
                  <p className="text-sm text-gray-500">€29/month · Active</p>
                </div>
                <Badge variant="success" className="ml-auto">Active</Badge>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Renewal date</span>
                  <span className="font-medium">20.03.2026</span>
                </div>
                <div className="flex justify-between">
                  <span>Active shipments</span>
                  <span className="font-medium">4 / 20</span>
                </div>
              </div>
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
