'use client'

import { useState } from 'react'
import { ClientHeader } from '@/components/client/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, TrendingUp, Package, CreditCard } from 'lucide-react'

const mockHistory = [
  { id: 'SHP-1838', transporter: 'Iberian Cargo SL', origin: 'Zurich, CH', destination: 'Lisbon, PT', date: '2026-02-15', price: 2800, status: 'completed' },
  { id: 'SHP-1834', transporter: 'Trans Cargo SRL', origin: 'Hamburg, DE', destination: 'Warsaw, PL', date: '2026-02-12', price: 1900, status: 'completed' },
  { id: 'SHP-1830', transporter: 'Alpine Logistics AG', origin: 'Oslo, NO', destination: 'Vienna, AT', date: '2026-02-08', price: 1400, status: 'completed' },
  { id: 'SHP-1825', transporter: 'Fast Logistics SA', origin: 'Lyon, FR', destination: 'Berlin, DE', date: '2026-01-28', price: 2200, status: 'completed' },
  { id: 'SHP-1820', transporter: 'Trans Cargo SRL', origin: 'Bucharest, RO', destination: 'Paris, FR', date: '2026-01-20', price: 3100, status: 'completed' },
  { id: 'SHP-1815', transporter: 'Balkan Transport DOO', origin: 'Belgrade, RS', destination: 'Amsterdam, NL', date: '2026-01-12', price: 2600, status: 'cancelled' },
]

export default function ClientHistoryPage() {
  const [period, setPeriod] = useState('all')

  const completed = mockHistory.filter(s => s.status === 'completed')
  const totalSpent = completed.reduce((s, h) => s + h.price, 0)

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <ClientHeader title="History & Reports" subtitle="View past shipments and expense reports" />
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[
            { label: 'Total Spent', value: `€${totalSpent.toLocaleString()}`, icon: CreditCard, color: 'bg-blue-100 text-blue-700' },
            { label: 'Completed Shipments', value: completed.length, icon: Package, color: 'bg-emerald-100 text-emerald-700' },
            { label: 'Avg. Cost per Shipment', value: `€${Math.round(totalSpent / completed.length).toLocaleString()}`, icon: TrendingUp, color: 'bg-violet-100 text-violet-700' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Shipment History</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                    <SelectItem value="quarter">This quarter</SelectItem>
                    <SelectItem value="year">This year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Transporter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockHistory.map(h => (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-600">{h.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{h.transporter}</td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-900">{h.origin}</p>
                      <p className="text-xs text-gray-400">→ {h.destination}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{h.date}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">€{h.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <Badge variant={h.status === 'completed' ? 'success' : 'secondary'}>
                        {h.status === 'completed' ? 'Completed' : 'Cancelled'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {h.status === 'completed' && (
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </Button>
                      )}
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
