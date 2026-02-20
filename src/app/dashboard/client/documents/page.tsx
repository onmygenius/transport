'use client'

import { ClientHeader } from '@/components/client/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Download, Upload, Eye } from 'lucide-react'

const mockDocs = [
  { id: 'DOC-001', shipmentId: 'SHP-1842', type: 'CMR', filename: 'CMR_SHP1842.pdf', size: '245 KB', date: '2026-02-20', status: 'verified' },
  { id: 'DOC-002', shipmentId: 'SHP-1840', type: 'Invoice', filename: 'INV_SHP1840.pdf', size: '128 KB', date: '2026-02-19', status: 'verified' },
  { id: 'DOC-003', shipmentId: 'SHP-1838', type: 'POD', filename: 'POD_SHP1838.pdf', size: '890 KB', date: '2026-02-16', status: 'verified' },
  { id: 'DOC-004', shipmentId: 'SHP-1845', type: 'Packing List', filename: 'PKG_SHP1845.pdf', size: '98 KB', date: '2026-02-20', status: 'pending' },
]

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' }> = {
  verified: { label: 'Verified', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
}

export default function ClientDocumentsPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <ClientHeader title="Documents" subtitle="View and upload shipment documents" />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex justify-end">
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Documents</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Shipment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockDocs.map(doc => {
                  const cfg = statusConfig[doc.status]
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span className="text-xs font-medium text-gray-900">{doc.filename}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-blue-600 font-semibold">{doc.shipmentId}</td>
                      <td className="px-6 py-4"><Badge variant="secondary">{doc.type}</Badge></td>
                      <td className="px-6 py-4 text-xs text-gray-500">{doc.size}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{doc.date}</td>
                      <td className="px-6 py-4"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
