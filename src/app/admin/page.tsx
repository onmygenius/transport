'use client'

import { AdminHeader } from '@/components/admin/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users, TrendingUp, Package, CreditCard, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Truck, CheckCircle, Clock, XCircle
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'

const revenueData = [
  { month: 'Mar', revenue: 12400, subscriptions: 8200 },
  { month: 'Apr', revenue: 15800, subscriptions: 9100 },
  { month: 'May', revenue: 14200, subscriptions: 8800 },
  { month: 'Jun', revenue: 18900, subscriptions: 11200 },
  { month: 'Jul', revenue: 21300, subscriptions: 13400 },
  { month: 'Aug', revenue: 19700, subscriptions: 12100 },
  { month: 'Sep', revenue: 24500, subscriptions: 15600 },
  { month: 'Oct', revenue: 28100, subscriptions: 17800 },
  { month: 'Nov', revenue: 31200, subscriptions: 19400 },
  { month: 'Dec', revenue: 29800, subscriptions: 18200 },
  { month: 'Jan', revenue: 33400, subscriptions: 21100 },
  { month: 'Feb', revenue: 37200, subscriptions: 23800 },
]

const registrationsData = [
  { day: 'Feb 14', transporters: 4, clients: 7 },
  { day: 'Feb 15', transporters: 6, clients: 9 },
  { day: 'Feb 16', transporters: 3, clients: 5 },
  { day: 'Feb 17', transporters: 8, clients: 12 },
  { day: 'Feb 18', transporters: 5, clients: 8 },
  { day: 'Feb 19', transporters: 7, clients: 11 },
  { day: 'Feb 20', transporters: 9, clients: 14 },
]

const subscriptionDistribution = [
  { name: 'Transporters Monthly', value: 234, color: '#3b82f6' },
  { name: 'Transporters Annual', value: 89, color: '#1d4ed8' },
  { name: 'Clients Monthly', value: 312, color: '#10b981' },
  { name: 'Clients Annual', value: 127, color: '#059669' },
]

const shipmentsData = [
  { month: 'Oct', completed: 142, cancelled: 18 },
  { month: 'Nov', completed: 168, cancelled: 22 },
  { month: 'Dec', completed: 155, cancelled: 19 },
  { month: 'Jan', completed: 189, cancelled: 24 },
  { month: 'Feb', completed: 203, cancelled: 21 },
]

const recentRegistrations = [
  { id: '1', name: 'Trans Cargo SRL', type: 'transporter', country: 'RO', date: '2026-02-20', status: 'pending' },
  { id: '2', name: 'EuroShip GmbH', type: 'client', country: 'DE', date: '2026-02-20', status: 'approved' },
  { id: '3', name: 'Fast Logistics SA', type: 'transporter', country: 'FR', date: '2026-02-19', status: 'pending' },
  { id: '4', name: 'Container Plus Ltd', type: 'client', country: 'GB', date: '2026-02-19', status: 'approved' },
  { id: '5', name: 'Balkan Transport DOO', type: 'transporter', country: 'RS', date: '2026-02-18', status: 'rejected' },
]

const recentPayments = [
  { id: 'PAY-001', user: 'Trans Cargo SRL', type: 'Monthly Subscription', amount: 49, date: '2026-02-20', status: 'success' },
  { id: 'PAY-002', user: 'EuroShip GmbH', type: 'Shipment #1842', amount: 2400, date: '2026-02-20', status: 'escrow' },
  { id: 'PAY-003', user: 'Fast Logistics SA', type: 'Annual Subscription', amount: 470, date: '2026-02-19', status: 'success' },
  { id: 'PAY-004', user: 'Nordic Freight AS', type: 'Shipment #1839', amount: 1850, date: '2026-02-19', status: 'released' },
  { id: 'PAY-005', user: 'Container Plus Ltd', type: 'Monthly Subscription', amount: 29, date: '2026-02-18', status: 'success' },
]

const openDisputes = [
  { id: 'DIS-001', client: 'EuroShip GmbH', transporter: 'Trans Cargo SRL', amount: 2400, reason: 'Damaged cargo', date: '2026-02-19' },
  { id: 'DIS-002', client: 'Nordic Freight AS', transporter: 'Balkan Transport', amount: 1850, reason: 'Late delivery', date: '2026-02-18' },
  { id: 'DIS-003', client: 'Container Plus Ltd', transporter: 'Fast Logistics SA', amount: 3200, reason: 'Missing cargo', date: '2026-02-17' },
]

interface KpiCardProps {
  title: string
  value: string
  change: number
  icon: React.ElementType
  color: string
  subtitle?: string
}

