'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult, DocumentType } from '@/lib/types'
import { sendTemplateEmail } from '@/lib/emails'

export interface KycDocument {
  id: string
  user_id: string
  type: DocumentType
  file_name: string
  file_url: string
  file_size: number
  mime_type: string
  is_verified: boolean
  rejection_reason: string | null
  created_at: string
}

/**
 * Upload KYC document for current user
 */
export async function uploadKycDocument(formData: FormData): Promise<ActionResult<KycDocument>> {
  // Use regular client for authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Use admin client for database operations to bypass RLS
  const supabaseAdmin = await createAdminClient()

  const documentType = formData.get('document_type') as DocumentType
  const file = formData.get('file') as File

  if (!documentType || !file) {
    return { success: false, error: 'Missing required fields' }
  }

  // Validate document type is KYC
  const kycTypes: DocumentType[] = ['kyc_registration', 'kyc_license', 'kyc_insurance']
  if (!kycTypes.includes(documentType)) {
    return { success: false, error: 'Invalid KYC document type' }
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: 'File size must be less than 10MB' }
  }

  // Validate file type (PDF, images)
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Only PDF and image files are allowed' }
  }

  try {
    // Upload file to Supabase Storage using admin client
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`
    const filePath = `kyc-documents/${fileName}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, error: `Upload failed: ${uploadError.message}` }
    }

    // Get public URL (bucket is public)
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('documents')
      .getPublicUrl(filePath)

    // Save document metadata to database using admin client (bypasses RLS)
    const { data: document, error: dbError } = await supabaseAdmin
      .from('documents')
      .insert({
        user_id: user.id,
        shipment_id: null, // KYC documents don't have shipment_id
        type: documentType,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        is_verified: false
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Cleanup uploaded file
      await supabaseAdmin.storage.from('documents').remove([filePath])
      return { success: false, error: `Database error: ${dbError.message}` }
    }

    revalidatePath('/dashboard/client/settings')
    revalidatePath('/dashboard/transporter/settings')
    revalidatePath('/admin/users')

    return { success: true, data: document }
  } catch (error) {
    console.error('Upload KYC document error:', error)
    return { success: false, error: 'Failed to upload document' }
  }
}

/**
 * Get KYC documents for current user
 */
export async function getKycDocuments(): Promise<ActionResult<KycDocument[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const supabaseAdmin = await createAdminClient()

  const { data: documents, error } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .in('type', ['kyc_registration', 'kyc_license', 'kyc_insurance'])
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: documents || [] }
}

/**
 * Get KYC documents for specific user (admin only)
 */
export async function getUserKycDocuments(userId: string): Promise<ActionResult<KycDocument[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Unauthorized - admin only' }
  }

  try {
    const supabaseAdmin = await createAdminClient()

    const { data: documents, error } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .in('type', ['kyc_registration', 'kyc_license', 'kyc_insurance'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get user KYC documents error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: documents || [] }
  } catch (error) {
    console.error('Get user KYC documents error:', error)
    return { success: false, error: 'Failed to fetch documents' }
  }
}

/**
 * Approve KYC for user (admin only)
 */
export async function approveKyc(userId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Unauthorized - admin only' }
  }

  try {
    // Get user profile for email
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('email, full_name, company_name, role')
      .eq('id', userId)
      .single()

    // Update user KYC status to approved
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        kyc_status: 'approved',
        kyc_rejection_reason: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Approve KYC error:', updateError)
      return { success: false, error: updateError.message }
    }

    // Mark all KYC documents as verified
    const { error: docsError } = await supabase
      .from('documents')
      .update({ is_verified: true })
      .eq('user_id', userId)
      .in('type', ['kyc_registration', 'kyc_license', 'kyc_insurance'])

    if (docsError) {
      console.error('Update documents error:', docsError)
    }

    // Send KYC approval email
    if (userProfile?.email) {
      try {
        await sendTemplateEmail(
          userProfile.email,
          'kyc_approved',
          {
            recipientName: userProfile.full_name || userProfile.company_name || 'User',
            companyName: userProfile.company_name || '',
            role: userProfile.role || 'client',
          }
        )
      } catch (emailError) {
        console.error('Failed to send KYC approval email:', emailError)
      }
    }

    revalidatePath('/admin/users')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Approve KYC error:', error)
    return { success: false, error: 'Failed to approve KYC' }
  }
}

/**
 * Reject KYC for user (admin only)
 */
export async function rejectKyc(userId: string, reason: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Unauthorized - admin only' }
  }

  if (!reason || reason.trim().length === 0) {
    return { success: false, error: 'Rejection reason is required' }
  }

  try {
    // Get user profile for email
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('email, full_name, company_name')
      .eq('id', userId)
      .single()

    // Update user KYC status to rejected with reason
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        kyc_status: 'rejected',
        kyc_rejection_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Reject KYC error:', updateError)
      return { success: false, error: updateError.message }
    }

    // Send KYC rejection email
    if (userProfile?.email) {
      try {
        await sendTemplateEmail(
          userProfile.email,
          'kyc_rejected',
          {
            recipientName: userProfile.full_name || userProfile.company_name || 'User',
            rejectionReason: reason,
          }
        )
      } catch (emailError) {
        console.error('Failed to send KYC rejection email:', emailError)
      }
    }

    revalidatePath('/admin/users')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Reject KYC error:', error)
    return { success: false, error: 'Failed to reject KYC' }
  }
}

/**
 * Delete KYC document (user can delete their own pending documents)
 */
export async function deleteKycDocument(documentId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  try {
    // Get document to verify ownership and get file path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (fetchError || !document) {
      return { success: false, error: 'Document not found' }
    }

    // Check ownership
    if (document.user_id !== user.id) {
      return { success: false, error: 'Unauthorized - not your document' }
    }

    // Don't allow deletion of verified documents
    if (document.is_verified) {
      return { success: false, error: 'Cannot delete verified documents' }
    }

    // Delete from storage
    const filePath = document.file_url.split('/documents/').pop()
    if (filePath) {
      await supabase.storage.from('documents').remove([filePath])
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) {
      console.error('Delete document error:', deleteError)
      return { success: false, error: deleteError.message }
    }

    revalidatePath('/dashboard/client/settings')
    revalidatePath('/dashboard/transporter/settings')

    return { success: true }
  } catch (error) {
    console.error('Delete KYC document error:', error)
    return { success: false, error: 'Failed to delete document' }
  }
}
