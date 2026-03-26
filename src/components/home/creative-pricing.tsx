'use client'

import { useState } from 'react'
import { CheckCircle, Package, TrendingUp, Briefcase, Crown, Truck, ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'

interface PricingTier {
  name: string
  icon: React.ReactNode
  monthlyPrice: number
  sixMonthPrice: number
  description: string
  color: 'emerald' | 'blue' | 'emerald' | 'purple' | 'slate'
  features: string[]
  limit: string
  popular?: boolean
  badge?: string
}

const colorMap = {
  amber: {
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    badge: 'bg-emerald-500',
    button: 'bg-emerald-500 hover:bg-emerald-600',
    accent: 'text-emerald-600',
    dot: 'bg-emerald-400',
    highlight: 'bg-emerald-500/10 border-emerald-300',
  },
  blue: {
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    badge: 'bg-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700',
    accent: 'text-blue-600',
    dot: 'bg-blue-400',
    highlight: 'bg-blue-600/10 border-blue-300',
  },
  emerald: {
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    badge: 'bg-emerald-600',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    accent: 'text-emerald-600',
    dot: 'bg-emerald-400',
    highlight: 'bg-emerald-600/10 border-emerald-300',
  },
  purple: {
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
    badge: 'bg-purple-600',
    button: 'bg-purple-600 hover:bg-purple-700',
    accent: 'text-purple-600',
    dot: 'bg-purple-400',
    highlight: 'bg-purple-600/10 border-purple-300',
  },
  slate: {
    border: 'border-slate-200',
    bg: 'bg-slate-50',
    iconBg: 'bg-slate-100',
    iconText: 'text-slate-600',
    badge: 'bg-slate-700',
    button: 'bg-slate-700 hover:bg-slate-800',
    accent: 'text-slate-700',
    dot: 'bg-slate-400',
    highlight: 'bg-slate-700/10 border-slate-300',
  },
}

const clientTiers: PricingTier[] = [
  {
    name: 'Starter',
    icon: <Package className="h-6 w-6" />,
    monthlyPrice: 19.99,
    sixMonthPrice: 89.94,
    description: 'Perfect for small businesses just getting started with freight.',
    color: 'emerald',
    limit: '1–5 shipments/month',
    features: [
      'Post up to 5 active shipment requests',
      'Access to all verified transporters',
      'Real-time chat per shipment',
      'Digital CMR documents',
      'Email & dashboard notifications',
      '30-day free trial included',
    ],
  },
  {
    name: 'Growth',
    icon: <TrendingUp className="h-6 w-6" />,
    monthlyPrice: 34.99,
    sixMonthPrice: 179.94,
    description: 'For growing companies with regular freight needs.',
    color: 'blue',
    limit: '5–10 shipments/month',
    popular: true,
    features: [
      'Post up to 10 active shipment requests',
      'Access to all verified transporters',
      'Real-time chat per shipment',
      'Digital CMR documents',
      'Priority offer matching',
      '30-day free trial included',
    ],
  },
  {
    name: 'Business',
    icon: <Briefcase className="h-6 w-6" />,
    monthlyPrice: 59.99,
    sixMonthPrice: 329.94,
    description: 'For established companies with high shipment volumes.',
    color: 'emerald',
    limit: '10–20 shipments/month',
    features: [
      'Post up to 20 active shipment requests',
      'Access to all verified transporters',
      'Real-time chat per shipment',
      'Digital CMR + advanced docs',
      'Analytics & shipment reports',
      '30-day free trial included',
    ],
  },
  {
    name: 'Enterprise',
    icon: <Crown className="h-6 w-6" />,
    monthlyPrice: 99.99,
    sixMonthPrice: 569.94,
    description: 'Unlimited power for large logistics operations.',
    color: 'purple',
    limit: 'Unlimited shipments',
    badge: 'Unlimited',
    features: [
      'Unlimited shipment requests',
      'Access to all verified transporters',
      'Real-time chat per shipment',
      'Full digital document suite',
      'Advanced analytics & exports',
      '30-day free trial included',
    ],
  },
]

function PricingCard({ tier, billing }: { tier: PricingTier; billing: 'monthly' | '6months' }) {
  const c = colorMap[tier.color]
  const price = billing === 'monthly' ? tier.monthlyPrice : tier.sixMonthPrice
  const period = billing === 'monthly' ? '/month' : '/6 months'

  return (
    <div className={`relative rounded-2xl border-2 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${tier.popular ? `border-2 ${c.border} shadow-md` : 'border-gray-100'}`}>
      {/* Popular badge */}
      {tier.popular && (
        <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full ${c.badge} px-4 py-1`}>
          <span className="text-xs font-bold text-white flex items-center gap-1">
            <Zap className="h-3 w-3" /> Most Popular
          </span>
        </div>
      )}

      {/* Badge unlimited */}
      {tier.badge && !tier.popular && (
        <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full ${c.badge} px-4 py-1`}>
          <span className="text-xs font-bold text-white">{tier.badge}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.iconBg} ${c.iconText}`}>
            {tier.icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{tier.name}</h3>
            <span className={`text-xs font-medium ${c.accent} ${c.iconBg} px-2 py-0.5 rounded-full`}>
              {tier.limit}
            </span>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className={`rounded-xl ${c.bg} border ${c.border} p-4 mb-5`}>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">€{price.toFixed(2)}</span>
          <span className="text-sm text-gray-500">{period}</span>
        </div>
        {billing === '6months' && (
          <p className={`text-xs ${c.accent} font-semibold mt-1`}>
            = €{(tier.sixMonthPrice / 6).toFixed(2)}/month · Save €{((tier.monthlyPrice * 6) - tier.sixMonthPrice).toFixed(2)}
          </p>
        )}
        {billing === 'monthly' && (
          <p className="text-xs text-gray-400 mt-1">or €{tier.sixMonthPrice.toFixed(2)} for 6 months</p>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 mb-5 leading-relaxed">{tier.description}</p>

      {/* Features */}
      <ul className="space-y-2.5 mb-6">
        {tier.features.map(f => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
            <CheckCircle className={`h-4 w-4 shrink-0 mt-0.5 ${c.accent}`} />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href="/register"
        className={`flex w-full items-center justify-center gap-2 rounded-xl ${c.button} py-3 text-sm font-semibold text-white transition-colors`}
      >
        Start Free Trial
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

export default function CreativePricing() {
  const [billing, setBilling] = useState<'monthly' | '6months'>('monthly')

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 mb-4">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm font-medium text-blue-700">30-day free trial · No credit card required</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Simple, transparent pricing</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Choose the plan that fits your shipping volume. Scale up or down anytime.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-1 mt-6 rounded-xl bg-white border border-gray-200 p-1 shadow-sm">
          <button
            onClick={() => setBilling('monthly')}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${billing === 'monthly' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('6months')}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all flex items-center gap-2 ${billing === '6months' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
          >
            6 Months
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">Save up to 10%</span>
          </button>
        </div>
      </div>

      {/* Grid 2x2 */}
      <div className="mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-6">
        {clientTiers.map(tier => (
          <PricingCard key={tier.name} tier={tier} billing={billing} />
        ))}
      </div>

      {/* Transporter banner */}
      <div className="mx-auto max-w-4xl mt-8">
        <div className="rounded-2xl bg-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-lg">Transporter Pro</h3>
              </div>
              <p className="text-slate-400 text-sm mt-0.5">
                <span className="text-white font-semibold">€29.99</span>
                <span className="text-slate-400">/month</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-slate-400 text-xs">Unlimited offer submissions</p>
              <p className="text-slate-400 text-xs">Access all shipment requests</p>
            </div>
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-900 hover:bg-emerald-300 transition-colors whitespace-nowrap"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-gray-400 mt-6">
        No hidden fees. No commission per shipment. Cancel anytime.
      </p>
    </div>
  )
}
