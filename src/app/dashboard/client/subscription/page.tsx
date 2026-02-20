'use client'

import { ClientHeader } from '@/components/client/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, CreditCard, Download } from 'lucide-react'

const mockPaymentHistory = [
  { id: 'PAY-032', plan: 'Monthly Subscription', amount: 29, date: '2026-02-20', status: 'paid' },
  { id: 'PAY-025', plan: 'Monthly Subscription', amount: 29, date: '2026-01-20', status: 'paid' },
  { id: 'PAY-018', plan: 'Monthly Subscription', amount: 29, date: '2025-12-20', status: 'paid' },
  { id: 'PAY-011', plan: 'Monthly Subscription', amount: 29, date: '2025-11-20', status: 'paid' },
]

export default function ClientSubscriptionPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <ClientHeader title="Subscription" subtitle="Manage your FreightEx subscription plan" />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600">
                    <CreditCard className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">Client / Shipper Plan</p>
                    <p className="text-gray-500">€29 / month</p>
                  </div>
                </div>
                <Badge variant="success" className="text-sm px-3 py-1">Active</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Current period</p>
                  <p className="font-semibold text-gray-900 mt-1">20.02.2026 – 20.03.2026</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Next renewal</p>
                  <p className="font-semibold text-gray-900 mt-1">20.03.2026</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Active shipments</p>
                  <p className="font-semibold text-gray-900 mt-1">4 / 20</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Member since</p>
                  <p className="font-semibold text-gray-900 mt-1">November 2025</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {[
                  'Post up to 20 active shipment requests',
                  'Access to all verified transporters',
                  'Receive unlimited offers per shipment',
                  'Direct payment flexibility (cash, bank transfer, etc.)',
                  'Chat + digital documents per shipment',
                  'Expense reports & CSV export',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline">Switch to Annual (save 20%)</Button>
                <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Annual Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50 p-5 mb-4">
                <p className="text-3xl font-bold text-gray-900">€278 <span className="text-base font-normal text-gray-500">/year</span></p>
                <p className="text-sm text-emerald-600 font-semibold mt-1">Save €70 vs monthly</p>
                <p className="text-xs text-gray-500 mt-0.5">= €23.17/month</p>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Upgrade to Annual</Button>
              <p className="text-xs text-center text-gray-400 mt-3">Billed once per year. Cancel anytime.</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockPaymentHistory.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-600">{p.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{p.plan}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">€{p.amount}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{p.date}</td>
                    <td className="px-6 py-4"><Badge variant="success">Paid</Badge></td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
