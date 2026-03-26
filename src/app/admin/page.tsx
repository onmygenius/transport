'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import {
  Users, TrendingUp, Package, CreditCard, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Truck, CheckCircle, Clock, XCircle, Loader2
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'

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

const kycLabels: Record<string, { label: string; variant: 'warning' | 'success' | 'destructive' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
}

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
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    transporters: 0,
    clients: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    activeShipments: 0,
    completedShipments: 0,
    openDisputes: 0,
  })
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setLoading(true)
    
    // Load users count
    const { data: profiles, count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .neq('role', 'admin')
    
    const transporters = profiles?.filter(p => p.role === 'transporter').length || 0
    const clients = profiles?.filter(p => p.role === 'client').length || 0
    
    // Load subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
    
    const activeSubscriptions = subscriptions?.length || 0
    const monthlyRevenue = subscriptions?.reduce((sum, sub) => sum + (sub.price || 0), 0) || 0
    
    // Load shipments
    const { data: shipments } = await supabase
      .from('shipments')
      .select('*')
    
    const activeShipments = shipments?.filter(s => ['pending', 'confirmed', 'picked_up', 'in_transit'].includes(s.status)).length || 0
    const completedShipments = shipments?.filter(s => s.status === 'completed').length || 0
    
    // Load recent registrations
    const { data: recentProfiles } = await supabase
      .from('profiles')
      .select('*')
      .neq('role', 'admin')
      .order('created_at', { ascending: false })
      .limit(5)
    
    setStats({
      totalUsers: totalUsers || 0,
      transporters,
      clients,
      activeSubscriptions,
      monthlyRevenue,
      activeShipments,
      completedShipments,
      openDisputes: 0,
    })
    
    setRecentRegistrations(recentProfiles || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <AdminHeader title="Dashboard" subtitle="Welcome back! Here's what's happening on the platform." />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening on the platform."
      />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            title="Total Users"
            value={stats.totalUsers.toString()}
            change={0}
            icon={Users}
            color="bg-blue-600"
            subtitle={`${stats.transporters} transporters · ${stats.clients} clients`}
          />
          <KpiCard
            title="Active Subscriptions"
            value={stats.activeSubscriptions.toString()}
            change={0}
            icon={CreditCard}
            color="bg-emerald-600"
            subtitle={`${formatCurrency(stats.monthlyRevenue)} revenue`}
          />
          <KpiCard
            title="Active Shipments"
            value={stats.activeShipments.toString()}
            change={0}
            icon={Package}
            color="bg-violet-600"
            subtitle={`${stats.completedShipments} completed`}
          />
        </div>

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
                  {recentRegistrations.length > 0 ? (
                    recentRegistrations.map((reg) => (
                      <div key={reg.id} className="flex items-center justify-between px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold ${reg.role === 'transporter' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                            {(reg.company_name || reg.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{reg.company_name || reg.email}</p>
                            <p className="text-xs text-gray-500">
                              {reg.role === 'transporter' ? 'Transporter' : 'Client'} · {reg.company_country || '-'} · {formatDate(reg.created_at)}
                            </p>
                          </div>
                        </div>
                        <Badge variant={kycLabels[reg.kyc_status]?.variant || 'warning'}>
                          {kycLabels[reg.kyc_status]?.label || reg.kyc_status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-gray-500">
                      <p className="text-sm">No recent registrations</p>
                    </div>
                  )}
                </div>
              </CardContent>
        </Card>

        {/* Monthly Revenue Chart */}
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

        {/* Shipment Stats & User Growth */}
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

        {/* Top Transporters */}
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
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-emerald-100 text-emerald-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{t.name}</td>
                    <td className="px-6 py-4 text-gray-700">{t.shipments} shipments</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(t.revenue)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-emerald-400">★</span>
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
