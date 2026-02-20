'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Truck, ChevronLeft, ChevronRight, CheckCircle, Loader2 } from 'lucide-react'
import { updateShipmentStatus } from '@/lib/actions/shipments'

interface Client {
  id: string
  company_name: string | null
  full_name: string | null
}

interface Job {
  id: string
  origin_city: string
  origin_country: string
  destination_city: string
  destination_country: string
  container_type: string
  pickup_date: string
  agreed_price: number | null
  status: string
  client: Client | null
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'success' | 'secondary' | 'warning' | 'destructive' }> = {
  confirmed: { label: 'Confirmed', variant: 'default' },
  picked_up: { label: 'Picked Up', variant: 'info' },
  in_transit: { label: 'In Transit', variant: 'info' },
  delivered: { label: 'Delivered', variant: 'success' },
  completed: { label: 'Completed', variant: 'success' },
  disputed: { label: 'Disputed', variant: 'destructive' },
}

export default function TransporterJobsClient({ jobs }: { jobs: Job[] }) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [updating, setUpdating] = useState<string | null>(null)
  const perPage = 10

  const filtered = jobs.filter(j => statusFilter === 'all' || j.status === statusFilter)
  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const activeJobs = jobs.filter(j => ['confirmed', 'picked_up', 'in_transit'].includes(j.status))
  const deliveredJobs = jobs.filter(j => j.status === 'delivered')
  const completedJobs = jobs.filter(j => j.status === 'completed')
  const totalEarned = completedJobs.reduce((sum, j) => sum + (j.agreed_price ?? 0), 0)

  const handleStatusUpdate = async (jobId: string, newStatus: 'picked_up' | 'delivered') => {
    setUpdating(jobId)
    await updateShipmentStatus(jobId, newStatus)
    setUpdating(null)
    router.refresh()
  }

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <TransporterHeader title="Active Jobs" subtitle="Manage your current and past shipments" />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Active', value: activeJobs.length, color: 'bg-blue-100 text-blue-700' },
            { label: 'Delivered', value: deliveredJobs.length, color: 'bg-amber-100 text-amber-700' },
            { label: 'Completed', value: completedJobs.length, color: 'bg-emerald-100 text-emerald-700' },
            { label: 'Total Earned', value: `€${totalEarned.toLocaleString()}`, color: 'bg-violet-100 text-violet-700' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-5">
                <p className={`text-2xl font-bold rounded-lg px-2 py-1 inline-block ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">All Jobs ({jobs.length})</CardTitle>
              <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Container</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Pickup</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Earnings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map(job => {
                    const cfg = statusConfig[job.status] ?? { label: job.status, variant: 'secondary' as const }
                    const clientName = job.client?.company_name || job.client?.full_name || '—'
                    const isUpdating = updating === job.id
                    return (
                      <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{clientName}</td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-medium text-gray-900">{job.origin_city}, {job.origin_country}</p>
                          <p className="text-xs text-gray-400">→ {job.destination_city}, {job.destination_country}</p>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600">{job.container_type}</td>
                        <td className="px-6 py-4 text-xs text-gray-500">{job.pickup_date}</td>
                        <td className="px-6 py-4">
                          {job.agreed_price ? (
                            <p className="text-sm font-bold text-gray-900">€{job.agreed_price.toLocaleString()}</p>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            {job.status === 'confirmed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1"
                                disabled={isUpdating}
                                onClick={() => handleStatusUpdate(job.id, 'picked_up')}
                              >
                                {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                Picked Up
                              </Button>
                            )}
                            {job.status === 'picked_up' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1"
                                disabled={isUpdating}
                                onClick={() => handleStatusUpdate(job.id, 'delivered')}
                              >
                                {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                In Transit
                              </Button>
                            )}
                            {job.status === 'in_transit' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                disabled={isUpdating}
                                onClick={() => handleStatusUpdate(job.id, 'delivered')}
                              >
                                {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                Mark Delivered
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Truck className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">
                  {jobs.length === 0 ? 'No active jobs yet. Submit offers on available shipments.' : 'No jobs match the selected filter.'}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-xs text-gray-500">{filtered.length} jobs</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-gray-600 font-medium">Page {page} of {totalPages || 1}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
