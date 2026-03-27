'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, Package, CreditCard, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface HistoryShipment {
  id: string
  origin_city: string
  origin_country: string
  destination_city: string
  destination_country: string
  agreed_price: number
  status: string
  updated_at: string
  client: {
    company_name: string | null
    full_name: string | null
  } | null
}

export default function TransporterHistoryPage() {
  const router = useRouter()
  const supabase = createClient()
  const [period, setPeriod] = useState('all')
  const [shipments, setShipments] = useState<HistoryShipment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('shipments')
        .select(`
          id,
          origin_city,
          origin_country,
          destination_city,
          destination_country,
          agreed_price,
          status,
          updated_at,
          client:profiles!shipments_client_id_fkey(company_name, full_name)
        `)
        .eq('transporter_id', user.id)
        .in('status', ['completed', 'cancelled'])
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching history:', error)
      } else {
        const normalized = (data || []).map(s => ({
          ...s,
          client: Array.isArray(s.client) ? s.client[0] : s.client
        }))
        setShipments(normalized)
      }

      setLoading(false)
    }

    fetchHistory()
  }, [])

  const filterByPeriod = (shipments: HistoryShipment[]) => {
    if (period === 'all') return shipments

    const now = new Date()
    const filtered = shipments.filter(s => {
      const shipmentDate = new Date(s.updated_at)
      
      if (period === 'month') {
        return shipmentDate.getMonth() === now.getMonth() && shipmentDate.getFullYear() === now.getFullYear()
      }
      if (period === 'quarter') {
        const currentQuarter = Math.floor(now.getMonth() / 3)
        const shipmentQuarter = Math.floor(shipmentDate.getMonth() / 3)
        return shipmentQuarter === currentQuarter && shipmentDate.getFullYear() === now.getFullYear()
      }
      if (period === 'year') {
        return shipmentDate.getFullYear() === now.getFullYear()
      }
      return true
    })
    return filtered
  }


  const filteredShipments = filterByPeriod(shipments)
  const completed = filteredShipments.filter(s => s.status === 'completed')
  const totalEarned = completed.reduce((s, h) => s + (h.agreed_price || 0), 0)

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <TransporterHeader title="History & Reports" subtitle="View past shipments and earnings reports" />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <TransporterHeader title="History & Reports" subtitle="View past shipments and earnings reports" />
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[
            { label: 'Total Earned', value: `€${totalEarned.toLocaleString()}`, icon: CreditCard, color: 'bg-emerald-100 text-emerald-700' },
            { label: 'Completed Shipments', value: completed.length, icon: Package, color: 'bg-blue-100 text-blue-700' },
            { label: 'Avg. Earnings per Shipment', value: `€${completed.length > 0 ? Math.round(totalEarned / completed.length).toLocaleString() : '0'}`, icon: TrendingUp, color: 'bg-violet-100 text-violet-700' },
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
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No shipments found for this period
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map(h => (
                    <tr key={h.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-gray-600">{h.id.slice(0, 8)}…</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {h.client?.company_name || h.client?.full_name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-900">{h.origin_city}, {h.origin_country}</p>
                        <p className="text-xs text-gray-400">→ {h.destination_city}, {h.destination_country}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(h.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        €{(h.agreed_price || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={h.status === 'completed' ? 'success' : 'secondary'}>
                          {h.status === 'completed' ? 'Completed' : 'Cancelled'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
