'use client'

import { useState } from 'react'
import { Star, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

interface RatingModalProps {
  shipmentId: string
  toUserId: string
  toUserName: string
  onClose: () => void
  onSuccess: () => void
}

export function RatingModal({ shipmentId, toUserId, toUserName, onClose, onSuccess }: RatingModalProps) {
  const [stars, setStars] = useState(0)
  const [hoveredStars, setHoveredStars] = useState(0)
  const [punctuality, setPunctuality] = useState(0)
  const [communication, setCommunication] = useState(0)
  const [cargoCare, setCargoCare] = useState(0)
  const [documentation, setDocumentation] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()

  const handleSubmit = async () => {
    if (stars === 0) {
      alert('Please select a star rating')
      return
    }

    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('You must be logged in to submit a review')
        return
      }

      const { error } = await supabase
        .from('ratings')
        .insert({
          shipment_id: shipmentId,
          from_user_id: user.id,
          to_user_id: toUserId,
          stars,
          review_text: reviewText || null,
          punctuality: punctuality || null,
          communication: communication || null,
          cargo_care: cargoCare || null,
          documentation: documentation || null,
        })

      if (error) {
        if (error.code === '23505') {
          alert('You have already submitted a review for this shipment')
        } else {
          console.error('Error submitting review:', error)
          alert('Error submitting review. Please try again.')
        }
        return
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Error submitting review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (val: number) => void; label?: string }) => {
    const [hovered, setHovered] = useState(0)

    return (
      <div className="space-y-1">
        {label && <Label className="text-sm text-gray-700">{label}</Label>}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  i <= (hovered || value)
                    ? 'fill-emerald-400 text-emerald-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          {value > 0 && <span className="ml-2 text-sm text-gray-600">{value}/5</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Rate Experience</h2>
            <p className="text-sm text-gray-500">Share your feedback with {toUserName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overall Rating */}
          <div>
            <Label className="text-base font-semibold text-gray-900 mb-3 block">Overall Rating *</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStars(i)}
                  onMouseEnter={() => setHoveredStars(i)}
                  onMouseLeave={() => setHoveredStars(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      i <= (hoveredStars || stars)
                        ? 'fill-emerald-400 text-emerald-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {stars > 0 && <span className="ml-3 text-lg font-semibold text-gray-900">{stars}/5</span>}
            </div>
          </div>

          {/* Category Ratings */}
          <div className="border-t border-gray-200 pt-6">
            <Label className="text-base font-semibold text-gray-900 mb-4 block">Detailed Ratings (Optional)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StarRating value={punctuality} onChange={setPunctuality} label="Punctuality" />
              <StarRating value={communication} onChange={setCommunication} label="Communication" />
              <StarRating value={cargoCare} onChange={setCargoCare} label="Cargo Care" />
              <StarRating value={documentation} onChange={setDocumentation} label="Documentation" />
            </div>
          </div>

          {/* Review Text */}
          <div className="border-t border-gray-200 pt-6">
            <Label className="text-base font-semibold text-gray-900 mb-2 block">Your Review (Optional)</Label>
            <Textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Share your experience with this shipment..."
              className="min-h-[120px] resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-gray-400 mt-1">{reviewText.length}/1000 characters</p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || stars === 0}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
