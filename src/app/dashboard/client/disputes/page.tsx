'use client'

import { ClientHeader } from '@/components/client/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, PlusCircle, MessageSquare } from 'lucide-react'

const mockDisputes = [
  { id: 'DIS-001', shipmentId: 'SHP-1835', transporter: 'Fast Logistics SA', reason: 'Damaged cargo', amount: 3200, status: 'in_review', date: '2026-02-17' },
]

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'secondary' }> = {
  open: { label: 'Open', variant: 'warning' },
  in_review: { label: 'In Review', variant: 'info' },
  resolved: { label: 'Resolved', variant: 'success' },
  closed: { label: 'Closed', variant: 'secondary' },
}

export default function ClientDisputesPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <ClientHeader title="Disputes" subtitle="Manage your open disputes" />
      <main className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">My Disputes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {mockDisputes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <AlertTriangle className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No disputes</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {mockDisputes.map(d => {
                  const cfg = statusConfig[d.status]
                  return (
                    <div key={d.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-gray-500">{d.id}</span>
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{d.reason}</p>
                        <p className="text-xs text-gray-400">{d.transporter} · {d.shipmentId} · {d.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">€{d.amount.toLocaleString()}</p>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 mt-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
