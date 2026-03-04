'use server'

import { createClient } from '@/lib/supabase/server'
import { sendTemplateEmail, EmailType, EmailData } from '@/lib/emails'

export async function queueEmail(
  userId: string,
  emailType: EmailType,
  templateData: EmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name, company_name')
      .eq('id', userId)
      .single()
    
    if (profileError || !profile) {
      return { success: false, error: 'User not found' }
    }

    const { data: preferences } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    const prefKey = `email_${emailType.replace(/_/g, '_')}` as keyof typeof preferences
    if (preferences && preferences[prefKey] === false) {
      return { success: true }
    }

    const subject = getSubjectForType(emailType, templateData)
    
    const { error: queueError } = await supabase
      .from('email_queue')
      .insert({
        user_id: userId,
        email_type: emailType,
        recipient_email: profile.email,
        subject,
        template_data: templateData,
        status: 'pending',
      })
    
    if (queueError) {
      console.error('Queue email error:', queueError)
      return { success: false, error: queueError.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Queue email error:', error)
    return { success: false, error: error.message }
  }
}

export async function processEmailQueue(limit: number = 100): Promise<{
  success: boolean
  processed: number
  failed: number
}> {
  try {
    const supabase = await createClient()
    
    const { data: emails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('attempts', 3)
      .order('created_at', { ascending: true })
      .limit(limit)
    
    if (fetchError || !emails) {
      return { success: false, processed: 0, failed: 0 }
    }

    let processed = 0
    let failed = 0

    for (const email of emails) {
      try {
        const result = await sendTemplateEmail(
          email.recipient_email,
          email.email_type as EmailType,
          email.template_data as EmailData
        )

        if (result.success) {
          await supabase
            .from('email_queue')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
            })
            .eq('id', email.id)
          
          processed++
        } else {
          await supabase
            .from('email_queue')
            .update({
              attempts: email.attempts + 1,
              error_message: result.error,
              status: email.attempts + 1 >= 3 ? 'failed' : 'pending',
            })
            .eq('id', email.id)
          
          failed++
        }
      } catch (error: any) {
        await supabase
          .from('email_queue')
          .update({
            attempts: email.attempts + 1,
            error_message: error.message,
            status: email.attempts + 1 >= 3 ? 'failed' : 'pending',
          })
          .eq('id', email.id)
        
        failed++
      }
    }

    return { success: true, processed, failed }
  } catch (error: any) {
    console.error('Process email queue error:', error)
    return { success: false, processed: 0, failed: 0 }
  }
}

export async function getEmailPreferences(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('email_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    return {
      email_offer_new: true,
      email_offer_accepted: true,
      email_shipment_status: true,
      email_message_new: true,
      email_kyc_status: true,
      email_subscription: true,
    }
  }
  
  return data
}

export async function updateEmailPreferences(
  userId: string,
  preferences: Partial<{
    email_offer_new: boolean
    email_offer_accepted: boolean
    email_shipment_status: boolean
    email_message_new: boolean
    email_kyc_status: boolean
    email_subscription: boolean
  }>
) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('email_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString(),
    })
  
  return { success: !error, error: error?.message }
}

function getSubjectForType(emailType: EmailType, data: EmailData): string {
  switch (emailType) {
    case 'offer_new':
      return `New offer received - ${data.currency} ${data.price}`
    case 'offer_accepted':
      return `Offer accepted - ${data.currency} ${data.price}`
    case 'offer_expired':
      return `Offer expired - ${data.route}`
    case 'kyc_approved':
      return 'Account Verified'
    case 'kyc_rejected':
      return 'Action Required: KYC Verification'
    case 'shipment_confirmed':
      return `Shipment Confirmed - ${data.route}`
    case 'shipment_picked_up':
      return `Container Picked Up - ${data.route}`
    case 'shipment_delivered':
      return 'Container Delivered!'
    case 'shipment_new_available':
      return `New shipment: ${data.route}`
    case 'message_new':
      return `New message from ${data.senderName}`
    case 'subscription_expiring':
      return `Subscription expires in ${data.daysRemaining} days`
    case 'truck_new_available':
      return `New truck: ${data.route}`
    case 'status_update_reminder':
      return `Update shipment status - ${data.route}`
    default:
      return 'Notification from Trade Container'
  }
}
