import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-site.png" alt="Trade Container" width={160} height={60} className="object-contain" />
          </Link>
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600 mb-12">Get in touch with our team</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Let's Move Europe Together</h2>
            <p className="text-gray-600 leading-relaxed">
              Have questions about our platform or want to learn more about our subscription model? Our team is ready to help you optimize your container transport strategy. Whether you are a carrier looking for independence or a client seeking direct port access, we're just a message away.
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Direct Support</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 shrink-0">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                  <a href="mailto:info@trade-container.com" className="text-lg font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                    info@trade-container.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 shrink-0">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                  <a href="tel:+40729368052" className="text-lg font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                    +40729 368 052
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 shrink-0">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">WhatsApp</p>
                  <a href="https://wa.me/40729368052" target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                    +40729 368 052
                  </a>
                  <p className="text-xs text-gray-500 mt-1">Best for quick carrier support</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500 shrink-0">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Office</p>
                  <p className="text-lg font-semibold text-gray-900">All Europe</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Business Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
            <div>
              <p className="font-semibold text-gray-900 mb-2">Email Support</p>
              <p>24/7 - We respond within 24 hours</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2">Phone & WhatsApp</p>
              <p>Monday - Friday: 9:00 AM - 6:00 PM CET</p>
              <p className="text-sm text-gray-500 mt-1">Emergency support available for active shipments</p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-emerald-50 border border-emerald-200 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help Getting Started?</h3>
          <p className="text-gray-600 mb-6">
            Our team is here to guide you through the platform setup, subscription selection, and KYC verification process. We offer personalized onboarding for both transporters and clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-600 transition-colors"
            >
              Start Free Trial
            </Link>
            <a
              href="mailto:info@trade-container.com"
              className="inline-flex items-center justify-center rounded-xl border border-emerald-500 bg-white px-6 py-3 text-base font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-10 mt-16">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo-site.png" alt="Trade Container" width={140} height={50} className="object-contain" />
          </div>
          <p className="text-base text-gray-500">© 2026 Trade Container. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-base text-gray-500 hover:text-gray-700">Terms</Link>
            <Link href="/privacy" className="text-base text-gray-500 hover:text-gray-700">Privacy</Link>
            <Link href="/contact" className="text-base text-gray-500 hover:text-gray-700">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
