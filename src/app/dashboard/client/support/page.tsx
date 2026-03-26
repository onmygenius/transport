import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientHeader } from '@/components/client/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react'

export default async function ClientSupportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <ClientHeader title="Support" subtitle="Get in touch with our team" />
      
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Get in Touch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Let's Move Europe Together</h3>
            <p className="text-gray-600 leading-relaxed">
              Have questions about our platform or want to learn more about our subscription model? Our team is ready to help you optimize your container transport strategy. Whether you are a carrier looking for independence or a client seeking direct port access, we're just a message away.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Direct Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 shrink-0">
                <Mail className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <a href="mailto:info@trade-container.com" className="text-base font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                  info@trade-container.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 shrink-0">
                <Phone className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <a href="tel:+40729368052" className="text-base font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                  +40729 368 052
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 shrink-0">
                <MessageCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">WhatsApp</p>
                <a href="https://wa.me/40729368052" target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                  +40729 368 052
                </a>
                <p className="text-xs text-gray-500 mt-1">Best for quick carrier support</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 shrink-0">
                <MapPin className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Office</p>
                <p className="text-base font-semibold text-gray-900">All Europe</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
