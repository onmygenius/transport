'use client'

import { ClientHeader } from '@/components/client/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Download, Eye, Search } from 'lucide-react'
import { useState } from 'react'
import { downloadDocument } from '@/lib/actions/documents'

interface ShipmentDocument {
  id: string
  shipment_id: string
  uploaded_by: string
  uploaded_by_role: 'client' | 'transporter'
  document_type: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  status: string
  notes: string | null
  created_at: string
  shipment: {
    id: string
    shipment_number: string
    status: string
  }
  uploader: {
    full_name: string
  }
}

interface Props {
  documents: ShipmentDocument[]
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  'cmr': 'CMR',
  'bol': 'Bill of Lading',
  'packing_list': 'Packing List',
  'pod': 'Proof of Delivery',
  'commercial_invoice': 'Commercial Invoice',
  'customs_declaration': 'Customs Declaration',
  'insurance_certificate': 'Insurance Certificate',
  'temperature_record': 'Temperature Record',
  'weighbridge_certificate': 'Weighbridge Certificate',
  'other': 'Other',
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'secondary' }> = {
  'approved': { label: 'Approved', variant: 'success' },
  'pending': { label: 'Pending', variant: 'warning' },
  'rejected': { label: 'Rejected', variant: 'secondary' },
}

export default function ClientDocumentsClient({ documents }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [downloading, setDownloading] = useState<string | null>(null)

  const filteredDocuments = documents.filter(doc => 
    doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.shipment.shipment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    DOCUMENT_TYPE_LABELS[doc.document_type]?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDownload = async (doc: ShipmentDocument) => {
    setDownloading(doc.id)
    const result = await downloadDocument(doc.id)
    if (result.success && result.data) {
      window.open(result.data.url, '_blank')
    }
    setDownloading(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPE_LABELS[type] || type
  }

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <ClientHeader title="Documents" subtitle="View all your shipment documents" />
      
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by filename, shipment, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Documents</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">
                  {searchTerm ? 'No documents found matching your search' : 'No documents uploaded yet'}
                </p>
                <p className="text-xs mt-1 text-gray-400">
                  Documents are uploaded in individual shipment pages
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Document</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Shipment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Uploaded By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDocuments.map(doc => {
                    const statusCfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending
                    const isClientDoc = doc.uploaded_by_role === 'client'
                    
                    return (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FileText className={`h-4 w-4 shrink-0 ${isClientDoc ? 'text-cyan-500' : 'text-emerald-500'}`} />
                            <span className="text-xs font-medium text-gray-900 truncate max-w-[200px]">
                              {doc.file_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-blue-600 font-semibold">
                            {doc.shipment.shipment_number}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="text-xs">
                            {getDocumentTypeLabel(doc.document_type)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-700">{doc.uploader.full_name}</span>
                            <Badge 
                              variant={isClientDoc ? 'default' : 'success'} 
                              className="text-[10px] px-1.5 py-0"
                            >
                              {isClientDoc ? 'You' : 'Transporter'}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {formatFileSize(doc.file_size)}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {formatDate(doc.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => handleDownload(doc)}
                              disabled={downloading === doc.id}
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {documents.length > 0 && (
          <div className="text-xs text-gray-500 text-center">
            To upload new documents, go to the specific shipment page
          </div>
        )}
      </main>
    </div>
  )
}
