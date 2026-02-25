'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Upload, Download, Trash2, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { uploadDocument, getShipmentDocuments, downloadDocument, deleteDocument } from '@/lib/actions/documents'
import type { ShipmentDocument, DocumentType } from '@/lib/types'

interface ShipmentDocumentsProps {
  shipmentId: string
  userRole: 'client' | 'transporter'
  canUpload: boolean
  initialDocuments?: ShipmentDocument[]
}

const DOCUMENT_TYPES: { value: DocumentType; label: string; description: string }[] = [
  { value: 'cmr', label: 'CMR', description: 'Convention Marchandise Routière' },
  { value: 'bol', label: 'Bill of Lading', description: 'Contract of carriage' },
  { value: 'packing_list', label: 'Packing List', description: 'Cargo details' },
  { value: 'pod', label: 'Proof of Delivery', description: 'Delivery confirmation' },
  { value: 'commercial_invoice', label: 'Commercial Invoice', description: 'Invoice for goods' },
  { value: 'customs_declaration', label: 'Customs Declaration', description: 'Customs documents' },
  { value: 'insurance_certificate', label: 'Insurance Certificate', description: 'Cargo insurance' },
  { value: 'temperature_record', label: 'Temperature Record', description: 'For reefer containers' },
  { value: 'weighbridge_certificate', label: 'Weighbridge Certificate', description: 'Weight verification' },
  { value: 'other', label: 'Other', description: 'Other documents' },
]

export function ShipmentDocuments({ shipmentId, userRole, canUpload, initialDocuments = [] }: ShipmentDocumentsProps) {
  const [documents, setDocuments] = useState<ShipmentDocument[]>(initialDocuments)
  const [uploading, setUploading] = useState(false)
  const [selectedType, setSelectedType] = useState<DocumentType>('cmr')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setSuccess(null)
    setUploading(true)

    const formData = new FormData()
    formData.append('shipment_id', shipmentId)
    formData.append('document_type', selectedType)
    formData.append('file', file)
    if (notes) formData.append('notes', notes)

    const result = await uploadDocument(formData)

    if (result.success && result.data) {
      setDocuments(prev => [result.data!, ...prev])
      setSuccess(`Document uploaded successfully: ${file.name}`)
      setNotes('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } else {
      setError(result.error || 'Upload failed')
    }

    setUploading(false)
  }

  const handleDownload = async (doc: ShipmentDocument) => {
    const result = await downloadDocument(doc.id)
    if (result.success && result.data) {
      window.open(result.data.url, '_blank')
    } else {
      setError(result.error || 'Download failed')
    }
  }

  const handleDelete = async (doc: ShipmentDocument) => {
    if (!confirm(`Delete ${doc.file_name}?`)) return

    const result = await deleteDocument(doc.id)
    if (result.success) {
      setDocuments(prev => prev.filter(d => d.id !== doc.id))
      setSuccess('Document deleted successfully')
    } else {
      setError(result.error || 'Delete failed')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const getDocumentTypeLabel = (type: DocumentType) => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.label || type
  }

  const clientDocs = documents.filter(d => d.uploaded_by_role === 'client')
  const transporterDocs = documents.filter(d => d.uploaded_by_role === 'transporter')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <XCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            {success}
          </div>
        )}

        {/* Upload Section */}
        {canUpload && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
            <h4 className="font-semibold text-sm text-gray-900">Upload Document</h4>
            
            <div className="space-y-2">
              <Label>Document Type *</Label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as DocumentType)}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
              >
                {DOCUMENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Add any notes about this document..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>File (PDF, JPG, PNG - max 10MB) *</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Select File to Upload
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500">
              Accepted formats: PDF, JPG, PNG. Maximum file size: 10MB
            </p>
          </div>
        )}

        {/* Documents List */}
        <div className="space-y-4">
          {/* Client Documents */}
          {clientDocs.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">
                {userRole === 'client' ? 'Your Documents' : 'Client Documents'}
              </h4>
              {clientDocs.map(doc => (
                <div key={doc.id} className="rounded-lg border border-gray-200 p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-cyan-500 shrink-0" />
                        <p className="font-medium text-sm text-gray-900 truncate">{doc.file_name}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="font-medium text-cyan-600">{getDocumentTypeLabel(doc.document_type)}</span>
                        <span>•</span>
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>•</span>
                        <span>{formatDate(doc.created_at)}</span>
                      </div>
                      {doc.notes && (
                        <p className="text-xs text-gray-600 mt-1 italic">{doc.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        className="h-8 px-2"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {userRole === 'client' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc)}
                          className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Transporter Documents */}
          {transporterDocs.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">
                {userRole === 'transporter' ? 'Your Documents' : 'Transporter Documents'}
              </h4>
              {transporterDocs.map(doc => (
                <div key={doc.id} className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                        <p className="font-medium text-sm text-gray-900 truncate">{doc.file_name}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                        <span className="font-medium text-emerald-700">{getDocumentTypeLabel(doc.document_type)}</span>
                        <span>•</span>
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>•</span>
                        <span>{formatDate(doc.created_at)}</span>
                      </div>
                      {doc.notes && (
                        <p className="text-xs text-gray-700 mt-1 italic">{doc.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        className="h-8 px-2"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {userRole === 'transporter' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc)}
                          className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {documents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No documents uploaded yet</p>
              {canUpload && (
                <p className="text-xs mt-1">Upload your first document above</p>
              )}
            </div>
          )}

          {/* Warning for Transporter */}
          {userRole === 'transporter' && canUpload && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Important:</p>
                <p className="text-xs mt-1">
                  Please upload Proof of Delivery (POD) within 24 hours after delivery. Payment will be processed only after POD approval.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