function KpiCard({ title, value, change, icon: Icon, color, subtitle }: KpiCardProps) {
  const isPositive = change >= 0
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
            <div className="mt-2 flex items-center gap-1">
              {isPositive ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{change}% vs last month
              </span>
            </div>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening on the platform."
      />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Users"
            value="1,847"
            change={12.4}
            icon={Users}
            color="bg-blue-600"
            subtitle="762 transporters · 1,085 clients"
          />
          <KpiCard
            title="Active Subscriptions"
            value="762"
            change={8.1}
            icon={CreditCard}
            color="bg-emerald-600"
            subtitle="€37,200 revenue this month"
          />
          <KpiCard
            title="Active Shipments"
            value="284"
            change={15.3}
            icon={Package}
            color="bg-violet-600"
            subtitle="203 completed this month"
          />
          <KpiCard
            title="Open Disputes"
            value="3"
            change={-25.0}
            icon={AlertTriangle}
            color="bg-amber-500"
            subtitle="€7,450 in dispute"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Revenue</CardTitle>
                <CardDescription>Total revenue vs. subscription revenue (last 12 months)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [`€${Number(value).toLocaleString()}`, '']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} name="Total Revenue" />
                    <Line type="monotone" dataKey="subscriptions" stroke="#10b981" strokeWidth={2} dot={false} name="Subscriptions" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subscription Distribution</CardTitle>
              <CardDescription>762 total active subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={subscriptionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {subscriptionDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [Number(value), 'subscriptions']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {subscriptionDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">New Registrations (7 days)</CardTitle>
              <CardDescription>New transporters and clients registered</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={registrationsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="transporters" fill="#3b82f6" name="Transporters" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="clients" fill="#10b981" name="Clients" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Completed vs Cancelled Shipments</CardTitle>
              <CardDescription>Last 5 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={shipmentsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Recent Registrations</CardTitle>
                  <CardDescription>Latest accounts created</CardDescription>
                </div>
                <a href="/admin/users" className="text-xs text-blue-600 hover:underline font-medium">
                  View all →
                </a>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {recentRegistrations.map((reg) => (
                    <div key={reg.id} className="flex items-center justify-between px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold ${reg.type === 'transporter' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                          {reg.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{reg.name}</p>
                          <p className="text-xs text-gray-500">
                            {reg.type === 'transporter' ? 'Transporter' : 'Client'} · {reg.country} · {formatDate(reg.date)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        reg.status === 'approved' ? 'success' :
                        reg.status === 'rejected' ? 'destructive' : 'warning'
                      }>
                        {reg.status === 'approved' ? 'Approved' : reg.status === 'rejected' ? 'Rejected' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Open Disputes</CardTitle>
                <Badge variant="destructive">{openDisputes.length}</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {openDisputes.map((dispute) => (
                    <div key={dispute.id} className="px-6 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{dispute.id}</p>
                          <p className="text-xs text-gray-500 truncate">{dispute.reason}</p>
                          <p className="text-xs text-gray-400">{formatDate(dispute.date)}</p>
                        </div>
                        <span className="text-xs font-bold text-red-600 shrink-0">
                          {formatCurrency(dispute.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-3 border-t border-gray-100">
                  <a href="/admin/disputes" className="text-xs text-blue-600 hover:underline font-medium">
                    Manage disputes →
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a
                  href="/admin/users?filter=pending_kyc"
                  className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 hover:bg-amber-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">Pending KYC</span>
                  </div>
                  <Badge variant="warning">12</Badge>
                </a>
                <a
                  href="/admin/subscriptions?filter=expiring"
                  className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Expiring Subscriptions</span>
                  </div>
                  <Badge variant="info">8</Badge>
                </a>
                <a
                  href="/admin/disputes"
                  className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Active Disputes</span>
                  </div>
                  <Badge variant="destructive">3</Badge>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Payments</CardTitle>
              <CardDescription>Latest processed transactions</CardDescription>
            </div>
            <a href="/admin/reports" className="text-xs text-blue-600 hover:underline font-medium">
              Full Report →
            </a>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3.5 font-mono text-xs text-gray-500">{payment.id}</td>
                    <td className="px-6 py-3.5 font-medium text-gray-900">{payment.user}</td>
                    <td className="px-6 py-3.5 text-gray-600">{payment.type}</td>
                    <td className="px-6 py-3.5 font-semibold text-gray-900">{formatCurrency(payment.amount)}</td>
                    <td className="px-6 py-3.5 text-gray-500">{formatDate(payment.date)}</td>
                    <td className="px-6 py-3.5">
                      <Badge variant={
                        payment.status === 'success' ? 'success' :
                        payment.status === 'escrow' ? 'warning' : 'info'
                      }>
                        {payment.status === 'success' ? 'Processed' :
                         payment.status === 'escrow' ? 'Escrow' : 'Released'}
                      </Badge>
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
