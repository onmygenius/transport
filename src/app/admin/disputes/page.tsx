'use client'

import { AdminHeader } from '@/components/admin/header'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function DisputesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Dispute Management" subtitle="Manage disputes between clients and transporters" />

      <main className="flex-1 p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-24">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Dispute System Not Implemented</h3>
            <p className="text-sm text-gray-500 text-center max-w-md">
              The dispute management system is not yet available. This feature will be implemented in a future update.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
