'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, FileText, Download, Loader2, ExternalLink } from 'lucide-react'
import { getUserKycDocuments } from '@/lib/actions/kyc'
import type { KycDocument } from '@/lib/actions/kyc'

interface KycDocumentsViewerProps {
  userId: string
  userName: string
  onClose: () => void
}

const documentTypeLabels: Record<string, string> = {
  kyc_registration: 'Company Registration',
  kyc_license: 'Transport License',
  kyc_insurance: 'Insurance Certificate'
}

export function KycDocumentsViewer({ userId, userName, onClose }: KycDocumentsViewerProps) {
  const [documents, setDocuments] = useState<KycDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDocuments()
  }, [userId])

  async function loadDocuments() {
    setLoading(true)
    setError(null)

    const result = await getUserKycDocuments(userId)

    if (result.success && result.data) {
      setDocuments(result.data)
    } else {
      setError(result.error || 'Failed to load documents')
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">KYC Documents</CardTitle>
              <CardDescription>{userName}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-3" />
              <p className="text-sm text-gray-500">Loading documents...</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {!loading && !error && documents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FileText className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No documents uploaded</p>
              <p className="text-xs">User has not uploaded any KYC documents yet</p>
            </div>
          )}

          {!loading && !error && documents.length > 0 && (
            <div className="space-y-6">
              {documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {documentTypeLabels[doc.type] || doc.type}
                        </p>
                        <p className="text-xs text-gray-500">{doc.file_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={doc.is_verified ? 'success' : 'warning'}>
                        {doc.is_verified ? 'Verified' : 'Pending'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-2"
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-2"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = doc.file_url
                          link.download = doc.file_name
                          link.click()
                        }}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-white">
                    {doc.mime_type.startsWith('image/') ? (
                      <img
                        src={doc.file_url}
                        alt={doc.file_name}
                        className="w-full h-auto max-h-96 object-contain rounded border"
                      />
                    ) : doc.mime_type === 'application/pdf' ? (
                      <div className="aspect-video bg-gray-100 rounded border flex items-center justify-center">
                        <div className="text-center">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-3">PDF Document</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(doc.file_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open PDF in new tab
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 rounded border flex items-center justify-center">
                        <div className="text-center">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {doc.file_name}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>Size: {(doc.file_size / 1024).toFixed(1)} KB</span>
                      <span>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
            </p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
