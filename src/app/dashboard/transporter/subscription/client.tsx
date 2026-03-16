'use client'

import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, CreditCard, Download, AlertTriangle, Clock } from 'lucide-react'

interface Subscription {
  id: string
  plan: string
  plan_name: string | null
  status: string
  price: number
  currency: string
  starts_at: string
  expires_at: string
  trial_ends_at: string | null
  shipments_limit: number | null
  shipments_used: number
  created_at: string
}

interface Props {
  subscription: Subscription | null
}

export default function TransporterSubscriptionClient({ subscription }: Props) {
  const isActive = subscription?.status === 'active'
  const isTrialing = subscription?.status === 'trialing'
  const isPastDue = subscription?.status === 'past_due'
  const isCanceled = subscription?.status === 'canceled'

  const planName = subscription?.plan_name || 'No Active Plan'
  const price = subscription?.price || 0
  const currency = subscription?.currency || 'EUR'
  const shipmentsUsed = subscription?.shipments_used || 0
  const shipmentsLimit = subscription?.shipments_limit || 0
  
  const currentPeriodStart = subscription?.starts_at 
    ? new Date(subscription.starts_at).toLocaleDateString('en-GB')
    : '—'
  const currentPeriodEnd = subscription?.expires_at 
    ? new Date(subscription.expires_at).toLocaleDateString('en-GB')
    : '—'
  const nextRenewal = subscription?.expires_at 
    ? new Date(subscription.expires_at).toLocaleDateString('en-GB')
    : '—'
  const memberSince = subscription?.created_at 
    ? new Date(subscription.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : '—'
  const trialEndsAt = subscription?.trial_ends_at 
    ? new Date(subscription.trial_ends_at).toLocaleDateString('en-GB')
    : null

  const statusConfig = {
    active: { label: 'Active', variant: 'success' as const, color: 'blue' },
    trialing: { label: 'Trial', variant: 'default' as const, color: 'blue' },
    past_due: { label: 'Past Due', variant: 'destructive' as const, color: 'red' },
    canceled: { label: 'Canceled', variant: 'secondary' as const, color: 'gray' },
  }

  const currentStatus = statusConfig[subscription?.status as keyof typeof statusConfig] || statusConfig.canceled

  const planFeatures = [
    'Unlimited truck availability posts',
    'Access to all transport requests',
    'Unlimited offer submissions',
    'Direct payment from clients (no middleman)',
    'Chat + digital documents',
    'Verified badge after KYC',
  ]

  if (!subscription) {
    return (
      <div className="flex flex-col min-h-screen overflow-y-auto">
        <TransporterHeader title="Subscription" subtitle="Manage your Trade Container subscription plan" />
        <main className="flex-1 p-6">
          <Card className="border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <AlertTriangle className="h-12 w-12 text-emerald-500" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">No Active Subscription</h3>
                  <p className="text-gray-500">Subscribe to access shipment requests</p>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Choose a Plan
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <TransporterHeader title="Subscription" subtitle="Manage your Trade Container subscription plan" />

      <main className="flex-1 p-6 space-y-6">
        {isTrialing && trialEndsAt && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">Trial Period Active</p>
                  <p className="text-sm text-blue-700">Your trial ends on {trialEndsAt}. Add a payment method to continue.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isPastDue && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">Payment Failed</p>
                  <p className="text-sm text-red-700">Please update your payment method to continue using the service.</p>
                </div>
                <Button size="sm" className="ml-auto bg-red-600 hover:bg-red-700">
                  Update Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className={`lg:col-span-2 border-${currentStatus.color}-200`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-${currentStatus.color}-600`}>
                    <CreditCard className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{planName}</p>
                    <p className="text-gray-500">{currency} {price} / month</p>
                  </div>
                </div>
                <Badge variant={currentStatus.variant} className="text-sm px-3 py-1">
                  {currentStatus.label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Current period</p>
                  <p className="font-semibold text-gray-900 mt-1">{currentPeriodStart} – {currentPeriodEnd}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Next renewal</p>
                  <p className="font-semibold text-gray-900 mt-1">{nextRenewal}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Active offers</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {shipmentsUsed} / {shipmentsLimit || '∞'}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Member since</p>
                  <p className="font-semibold text-gray-900 mt-1">{memberSince}</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {planFeatures.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline">Manage Subscription</Button>
                {!isCanceled && (
                  <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 p-5">
                <p className="text-sm text-blue-700 font-semibold">You're on the Standard plan!</p>
                <p className="text-xs text-gray-600 mt-1">Enjoy unlimited access to all shipments and features.</p>
                <p className="text-xs text-gray-500 mt-2">€29.99/month • Unlimited offers</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment History</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">
              Payment history will be available soon. You can view your invoices in your Stripe Customer Portal.
            </p>
            <Button variant="outline" size="sm" className="mt-4">
              View Invoices in Stripe
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
