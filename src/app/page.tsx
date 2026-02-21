import Link from 'next/link'
import Image from 'next/image'
import { Shield, Zap, Globe, Star, CheckCircle, ArrowRight, Package, Users, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Trade Container" width={160} height={60} className="object-contain" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#hero" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Home</a>
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">How it works</a>
            <a href="#about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">About Us</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      <section id="hero" className="relative overflow-hidden bg-blue-950 py-24 md:py-32">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          src="/hero.mp4"
        />
        <div className="absolute inset-0 bg-blue-950/65" />
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-800/50 border border-blue-700/50 px-4 py-1.5 mb-6">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-blue-200">Active platform in 25+ European countries</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight">
            Freight Exchange<br />
            <span className="text-blue-300">for Europe</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-blue-200 max-w-2xl mx-auto leading-relaxed">
            Connecting transporters with shippers across Europe. Post shipments, send offers and manage transport — all in one platform.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-900 hover:bg-blue-50 transition-colors shadow-lg"
            >
              Get Started NOW
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-600 bg-blue-800/30 px-8 py-4 text-base font-semibold text-white hover:bg-blue-800/50 transition-colors"
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
                <p className="text-sm text-blue-300 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">How does it work?</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">Simple, fast and secure. From posting to delivery in a few steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 mb-6">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">For Transporters</span>
              </div>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Create account and verify your company', desc: 'Quick registration with KYC verification of company documents.' },
                  { step: '02', title: 'Post your available trucks', desc: 'Specify location, equipment type and availability.' },
                  { step: '03', title: 'Send offers on matching shipments', desc: 'Search by route, container type and date. Send offers in one click.' },
                  { step: '04', title: 'Deliver and get paid', desc: 'Payment is settled directly between you and the client — bank transfer, cash or any agreed method.' },
                ].map(item => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 mb-6">
                <Package className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">For Clients / Shippers</span>
              </div>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Create account and verify your company', desc: 'Simple registration process with KYC verification.' },
                  { step: '02', title: 'Post your transport request', desc: 'Specify route, container type, weight and desired date.' },
                  { step: '03', title: 'Compare received offers', desc: 'Receive offers from verified transporters. Compare prices and ratings.' },
                  { step: '04', title: 'Agree on payment and track', desc: 'Pay the transporter directly via bank transfer or cash. Track delivery status in real time.' },
                ].map(item => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-bold">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need, in one platform</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">Complete features for European transporters and shippers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, color: 'bg-blue-100 text-blue-600', title: 'Verified & Trusted Network', desc: 'All transporters and clients are KYC-verified. Trade with confidence on a trusted platform.' },
              { icon: Globe, color: 'bg-emerald-100 text-emerald-600', title: 'Pan-European Coverage', desc: 'Network of transporters and clients from 25+ European countries.' },
              { icon: Zap, color: 'bg-amber-100 text-amber-600', title: 'Automatic Matching', desc: 'Our algorithm automatically suggests matching shipments and transporters.' },
              { icon: Star, color: 'bg-violet-100 text-violet-600', title: 'Rating System', desc: 'Verified reviews after every shipment. Choose with confidence.' },
              { icon: Package, color: 'bg-rose-100 text-rose-600', title: 'Digital Documents', desc: 'CMR, invoices and proof of delivery — all digital, in the platform.' },
              { icon: Users, color: 'bg-cyan-100 text-cyan-600', title: 'Real-Time Chat', desc: 'Direct communication between transporter and client per shipment.' },
            ].map(f => (
              <div key={f.title} className="rounded-2xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${f.color} mb-4`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Simple and transparent pricing</h2>
            <p className="mt-3 text-gray-500">Simple monthly subscription. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              {
                title: 'Transporter',
                monthly: '€49',
                annual: '€470',
                color: 'border-blue-200',
                badge: 'bg-blue-600',
                features: ['Unlimited truck availability posts', 'Access to all transport requests', 'Unlimited offer submissions', 'Direct payment from clients (no middleman)', 'Chat + digital documents', 'Verified badge after KYC'],
              },
              {
                title: 'Client / Shipper',
                monthly: '€29',
                annual: '€278',
                color: 'border-emerald-200',
                badge: 'bg-emerald-600',
                features: ['Unlimited transport requests', 'Access to all transporters', 'Offer comparison', 'Direct payment to transporters (your choice)', 'Chat + digital documents', 'Expense reports'],
              },
            ].map(plan => (
              <div key={plan.title} className={`rounded-2xl border-2 ${plan.color} bg-white p-8`}>
                <div className={`inline-flex items-center rounded-full ${plan.badge} px-3 py-1 mb-4`}>
                  <span className="text-xs font-semibold text-white">{plan.title}</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.monthly}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">or {plan.annual}/year (save 20%)</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block w-full rounded-xl ${plan.badge} py-3 text-center text-sm font-semibold text-white hover:opacity-90 transition-opacity`}
                >
                  Create your account
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-gray-500">
            No hidden fees. No commission per shipment. Only your monthly subscription.
          </p>
        </div>
      </section>

      <section className="py-20 bg-blue-900">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-4 text-blue-200 text-lg">
            Join 1,800+ users who use Trade Container every day.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-900 hover:bg-blue-50 transition-colors"
            >
              Create free account
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">About Us</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">The story behind Trade Container and the team building the future of freight.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Trade Container was founded with a simple idea: make container freight across Europe faster, more transparent and accessible to everyone — from large logistics companies to small businesses.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                We connect shippers directly with verified transporters, eliminating unnecessary intermediaries. Payments are settled directly between parties — we only charge a simple monthly subscription for platform access.
              </p>
              <p className="text-gray-600 leading-relaxed">
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
                  <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
                  <p className="font-semibold text-gray-900 mt-1">{stat.label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{stat.desc}</p>
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
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Trade Container" width={140} height={50} className="object-contain" />
          </div>
          <p className="text-sm text-gray-500">© 2026 Trade Container. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Terms</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Privacy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
