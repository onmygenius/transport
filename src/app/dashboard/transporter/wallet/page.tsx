import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreditCard, CheckCircle, Calendar, FileText, Info } from 'lucide-react'
import Link from 'next/link'

const invoiceHistory = [
  { id: 'INV-2026-02', plan: 'Transporter Pro', amount: 49, date: '2026-02-01', status: 'paid' },
  { id: 'INV-2026-01', plan: 'Transporter Pro', amount: 49, date: '2026-01-01', status: 'paid' },
  { id: 'INV-2025-12', plan: 'Transporter Pro', amount: 49, date: '2025-12-01', status: 'paid' },
]

export default function TransporterBillingPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <TransporterHeader title="Billing" subtitle="Manage your subscription and invoices" />

      <main className="flex-1 p-6 space-y-6">

        <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800">How payments work on FreightEx</p>
            <p className="text-sm text-blue-700 mt-0.5">
              Payments between clients and transporters are settled <strong>directly between the parties</strong> (bank transfer, cash, etc.).
              FreightEx only charges a <strong>monthly subscription fee</strong> for platform access.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Current Plan</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">Transporter Pro</p>
              <p className="text-xs text-gray-500 mt-1">€49 / month · Active</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Next Renewal</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">01 Mar 2026</p>
              <p className="text-xs text-gray-500 mt-1">Auto-renews monthly</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                  <CreditCard className="h-5 w-5 text-violet-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Payment Method</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">•••• 4242</p>
              <p className="text-xs text-gray-500 mt-1">Visa · Expires 12/27</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="text-base">Plan Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                'Unlimited offer submissions',
                'Access to all shipment listings',
                'Real-time notifications',
                'Document management',
                'Priority support',
                'Performance analytics',
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  {f}
                </div>
              ))}
              <div className="pt-2">
                <Link href="/dashboard/transporter/subscription">
                  <Button variant="outline" className="w-full">Manage Subscription</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Invoice History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {invoiceHistory.map(inv => (
                  <div key={inv.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <FileText className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{inv.plan} — {inv.id}</p>
                      <p className="text-xs text-gray-400">{inv.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="success">Paid</Badge>
                      <p className="text-sm font-bold text-gray-900">€{inv.amount}</p>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">Download</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
