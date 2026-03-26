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
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <KpiCard
            title="Open Disputes"
            value={stats.openDisputes.toString()}
            change={0}
            icon={AlertTriangle}
            color="bg-emerald-500"
            subtitle="No disputes system yet"
          />
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
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a
                  href="/admin/users?filter=pending_kyc"
                  className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 hover:bg-emerald-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">Pending KYC</span>
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
      </main>
    </div>
  )
}
