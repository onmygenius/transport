'use client'

import { useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts'
import { Download, TrendingUp, CreditCard, Package, Users, ArrowUpRight } from 'lucide-react'

const monthlyRevenue = [
  { month: 'Mar 25', subscriptions: 8200, commissions: 4200, total: 12400 },
  { month: 'Apr 25', subscriptions: 9100, commissions: 6700, total: 15800 },
  { month: 'May 25', subscriptions: 8800, commissions: 5400, total: 14200 },
  { month: 'Jun 25', subscriptions: 11200, commissions: 7700, total: 18900 },
  { month: 'Jul 25', subscriptions: 13400, commissions: 7900, total: 21300 },
  { month: 'Aug 25', subscriptions: 12100, commissions: 7600, total: 19700 },
  { month: 'Sep 25', subscriptions: 15600, commissions: 8900, total: 24500 },
  { month: 'Oct 25', subscriptions: 17800, commissions: 10300, total: 28100 },
  { month: 'Nov 25', subscriptions: 19400, commissions: 11800, total: 31200 },
  { month: 'Dec 25', subscriptions: 18200, commissions: 11600, total: 29800 },
  { month: 'Jan 26', subscriptions: 21100, commissions: 12300, total: 33400 },
  { month: 'Feb 26', subscriptions: 23800, commissions: 13400, total: 37200 },
]

const shipmentStats = [
  { month: 'Sep 25', completed: 142, cancelled: 18, disputed: 3 },
  { month: 'Oct 25', completed: 168, cancelled: 22, disputed: 5 },
  { month: 'Nov 25', completed: 155, cancelled: 19, disputed: 4 },
  { month: 'Dec 25', completed: 178, cancelled: 21, disputed: 6 },
  { month: 'Jan 26', completed: 189, cancelled: 24, disputed: 4 },
  { month: 'Feb 26', completed: 203, cancelled: 21, disputed: 3 },
]

const userGrowth = [
  { month: 'Sep 25', transporters: 312, clients: 445 },
  { month: 'Oct 25', transporters: 378, clients: 521 },
  { month: 'Nov 25', transporters: 445, clients: 612 },
  { month: 'Dec 25', transporters: 512, clients: 698 },
  { month: 'Ian 26', transporters: 621, clients: 834 },
  { month: 'Feb 26', transporters: 762, clients: 1085 },
]

const topTransporters = [
  { name: 'Fast Logistics SA', shipments: 48, revenue: 142000, rating: 4.9 },
  { name: 'Nordic Freight AS', shipments: 41, revenue: 118000, rating: 4.8 },
  { name: 'Iberian Cargo SL', shipments: 37, revenue: 98000, rating: 4.7 },
  { name: 'Trans Cargo SRL', shipments: 34, revenue: 87000, rating: 4.6 },
  { name: 'Alpine Logistics AG', shipments: 29, revenue: 76000, rating: 4.5 },
]

export default function ReportsPage() {
  const [period, setPeriod] = useState('12m')

  const totalRevenue = monthlyRevenue.reduce((a, m) => a + m.total, 0)
  const totalSubscriptions = monthlyRevenue.reduce((a, m) => a + m.subscriptions, 0)
  const totalCommissions = monthlyRevenue.reduce((a, m) => a + m.commissions, 0)
  const totalShipments = shipmentStats.reduce((a, s) => a + s.completed, 0)

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Financial Reports" subtitle="Complete analysis of platform revenue and activity" />

      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
                <SelectItem value="ytd">Year to date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), change: '+12.4%', icon: TrendingUp, color: 'bg-blue-600' },
            { label: 'From Subscriptions', value: formatCurrency(totalSubscriptions), change: '+15.2%', icon: CreditCard, color: 'bg-emerald-600' },
            { label: 'From Commissions', value: formatCurrency(totalCommissions), change: '+8.7%', icon: Package, color: 'bg-violet-600' },
            { label: 'Completed Shipments', value: totalShipments.toString(), change: '+18.3%', icon: Users, color: 'bg-amber-500' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className="mt-1.5 text-xl font-bold text-gray-900">{s.value}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                      <span className="text-xs font-medium text-green-600">{s.change}</span>
                    </div>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Revenue — Breakdown</CardTitle>
            <CardDescription>Subscriptions vs. transport commissions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [`€${Number(value).toLocaleString()}`, '']} />
                <Legend />
                <Area type="monotone" dataKey="subscriptions" stroke="#3b82f6" fill="url(#colorSub)" strokeWidth={2} name="Subscriptions" />
                <Area type="monotone" dataKey="commissions" stroke="#8b5cf6" fill="url(#colorCom)" strokeWidth={2} name="Commissions" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipment Statistics</CardTitle>
              <CardDescription>Completed, cancelled and disputed</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={shipmentStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="cancelled" fill="#f59e0b" name="Cancelled" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="disputed" fill="#ef4444" name="Disputed" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">User Growth</CardTitle>
              <CardDescription>Active transporters and clients</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="transporters" stroke="#3b82f6" strokeWidth={2} dot={false} name="Transporters" />
                  <Line type="monotone" dataKey="clients" stroke="#10b981" strokeWidth={2} dot={false} name="Clients" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 Transporters</CardTitle>
            <CardDescription>Most active transporters on the platform</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Transporter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Completed Shipments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Total Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topTransporters.map((t, i) => (
                  <tr key={t.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{t.name}</td>
                    <td className="px-6 py-4 text-gray-700">{t.shipments} shipments</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(t.revenue)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400">★</span>
                        <span className="font-semibold text-gray-900">{t.rating}</span>
                      </div>
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
