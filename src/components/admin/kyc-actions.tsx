'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UserCheck, UserX, Loader2, X } from 'lucide-react'
import { approveKyc, rejectKyc } from '@/lib/actions/kyc'
import { useRouter } from 'next/navigation'

interface KycActionsProps {
  userId: string
  userName: string
  onSuccess?: () => void
}

export function KycActions({ userId, userName, onSuccess }: KycActionsProps) {
  const router = useRouter()
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async () => {
    if (!confirm(`Are you sure you want to approve KYC for ${userName}?`)) return

    setApproving(true)
    setError(null)

    const result = await approveKyc(userId)

    if (result.success) {
      alert(`KYC approved successfully for ${userName}`)
      if (onSuccess) onSuccess()
      router.refresh()
    } else {
      setError(result.error || 'Failed to approve KYC')
      alert(result.error || 'Failed to approve KYC')
    }

    setApproving(false)
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required')
      return
    }

    setRejecting(true)
    setError(null)

    const result = await rejectKyc(userId, rejectionReason)

    if (result.success) {
      alert(`KYC rejected for ${userName}`)
      setShowRejectDialog(false)
      setRejectionReason('')
      if (onSuccess) onSuccess()
      router.refresh()
    } else {
      setError(result.error || 'Failed to reject KYC')
    }

    setRejecting(false)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
        title="Approve KYC"
        onClick={handleApprove}
        disabled={approving}
      >
        {approving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <UserCheck className="h-3.5 w-3.5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
        title="Reject KYC"
        onClick={() => setShowRejectDialog(true)}
        disabled={rejecting}
      >
        <UserX className="h-3.5 w-3.5" />
      </Button>

      {showRejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Reject KYC Verification</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    setShowRejectDialog(false)
                    setRejectionReason('')
                    setError(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Please provide a reason for rejecting {userName}'s KYC verification. This will be visible to the user.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason *</Label>
                <Textarea
                  id="reason"
                  placeholder="e.g., Documents are not clear, missing transport license, expired insurance certificate..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px]"
                  disabled={rejecting}
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectDialog(false)
                    setRejectionReason('')
                    setError(null)
                  }}
                  disabled={rejecting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={rejecting || !rejectionReason.trim()}
                >
                  {rejecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    'Reject KYC'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
