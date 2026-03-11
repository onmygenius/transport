'use client'

import { CreativePricing } from '@/components/ui/creative-pricing'
import type { PricingTier } from '@/components/ui/creative-pricing'
import { Package, TrendingUp, Briefcase, Crown, Truck } from 'lucide-react'

const clientTiers: PricingTier[] = [
  {
    name: 'Starter',
    icon: <Package className="w-6 h-6" />,
    price: 19.99,
    description: '1–5 shipments/month. Perfect for small businesses.',
    color: 'amber',
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
    features: [
      'Unlimited shipment requests',
      'Access to all verified transporters',
      'Full digital document suite',
      'Advanced analytics & exports',
      '30-day free trial included',
    ],
  },
]

export default function PricingDemoPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col items-center justify-center py-20 px-6">
      <CreativePricing
        tag="Simple Pricing"
        title="Choose your freight plan"
        description="Scale up or down anytime. 30-day free trial on all plans."
        tiers={clientTiers}
      />
    </div>
  )
}
