import { Resend } from 'resend'
import { render } from '@react-email/components'
import {
  OfferNewEmail,
  OfferAcceptedEmail,
  OfferExpiredEmail,
  KycApprovedEmail,
  KycRejectedEmail,
  ShipmentConfirmedEmail,
  ShipmentPickedUpEmail,
  ShipmentDeliveredEmail,
  ShipmentNewAvailableEmail,
  MessageNewEmail,
  SubscriptionExpiringEmail,
  TruckNewAvailableEmail,
  StatusUpdateReminderEmail,
} from '@/emails'

const resend = new Resend(process.env.RESEND_API_KEY)

export type EmailType =
  | 'offer_new'
  | 'offer_accepted'
  | 'offer_expired'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'shipment_confirmed'
  | 'shipment_picked_up'
  | 'shipment_delivered'
  | 'shipment_new_available'
  | 'message_new'
  | 'subscription_expiring'
  | 'truck_new_available'
  | 'status_update_reminder'

export interface EmailData {
  [key: string]: any
}

export async function renderEmailTemplate(emailType: EmailType, data: EmailData): Promise<string> {
  let emailComponent

  switch (emailType) {
    case 'offer_new':
      emailComponent = OfferNewEmail(data as any)
      break
    case 'offer_accepted':
      emailComponent = OfferAcceptedEmail(data as any)
      break
    case 'offer_expired':
      emailComponent = OfferExpiredEmail(data as any)
      break
    case 'kyc_approved':
      emailComponent = KycApprovedEmail(data as any)
      break
    case 'kyc_rejected':
      emailComponent = KycRejectedEmail(data as any)
      break
    case 'shipment_confirmed':
      emailComponent = ShipmentConfirmedEmail(data as any)
      break
    case 'shipment_picked_up':
      emailComponent = ShipmentPickedUpEmail(data as any)
      break
    case 'shipment_delivered':
      emailComponent = ShipmentDeliveredEmail(data as any)
      break
    case 'shipment_new_available':
      emailComponent = ShipmentNewAvailableEmail(data as any)
      break
    case 'message_new':
      emailComponent = MessageNewEmail(data as any)
      break
    case 'subscription_expiring':
      emailComponent = SubscriptionExpiringEmail(data as any)
      break
    case 'truck_new_available':
      emailComponent = TruckNewAvailableEmail(data as any)
      break
    case 'status_update_reminder':
      emailComponent = StatusUpdateReminderEmail(data as any)
      break
    default:
      throw new Error(`Unknown email type: ${emailType}`)
  }

  return await render(emailComponent)
}

export function getEmailSubject(emailType: EmailType, data: EmailData): string {
  switch (emailType) {
    case 'offer_new':
      return `New offer received for your shipment - ${data.currency} ${data.price}`
    case 'offer_accepted':
      return `Congratulations! Your offer has been accepted - ${data.currency} ${data.price}`
    case 'offer_expired':
      return `Your offer has expired - ${data.route}`
    case 'kyc_approved':
      return 'Account Verified - Welcome to Trade Container'
    case 'kyc_rejected':
      return 'Action Required: KYC Verification Issue'
    case 'shipment_confirmed':
      return `Shipment Confirmed - ${data.route}`
    case 'shipment_picked_up':
      return `Container Picked Up - ${data.route}`
    case 'shipment_delivered':
      return 'Container Delivered Successfully!'
    case 'shipment_new_available':
      return `New shipment available: ${data.route}`
    case 'message_new':
      return `New message from ${data.senderName}`
    case 'subscription_expiring':
      return `Your subscription expires in ${data.daysRemaining} days`
    case 'truck_new_available':
      return `New truck available: ${data.route}`
    case 'status_update_reminder':
      return `Reminder: Update shipment status - ${data.route}`
    default:
      return 'Notification from Trade Container'
  }
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Trade Container <noreply@tradecontainer.eu>',
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error: any) {
    console.error('Email send error:', error)
    return { success: false, error: error.message }
  }
}

export async function sendTemplateEmail(
  to: string,
  emailType: EmailType,
  data: EmailData
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const subject = getEmailSubject(emailType, data)
    const html = await renderEmailTemplate(emailType, data)
    
    return await sendEmail(to, subject, html)
  } catch (error: any) {
    console.error('Template email error:', error)
    return { success: false, error: error.message }
  }
}
