'use client'

import { ClientHeader } from '@/components/client/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, CreditCard, Download, AlertTriangle, Clock } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

export default function ClientSubscriptionClient({ subscription }: Props) {
  const router = useRouter()
  const [upgrading, setUpgrading] = useState(false)
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

  const PRICE_IDS: Record<string, string> = {
    'starter': process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY || '',
    'growth': process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH_MONTHLY || '',
    'business': process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY || '',
    'enterprise': process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY || '',
  }

  const handleUpgrade = async (planId: string) => {
    setUpgrading(true)
    try {
      console.log('🔍 handleUpgrade called with planId:', planId)
      console.log('🔍 PRICE_IDS:', PRICE_IDS)
      const priceId = PRICE_IDS[planId]
      console.log('🔍 Selected priceId:', priceId)
      if (!priceId) {
        alert(`Price ID not configured for plan: ${planId}`)
        setUpgrading(false)
        return
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('Failed to start upgrade process')
    } finally {
      setUpgrading(false)
    }
  }

  const statusConfig = {
    active: { label: 'Active', variant: 'success' as const, color: 'emerald' },
    trialing: { label: 'Trial', variant: 'default' as const, color: 'blue' },
    past_due: { label: 'Past Due', variant: 'destructive' as const, color: 'red' },
    canceled: { label: 'Canceled', variant: 'secondary' as const, color: 'gray' },
  }

  const currentStatus = statusConfig[subscription?.status as keyof typeof statusConfig] || statusConfig.canceled

  const planFeatures = [
    'Post up to 20 active shipment requests',
    'Access to all verified transporters',
    'Receive unlimited offers per shipment',
    'Direct payment flexibility (cash, bank transfer, etc.)',
    'Chat + digital documents per shipment',
    'Expense reports & CSV export',
  ]

  const ALL_PLANS = [
    { id: 'starter', name: 'Starter', price: 19.99, limit: 5, description: 'Perfect for getting started', features: ['Up to 5 shipments/month', 'Access to verified transporters', 'Real-time chat', 'Digital CMR documents', '30-day free trial'] },
    { id: 'growth', name: 'Growth', price: 34.99, limit: 10, description: 'For growing companies', features: ['Up to 10 shipments/month', 'Priority offer matching', 'Real-time chat', 'Digital documents', '30-day free trial'], popular: true },
    { id: 'business', name: 'Business', price: 59.99, limit: 20, description: 'Scale your business', features: ['Up to 20 shipments/month', 'Advanced documents', 'Analytics & reports', 'Priority support', '30-day free trial'] },
    { id: 'enterprise', name: 'Enterprise', price: 99.99, limit: null, description: 'Unlimited shipments', features: ['Unlimited shipments', 'Full document suite', 'Advanced analytics', 'Dedicated support', '30-day free trial'] },
  ]

  if (!subscription) {
    return (
      <div className="flex flex-col min-h-screen overflow-y-auto">
        <ClientHeader title="Subscription" subtitle="Choose your plan to start posting shipments" />
        <main className="flex-1 p-6 space-y-6">
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertTriangle className="h-12 w-12 text-emerald-600" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">No Active Subscription</h3>
                  <p className="text-gray-600">Choose a plan below to start posting shipments and accessing transporters</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ALL_PLANS.map(plan => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'border-emerald-500 border-2 shadow-lg' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-600 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900">€{plan.price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-900'}`}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading}
                  >
                    {upgrading ? 'Processing...' : 'Start Free Trial'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center text-sm text-gray-600">
                <p className="font-semibold mb-2">All plans include:</p>
                <p>✓ 30-day free trial • ✓ No credit card required • ✓ Cancel anytime • ✓ No hidden fees</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <ClientHeader title="Subscription" subtitle="Manage your Trade Container subscription plan" />

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
                  <p className="text-xs text-gray-500">Active shipments</p>
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
              <CardTitle className="text-base">Upgrade Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const currentPlan = subscription?.plan || 'starter'
                const currentPlanIndex = ALL_PLANS.findIndex(p => p.id === currentPlan)
                const availablePlans = ALL_PLANS.filter((_, index) => index > currentPlanIndex)

                if (availablePlans.length === 0) {
                  return (
                    <div className="rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50 p-5">
                      <p className="text-sm text-emerald-700 font-semibold">You're on the highest plan!</p>
                      <p className="text-xs text-gray-600 mt-1">Enjoy unlimited shipments and all premium features.</p>
                    </div>
                  )
                }

                const nextPlan = availablePlans[0]

                return (
                  <>
                    <div className="rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50 p-5">
                      <p className="text-sm text-gray-700 mb-2">Need more shipments?</p>
                      <p className="text-2xl font-bold text-gray-900">{nextPlan.name}</p>
                      <p className="text-sm text-emerald-600 font-semibold mt-1">
                        €{nextPlan.price}/month • {nextPlan.limit ? `${nextPlan.limit} shipments` : 'Unlimited'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{nextPlan.description}</p>
                    </div>
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleUpgrade(nextPlan.id)}
                      disabled={upgrading}
                    >
                      {upgrading ? 'Processing...' : 'Get it'}
                    </Button>

                    {availablePlans.length > 1 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Other plans</p>
                        {availablePlans.slice(1).map(plan => (
                          <div 
                            key={plan.id}
                            className="rounded-lg border border-gray-200 p-3 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors cursor-pointer"
                            onClick={() => handleUpgrade(plan.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-sm text-gray-900">{plan.name}</p>
                                <p className="text-xs text-gray-500">
                                  {plan.limit ? `${plan.limit} shipments/month` : 'Unlimited shipments'}
                                </p>
                              </div>
                              <p className="text-sm font-bold text-emerald-600">€{plan.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )
              })()}
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
