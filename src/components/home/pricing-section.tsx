'use client'

import Link from 'next/link'
import { Package, TrendingUp, Briefcase, Crown, Truck, ArrowRight } from 'lucide-react'
import { CreativePricing } from '@/components/ui/creative-pricing'
import type { PricingTier } from '@/components/ui/creative-pricing'
import { useState } from 'react'

const clientTiers: PricingTier[] = [
  {
    name: 'Starter',
    icon: <Package className="w-6 h-6" />,
    price: 19.99,
    description: '1–5 shipments/month. Perfect for small businesses.',
    color: 'emerald',
    priceId: 'price_1TASbp0dqWRNGixPqAoh7aKf',
    features: [
      'Post up to 5 shipment requests',
      'Access to all verified transporters',
      'Real-time chat per shipment',
      'Digital CMR documents',
      '30-day free trial included',
    ],
  },
  {
    name: 'Growth',
    icon: <TrendingUp className="w-6 h-6" />,
    price: 34.99,
    description: '5–10 shipments/month. For growing companies.',
    color: 'blue',
    popular: true,
    priceId: 'price_1TAScM0dqWRNGixPJ3IlWAut',
    features: [
      'Post up to 10 shipment requests',
      'Access to all verified transporters',
      'Real-time chat per shipment',
      'Priority offer matching',
      '30-day free trial included',
    ],
  },
  {
    name: 'Business',
    icon: <Briefcase className="w-6 h-6" />,
    price: 59.99,
    description: '10–20 shipments/month. For high-volume shippers.',
    color: 'emerald',
    priceId: 'price_1TAScl0dqWRNGixPZ5yVzA7d',
    features: [
      'Post up to 20 shipment requests',
      'Access to all verified transporters',
      'Advanced digital documents',
      'Analytics & shipment reports',
      '30-day free trial included',
    ],
  },
  {
    name: 'Enterprise',
    icon: <Crown className="w-6 h-6" />,
    price: 99.99,
    description: 'Unlimited shipments. Full power, no limits.',
    color: 'purple',
    priceId: 'price_1TASdA0dqWRNGixPXq896wn9',
    features: [
      'Unlimited shipment requests',
      'Access to all verified transporters',
      'Full digital document suite',
      'Advanced analytics & exports',
      '30-day free trial included',
    ],
  },
]

export default function PricingSection() {
  const [loading, setLoading] = useState(false)

  const handleTransporterSubscribe = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId: 'price_1TASdg0dqWRNGixPXI5TsjFt',
          userId: 'temp-user-id'
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No checkout URL returned')
        setLoading(false)
      }
    } catch (error) {
      console.error('Subscription error:', error)
      setLoading(false)
    }
  }

  return (
    <section id="pricing" className="py-20 bg-[#fafaf8]">
      <CreativePricing
        tag="Simple Pricing"
        title="Choose your freight plan"
        description="30-day free trial on all plans. No credit card required."
        tiers={clientTiers}
      />
      <div className="mx-auto max-w-5xl px-6 mt-10">
        <div className="rounded-2xl bg-zinc-900 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-zinc-900 shadow-[4px_4px_0px_0px] shadow-zinc-900">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-zinc-800">
              <Truck className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-lg">Transporter Pro</h3>
              </div>
              <p className="text-zinc-400 text-sm mt-0.5">
                <span className="text-white font-bold">€29.99</span>
                <span className="text-zinc-400">/month</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleTransporterSubscribe}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border-2 border-white bg-emerald-400 px-6 py-3 text-sm font-bold text-zinc-900 shadow-[4px_4px_0px_0px] shadow-white hover:shadow-[6px_6px_0px_0px] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Start Free Trial'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <p className="text-center text-sm text-zinc-400 mt-6">
          No hidden fees · No commission per shipment · Cancel anytime
        </p>
      </div>
    </section>
  )
}
