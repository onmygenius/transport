'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Package, MapPin, Calendar, Weight, DollarSign, User, Truck, FileText, AlertTriangle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Shipment, ShipmentStatus } from '@/lib/types'
import { formatDate, formatCurrency } from '@/lib/utils'

interface ShipmentDetailsModalProps {
  shipmentId: string
  onClose: () => void
  onUpdate: () => void
}

interface ShipmentWithDetails extends Shipment {
  client_name?: string
  transporter_name?: string
  documents_count?: number
  offers_count?: number
}

const statusOptions: { value: ShipmentStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'offer_received', label: 'Offer Received' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
  { value: 'disputed', label: 'Disputed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function ShipmentDetailsModal({ shipmentId, onClose, onUpdate }: ShipmentDetailsModalProps) {
  const supabase = createClient()
  const [shipment, setShipment] = useState<ShipmentWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [newStatus, setNewStatus] = useState<ShipmentStatus>('pending')
  const [disputeResolution, setDisputeResolution] = useState('')

  useEffect(() => {
    loadShipment()
  }, [shipmentId])

  async function loadShipment() {
    setLoading(true)
    const { data } = await supabase
      .from('shipments')
      .select(`
        *,
        client:profiles!shipments_client_id_fkey(company_name, email),
        transporter:profiles!shipments_transporter_id_fkey(company_name, email)
      `)
      .eq('id', shipmentId)
      .single()

    if (data) {
      const formatted: ShipmentWithDetails = {
        ...data,
        client_name: data.client?.company_name || data.client?.email || 'Unknown',
        transporter_name: data.transporter?.company_name || data.transporter?.email || null
      }
      setShipment(formatted)
      setNewStatus(formatted.status)
    }
    setLoading(false)
  }

  async function handleUpdateStatus() {
    if (!shipment) return

    setUpdating(true)
    const { error } = await supabase
      .from('shipments')
      .update({ status: newStatus })
      .eq('id', shipmentId)

    if (!error) {
      await loadShipment()
      onUpdate()
    }
    setUpdating(false)
  }

  async function handleResolveDispute() {
    if (!shipment || !disputeResolution.trim()) return

    setUpdating(true)
    const { error } = await supabase
      .from('shipments')
      .update({ 
        status: 'completed',
        notes: `Dispute resolved: ${disputeResolution}`
      })
      .eq('id', shipmentId)

    if (!error) {
      await loadShipment()
      onUpdate()
      setDisputeResolution('')
    }
    setUpdating(false)
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this shipment? This action cannot be undone.')) return

    setDeleting(true)
    const { error } = await supabase
      .from('shipments')
      .delete()
      .eq('id', shipmentId)

    if (!error) {
      onUpdate()
      onClose()
    }
    setDeleting(false)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Card className="w-full max-w-4xl mx-4">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!shipment) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Shipment Details</CardTitle>
              <CardDescription className="font-mono">{shipment.id}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-gray-500">Client</Label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-gray-400" />
                  <p className="font-medium">{shipment.client_name}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Transporter</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Truck className="h-4 w-4 text-gray-400" />
                  <p className="font-medium">{shipment.transporter_name || 'Unassigned'}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Route</Label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <p className="text-sm">{shipment.origin_city}, {shipment.origin_country} → {shipment.destination_city}, {shipment.destination_country}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs text-gray-500">Pickup Date</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="font-medium">{formatDate(shipment.pickup_date)}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Container & Weight</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Package className="h-4 w-4 text-gray-400" />
                  <p className="text-sm">{shipment.container_type} - {shipment.cargo_weight}t</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Price</Label>
                <div className="flex items-center gap-2 mt-1">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <p className="font-medium">{shipment.agreed_price ? formatCurrency(shipment.agreed_price) : 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-sm">Admin Actions</h3>

            <div className="space-y-3">
              <div>
                <Label htmlFor="status">Update Status</Label>
                <div className="flex gap-2 mt-1">
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ShipmentStatus)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleUpdateStatus} 
                    disabled={updating || newStatus === shipment.status}
                  >
                    {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                  </Button>
                </div>
              </div>

              {shipment.status === 'disputed' && (
                <div>
                  <Label htmlFor="resolution">Resolve Dispute</Label>
                  <Textarea
                    id="resolution"
                    placeholder="Enter resolution notes..."
                    value={disputeResolution}
                    onChange={(e) => setDisputeResolution(e.target.value)}
                    className="mt-1"
                  />
                  <Button 
                    onClick={handleResolveDispute}
                    disabled={updating || !disputeResolution.trim()}
                    className="mt-2 w-full"
                    variant="default"
                  >
                    {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                    Mark as Resolved
                  </Button>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button 
                  onClick={handleDelete}
                  disabled={deleting}
                  variant="destructive"
                  className="w-full"
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Delete Shipment
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
