import Link from 'next/link'
import Image from 'next/image'

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: March 26, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Welcome to Trade Container, a European container transport platform operated by [Company Name]. By accessing or using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Platform Services</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Trade Container provides a subscription-based platform that connects transporters with clients across Europe for container transport services. Our platform includes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Shipment posting and management</li>
              <li>Transporter search and matching</li>
              <li>Real-time communication tools</li>
              <li>Digital document management</li>
              <li>Rating and review system</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To use our platform, you must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Be at least 18 years old or represent a registered business entity</li>
              <li>Provide accurate and complete registration information</li>
              <li>Complete KYC (Know Your Customer) verification</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription Plans</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We offer various subscription plans for clients and transporters. All subscriptions include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>30-day free trial period with no credit card required</li>
              <li>Monthly or annual billing options</li>
              <li>Full platform access during active subscription</li>
              <li>Ability to cancel anytime without penalty</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              Subscription fees are non-refundable except as required by law. We reserve the right to modify pricing with 30 days notice to existing subscribers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Responsibilities</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Users agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Provide accurate shipment and transport information</li>
              <li>Honor commitments made through the platform</li>
              <li>Comply with all applicable transport regulations</li>
              <li>Maintain appropriate insurance coverage</li>
              <li>Resolve disputes professionally and in good faith</li>
              <li>Not use the platform for illegal or fraudulent activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Platform Fees</h2>
            <p className="text-gray-600 leading-relaxed">
              Trade Container operates on a subscription model. We do not charge commissions on individual shipments. All fees are clearly displayed before subscription purchase. Users are responsible for any applicable taxes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              Trade Container acts as a platform connecting transporters and clients. We are not a party to transport contracts and are not responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mt-4">
              <li>Cargo damage, loss, or delay</li>
              <li>Transport quality or service issues</li>
              <li>Payment disputes between users</li>
              <li>Compliance with transport regulations</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              Our total liability shall not exceed the subscription fees paid by the user in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              All platform content, features, and functionality are owned by Trade Container and protected by international copyright, trademark, and other intellectual property laws. Users may not copy, modify, or distribute platform content without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or harm the platform community. Users may cancel their subscription at any time through their account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms are governed by Romanian law. Any disputes shall be resolved in the courts of Romania. For EU consumers, mandatory consumer protection laws of your country of residence may also apply.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update these Terms from time to time. We will notify users of material changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 space-y-2 text-gray-600">
              <p><strong>Email:</strong> info@trade-container.com</p>
              <p><strong>Phone:</strong> +40729 368 052</p>
            </div>
          </section>
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
