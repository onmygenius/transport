'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Shield, Zap, Globe, Star, CheckCircle, ArrowRight, Package, Users, TrendingUp, Truck } from 'lucide-react'
import FreightSearch from '@/components/home/freight-search'
import HeroVideo from '@/components/home/hero-video'
import FlowAnimation from '@/components/home/flow-animation'
import PricingSection from '@/components/home/pricing-section'
import SavingsCalculator from '@/components/home/savings-calculator'
import { EuropeMap } from '@/components/ui/europe-map-simple'
import { MAJOR_PORTS, createPortRoutes } from './page-routes'

export default function HomePage() {
  // Convertesc rutele din format nume -> coordonate
  const portRoutes = createPortRoutes()
  const europeanRoutes = portRoutes.map(route => ({
    start: { 
      lat: MAJOR_PORTS[route.start as keyof typeof MAJOR_PORTS].lat, 
      lng: MAJOR_PORTS[route.start as keyof typeof MAJOR_PORTS].lng, 
      label: route.start 
    },
    end: { 
      lat: MAJOR_PORTS[route.end as keyof typeof MAJOR_PORTS].lat, 
      lng: MAJOR_PORTS[route.end as keyof typeof MAJOR_PORTS].lng, 
      label: route.end 
    }
  }))


  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Image src="/logo-site.png" alt="Trade Container" width={160} height={60} className="object-contain" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#hero" className="text-lg text-gray-600 hover:text-gray-900 transition-colors">Home</a>
            <a href="#features" className="text-lg text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="text-lg text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#how-it-works" className="text-lg text-gray-600 hover:text-gray-900 transition-colors">How it works</a>
            <a href="#about" className="text-lg text-gray-600 hover:text-gray-900 transition-colors">About Us</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-amber-400 px-4 py-2 text-lg font-medium text-zinc-900 hover:bg-amber-300 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      <section id="hero" className="relative overflow-hidden bg-zinc-900 py-24 md:py-32">
        <HeroVideo />
        <div className="absolute inset-0 bg-zinc-900/65" />
        <div className="relative mx-auto max-w-3xl px-8 py-12 text-center rounded-3xl bg-black/50 backdrop-blur-sm border border-white/10">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 border border-amber-400/50 px-4 py-1.5 mb-6">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-lg text-amber-200">Active platform in 25+ European countries</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight">
            Freight Exchange<br />
            <span className="text-amber-400">for Europe</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Connecting transporters with shippers across Europe. Post shipments, send offers and manage transport — all in one platform.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-8 py-4 text-base font-semibold text-zinc-900 hover:bg-amber-300 transition-colors shadow-lg"
            >
              Get Started NOW
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/50 bg-white/10 px-8 py-4 text-base font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Sign In
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: '1,800+', label: 'Active users' },
              { value: '10,000+', label: 'Completed shipments' },
              { value: '25+', label: 'Countries covered' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">{s.value}</p>
                <p className="text-lg text-amber-300 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FreightSearch />

      <section id="features" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">50+ Major European Ports Connected</h2>
            <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">Complete coverage across Europe — from Rotterdam to Istanbul, from Helsinki to Algeciras. Our network connects all major maritime ports with verified transporters ready to move your containers.</p>
          </div>

          {/* Harta europeană - full width */}
          <div className="w-full mb-12">
            <EuropeMap
              dots={europeanRoutes}
              lineColor="#f59e0b"
              showLabels={true}
              animationDuration={3}
              loop={true}
            />
          </div>

          {/* Carduri features - 3 coloane */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: Shield, color: 'bg-amber-100 text-amber-600', title: 'Verified & Trusted Network', desc: 'All transporters and clients are KYC-verified. Trade with confidence on a trusted platform.' },
                { icon: Globe, color: 'bg-emerald-100 text-emerald-600', title: 'Pan-European Coverage', desc: 'Network of transporters and clients from 25+ European countries.' },
                { icon: Zap, color: 'bg-amber-100 text-amber-600', title: 'Automatic Matching', desc: 'Our algorithm automatically suggests matching shipments and transporters.' },
                { icon: Star, color: 'bg-violet-100 text-violet-600', title: 'Rating System', desc: 'Verified reviews after every shipment. Choose with confidence.' },
                { icon: Package, color: 'bg-rose-100 text-rose-600', title: 'Digital Documents', desc: 'CMR, invoices and proof of delivery — all digital, in the platform.' },
                { icon: Users, color: 'bg-cyan-100 text-cyan-600', title: 'Real-Time Chat', desc: 'Direct communication between transporter and client per shipment.' },
              ].map(f => (
                <div key={f.title} className="rounded-2xl border border-gray-100 shadow-md p-5 hover:shadow-lg transition-all">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.color} mb-3`}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">{f.title}</h3>
                  <p className="mt-1 text-base text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <span className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-lg font-semibold text-amber-700 mb-4">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How does it work?</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">Simple, fast and secure. From posting to delivery in a few steps.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* For Transporters */}
            <div>
              <div className="flex items-center gap-3 mb-6 p-4 bg-amber-400 rounded-2xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/30">
                  <Truck className="h-5 w-5 text-zinc-900" />
                </div>
                <div>
                  <p className="font-bold text-zinc-900 text-base">For Transporters</p>
                  <p className="text-base text-zinc-700">Carriers & fleet operators</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { icon: Users, title: 'Create & verify account', desc: 'Quick registration with KYC verification of company documents.' },
                  { icon: Truck, title: 'Post your available trucks', desc: 'Specify location, equipment type and availability.' },
                  { icon: Zap, title: 'Send offers on shipments', desc: 'Search by route, container type and date. Send offers in one click.' },
                  { icon: Star, title: 'Deliver and get paid', desc: 'Payment settled directly between you and the client.' },
                ].map((item, i) => (
                  <div key={item.title} className="flex gap-4 bg-white rounded-2xl border border-gray-100 shadow-md p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 border-2 border-amber-200">
                      <item.icon className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-bold text-amber-400">0{i + 1}</span>
                        <p className="font-semibold text-gray-900 text-lg">{item.title}</p>
                      </div>
                      <p className="text-lg text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Clients */}
            <div>
              <div className="flex items-center gap-3 mb-6 p-4 bg-zinc-900 rounded-2xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-base">For Clients / Shippers</p>
                  <p className="text-base text-zinc-400">Manufacturing & trading companies</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { icon: Users, title: 'Create & verify account', desc: 'Simple registration process with KYC verification.' },
                  { icon: Globe, title: 'Post your transport request', desc: 'Specify route, container type, weight and desired date.' },
                  { icon: Star, title: 'Compare received offers', desc: 'Receive offers from verified transporters. Compare prices and ratings.' },
                  { icon: CheckCircle, title: 'Agree on payment & track', desc: 'Pay the transporter directly. Track delivery status in real time.' },
                ].map((item, i) => (
                  <div key={item.title} className="flex gap-4 bg-white rounded-2xl border border-gray-100 shadow-md p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-50 border-2 border-zinc-200">
                      <item.icon className="h-5 w-5 text-zinc-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-bold text-zinc-400">0{i + 1}</span>
                        <p className="font-semibold text-gray-900 text-lg">{item.title}</p>
                      </div>
                      <p className="text-lg text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <FlowAnimation />

      <SavingsCalculator />

      <PricingSection />

      <section id="about" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">About Us</h2>
            <p className="mt-3 text-lg text-gray-500 max-w-xl mx-auto">The story behind Trade Container and the team building the future of freight.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Trade Container was founded with a simple idea: make container freight across Europe faster, more transparent and accessible to everyone — from large logistics companies to small businesses.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                We connect shippers directly with verified transporters, eliminating unnecessary intermediaries. Payments are settled directly between parties — we only charge a simple monthly subscription for platform access.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our platform covers 25+ European countries and is trusted by over 1,800 companies who use it daily to move containers across the continent.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: '2022', label: 'Founded', desc: 'Born in Europe, built for Europe' },
                { value: '25+', label: 'Countries', desc: 'Pan-European coverage' },
                { value: '1,800+', label: 'Active users', desc: 'Transporters & shippers' },
                { value: '10,000+', label: 'Shipments', desc: 'Successfully completed' },
              ].map(stat => (
                <div key={stat.label} className="rounded-2xl bg-gray-50 border border-gray-100 p-6">
                  <p className="text-3xl font-bold text-amber-500">{stat.value}</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{stat.label}</p>
                  <p className="text-base text-gray-500 mt-0.5">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🎯', title: 'Direct & Transparent', desc: 'No hidden fees, no commissions per shipment. You pay only your monthly subscription and deal directly with your partner.' },
              { icon: '🔒', title: 'Verified & Secure', desc: 'Every transporter and shipper goes through KYC verification. You always know who you are working with.' },
              { icon: '🌍', title: 'Built for Europe', desc: 'Designed specifically for the European freight market — multi-language support, European regulations and pan-continental routes.' },
            ].map(v => (
              <div key={v.title} className="text-center p-6">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h4 className="font-bold text-gray-900 mb-2">{v.title}</h4>
                <p className="text-lg text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo-site.png" alt="Trade Container" width={140} height={50} className="object-contain" />
          </div>
          <p className="text-base text-gray-500">© 2026 Trade Container. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-base text-gray-500 hover:text-gray-700">Terms</a>
            <a href="#" className="text-base text-gray-500 hover:text-gray-700">Privacy</a>
            <a href="#" className="text-base text-gray-500 hover:text-gray-700">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
