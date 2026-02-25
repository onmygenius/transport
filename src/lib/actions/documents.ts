'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult, ShipmentDocument, DocumentType } from '@/lib/types'

export interface UploadDocumentData {
  shipment_id: string
  document_type: DocumentType
  file: File
  notes?: string
}

export async function uploadDocument(formData: FormData): Promise<ActionResult<ShipmentDocument>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) return { success: false, error: 'Profile not found' }

  const shipmentId = formData.get('shipment_id') as string
  const documentType = formData.get('document_type') as DocumentType
  const notes = formData.get('notes') as string | null
  const file = formData.get('file') as File

  if (!shipmentId || !documentType || !file) {
    return { success: false, error: 'Missing required fields' }
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: 'File size must be less than 10MB' }
  }

  // Validate file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Only PDF, JPG, and PNG files are allowed' }
  }

  // Verify user has access to this shipment
  const { data: shipment } = await supabase
    .from('shipments')
    .select('client_id, transporter_id, status')
    .eq('id', shipmentId)
    .single()

  if (!shipment) return { success: false, error: 'Shipment not found' }

  // Check permissions based on role
  if (profile.role === 'client' && shipment.client_id !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  if (profile.role === 'transporter') {
    if (shipment.transporter_id !== user.id) {
      return { success: false, error: 'Not authorized - shipment not accepted' }
    }
    if (!['confirmed', 'in_transit', 'delivered', 'completed'].includes(shipment.status)) {
      return { success: false, error: 'Not authorized - shipment not confirmed' }
    }
  }

  // Generate unique file name
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${shipmentId}/${fileName}`

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('shipment-documents')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false
    })

  if (uploadError) {
    return { success: false, error: `Upload failed: ${uploadError.message}` }
  }

  // Create document record in database
  const { data: document, error: dbError } = await supabase
    .from('shipment_documents')
    .insert({
      shipment_id: shipmentId,
      uploaded_by: user.id,
      uploaded_by_role: profile.role,
      document_type: documentType,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      notes: notes || null,
      status: 'pending'
    })
    .select()
    .single()

  if (dbError) {
    // Cleanup: delete uploaded file if database insert fails
    await supabase.storage.from('shipment-documents').remove([filePath])
    return { success: false, error: `Database error: ${dbError.message}` }
  }

  revalidatePath(`/dashboard/client/shipments/${shipmentId}`)
  revalidatePath(`/dashboard/transporter/shipments/${shipmentId}`)
  revalidatePath('/dashboard/client/documents')
  revalidatePath('/dashboard/transporter/jobs')

  return { success: true, data: document as ShipmentDocument }
}

export async function getShipmentDocuments(shipmentId: string): Promise<ActionResult<ShipmentDocument[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('shipment_documents')
    .select(`
      *,
      uploader:profiles!shipment_documents_uploaded_by_fkey(
        id,
        full_name,
        company_name,
        role
      )
    `)
    .eq('shipment_id', shipmentId)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }

  return { success: true, data: data as ShipmentDocument[] }
}

export async function downloadDocument(documentId: string): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Get document details
  const { data: document } = await supabase
    .from('shipment_documents')
    .select('file_path, shipment_id')
    .eq('id', documentId)
    .single()

  if (!document) return { success: false, error: 'Document not found' }

  // Verify user has access (RLS will handle this, but double-check)
  const { data: shipment } = await supabase
    .from('shipments')
    .select('client_id, transporter_id')
    .eq('id', document.shipment_id)
    .single()

  if (!shipment) return { success: false, error: 'Shipment not found' }

  if (shipment.client_id !== user.id && shipment.transporter_id !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  // Generate signed URL (valid for 1 hour)
  const { data: urlData, error: urlError } = await supabase.storage
    .from('shipment-documents')
    .createSignedUrl(document.file_path, 3600)

  if (urlError || !urlData) {
    return { success: false, error: 'Failed to generate download URL' }
  }

  return { success: true, data: { url: urlData.signedUrl } }
}

export async function deleteDocument(documentId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Get document details
  const { data: document } = await supabase
    .from('shipment_documents')
    .select('file_path, uploaded_by, shipment_id')
    .eq('id', documentId)
    .single()

  if (!document) return { success: false, error: 'Document not found' }

  // Only uploader can delete
  if (document.uploaded_by !== user.id) {
    return { success: false, error: 'Not authorized - only uploader can delete' }
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('shipment-documents')
    .remove([document.file_path])

  if (storageError) {
    return { success: false, error: `Storage deletion failed: ${storageError.message}` }
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('shipment_documents')
    .delete()
    .eq('id', documentId)

  if (dbError) {
    return { success: false, error: `Database deletion failed: ${dbError.message}` }
  }

  revalidatePath(`/dashboard/client/shipments/${document.shipment_id}`)
  revalidatePath(`/dashboard/transporter/shipments/${document.shipment_id}`)
  revalidatePath('/dashboard/client/documents')
  revalidatePath('/dashboard/transporter/jobs')

  return { success: true }
}

export async function updateDocumentStatus(
  documentId: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Get document details
  const { data: document } = await supabase
    .from('shipment_documents')
    .select('shipment_id')
    .eq('id', documentId)
    .single()

  if (!document) return { success: false, error: 'Document not found' }

  // Verify user is the client (only client can approve/reject)
  const { data: shipment } = await supabase
    .from('shipments')
    .select('client_id')
    .eq('id', document.shipment_id)
    .single()

  if (!shipment || shipment.client_id !== user.id) {
    return { success: false, error: 'Not authorized - only client can approve/reject' }
  }

  // Update status
  const { error } = await supabase
    .from('shipment_documents')
    .update({
      status,
      rejection_reason: status === 'rejected' ? rejectionReason : null
    })
    .eq('id', documentId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/dashboard/client/shipments/${document.shipment_id}`)
  revalidatePath(`/dashboard/transporter/shipments/${document.shipment_id}`)

  return { success: true }
}
