import Link from 'next/link'
import Image from 'next/image'

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: March 26, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Trade Container ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our European container transport platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.1 Account Information</h3>
            <p className="text-gray-600 leading-relaxed mb-4">When you register, we collect:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Company name and registration details</li>
              <li>Contact information (email, phone number)</li>
              <li>Business address</li>
              <li>Tax identification numbers (CUI/VAT)</li>
              <li>KYC verification documents</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2 Platform Usage Data</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Shipment details and transport requests</li>
              <li>Communication between users</li>
              <li>Transaction history and subscription data</li>
              <li>Ratings and reviews</li>
              <li>Login activity and IP addresses</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.3 Technical Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Operating system</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">We use collected information to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Provide and maintain our platform services</li>
              <li>Process subscriptions and payments</li>
              <li>Verify user identity and prevent fraud</li>
              <li>Facilitate communication between transporters and clients</li>
              <li>Send service updates and notifications</li>
              <li>Improve platform functionality and user experience</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce our Terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing</h2>
            <p className="text-gray-600 leading-relaxed mb-4">We share your information only in these circumstances:</p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.1 With Other Users</h3>
            <p className="text-gray-600 leading-relaxed">
              When you post a shipment or submit an offer, relevant business information (company name, contact details, ratings) is visible to potential partners on the platform.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 Service Providers</h3>
            <p className="text-gray-600 leading-relaxed">
              We use trusted third-party services for payment processing (Stripe), hosting (Vercel), database (Supabase), and analytics. These providers have access only to information necessary for their services.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.3 Legal Requirements</h3>
            <p className="text-gray-600 leading-relaxed">
              We may disclose information when required by law, court order, or to protect our rights, safety, or property.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.4 Business Transfers</h3>
            <p className="text-gray-600 leading-relaxed">
              In case of merger, acquisition, or sale of assets, user information may be transferred to the new entity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-600 leading-relaxed mb-4">We implement industry-standard security measures including:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Encrypted data storage</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
              <li>Secure payment processing via Stripe</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights (GDPR)</h2>
            <p className="text-gray-600 leading-relaxed mb-4">Under EU data protection law, you have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Restriction:</strong> Limit how we process your data</li>
              <li><strong>Portability:</strong> Receive your data in a structured format</li>
              <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Withdraw consent:</strong> Withdraw consent for data processing</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              To exercise these rights, contact us at info@trade-container.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain information for legal compliance, dispute resolution, and fraud prevention purposes, typically for 7 years as required by tax and commercial law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-600 leading-relaxed mb-4">We use cookies and similar technologies to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Maintain your login session</li>
              <li>Remember your preferences</li>
              <li>Analyze platform usage</li>
              <li>Improve user experience</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              You can control cookies through your browser settings. Disabling cookies may limit platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-600 leading-relaxed">
              Your data may be processed in countries outside the EU. We ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by the European Commission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Our platform is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected data from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Privacy Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you of material changes via email or platform notification. The "Last updated" date at the top indicates when changes were made.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              For privacy-related questions or to exercise your rights, contact us at:
            </p>
            <div className="space-y-2 text-gray-600">
              <p><strong>Email:</strong> info@trade-container.com</p>
              <p><strong>Phone:</strong> +40729 368 052</p>
            </div>
            <p className="text-gray-600 leading-relaxed mt-4">
              You also have the right to lodge a complaint with your local data protection authority.
            </p>
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
