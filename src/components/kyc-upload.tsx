'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Upload, FileText, Trash2, CheckCircle, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { uploadKycDocument, getKycDocuments, deleteKycDocument, type KycDocument } from '@/lib/actions/kyc'
import type { DocumentType, KycStatus } from '@/lib/types'

interface KycUploadProps {
  kycStatus: KycStatus
  kycRejectionReason?: string | null
}

const KYC_DOCUMENT_TYPES: { value: DocumentType; label: string; description: string }[] = [
  { value: 'kyc_registration', label: 'Company Registration', description: 'Certificate of incorporation or business registration' },
  { value: 'kyc_license', label: 'Transport License', description: 'Valid transport/carrier license' },
  { value: 'kyc_insurance', label: 'Insurance Certificate', description: 'Liability insurance certificate' },
]

export function KycUpload({ kycStatus, kycRejectionReason }: KycUploadProps) {
  const [documents, setDocuments] = useState<KycDocument[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedType, setSelectedType] = useState<DocumentType>('kyc_registration')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    setLoading(true)
    const result = await getKycDocuments()
    if (result.success && result.data) {
      setDocuments(result.data)
    }
    setLoading(false)
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const fileInput = fileInputRef.current
    if (!fileInput?.files?.[0]) {
      setError('Please select a file')
      return
    }

    const file = fileInput.files[0]

    // Client-side validation
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF and image files (JPG, PNG) are allowed')
      return
    }

    setUploading(true)

    const formData = new FormData()
    formData.append('document_type', selectedType)
    formData.append('file', file)

    const result = await uploadKycDocument(formData)

    if (result.success && result.data) {
      setDocuments(prev => [result.data!, ...prev])
      setSuccess(`Document uploaded successfully: ${file.name}`)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } else {
      setError(result.error || 'Upload failed')
    }

    setUploading(false)
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    const result = await deleteKycDocument(documentId)

    if (result.success) {
      setDocuments(prev => prev.filter(d => d.id !== documentId))
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
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const getDocumentTypeLabel = (type: DocumentType) => {
    return KYC_DOCUMENT_TYPES.find(t => t.value === type)?.label || type
  }

  const getStatusBadge = () => {
    switch (kycStatus) {
      case 'approved':
        return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>
      default:
        return <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" />Pending Review</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">KYC Verification</CardTitle>
            <CardDescription>Upload your company documents for verification</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {kycStatus === 'rejected' && kycRejectionReason && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">KYC Rejected</p>
                <p className="text-sm text-red-700 mt-1">{kycRejectionReason}</p>
                <p className="text-xs text-red-600 mt-2">Please upload corrected documents and resubmit for review.</p>
              </div>
            </div>
          </div>
        )}

        {kycStatus === 'approved' && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">KYC Approved</p>
                <p className="text-sm text-emerald-700">Your account has been verified. You have full access to all platform features.</p>
              </div>
            </div>
          </div>
        )}

        {kycStatus === 'pending' && documents.length > 0 && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex gap-3">
              <Clock className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">Under Review</p>
                <p className="text-sm text-emerald-700">Your documents are being reviewed by our team. This usually takes 1-2 business days.</p>
              </div>
            </div>
          </div>
        )}

        {kycStatus !== 'approved' && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
            <h4 className="font-semibold text-sm text-gray-900">Upload Document</h4>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label>Document Type *</Label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as DocumentType)}
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                  disabled={uploading}
                >
                  {KYC_DOCUMENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>File (PDF or Image, max 10MB) *</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                  disabled={uploading}
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-800">{success}</p>
                </div>
              )}

              <Button type="submit" disabled={uploading} className="w-full gap-2">
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Document
                  </>
                )}
              </Button>
            </form>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-900">Uploaded Documents</h4>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-gray-300" />
              <p className="text-sm">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No documents uploaded yet</p>
              <p className="text-xs mt-1">Upload your company documents above to start the verification process</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
              {documents.map(doc => (
                <div key={doc.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 shrink-0">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{doc.file_name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="font-medium text-blue-600">{getDocumentTypeLabel(doc.type)}</span>
                          <span>•</span>
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>•</span>
                          <span>{formatDate(doc.created_at)}</span>
                        </div>
                        {doc.is_verified && (
                          <Badge variant="success" className="mt-2 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(doc.file_url, '_blank')}
                        title="View document"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      {!doc.is_verified && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(doc.id)}
                          title="Delete document"
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
        </div>

        {kycStatus === 'pending' && documents.length === 0 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Required Documents</p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Company Registration Certificate</li>
                  <li>Valid Transport/Carrier License</li>
                  <li>Liability Insurance Certificate</li>
                </ul>
                <p className="text-xs text-blue-600 mt-2">All documents must be valid and clearly readable.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
