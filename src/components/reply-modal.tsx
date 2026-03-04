'use client'

import { useState } from 'react'
import { X, Loader2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

interface ReplyModalProps {
  ratingId: string
  reviewerName: string
  onClose: () => void
  onSuccess: () => void
}

export function ReplyModal({ ratingId, reviewerName, onClose, onSuccess }: ReplyModalProps) {
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async () => {
    if (!replyText.trim()) {
      setError('Please enter a reply')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('ratings')
        .update({
          reply: replyText.trim(),
          reply_at: new Date().toISOString(),
        })
        .eq('id', ratingId)

      if (updateError) {
        console.error('Error submitting reply:', updateError)
        setError('Error submitting reply. Please try again.')
        setSubmitting(false)
        return
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error submitting reply:', error)
      setError('Error submitting reply. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">Reply to Review</h2>
              <p className="text-sm text-gray-500">Respond to {reviewerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <Label className="text-base font-semibold text-gray-900 mb-2 block">Your Reply</Label>
            <Textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Thank you for your feedback! We appreciate your business..."
              className="min-h-[150px] resize-none"
              maxLength={500}
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-1">{replyText.length}/500 characters</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Your reply will be visible to everyone viewing this review. 
              Be professional and courteous in your response.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !replyText.trim()}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                Submit Reply
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
