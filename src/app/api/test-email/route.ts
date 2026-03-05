import { NextResponse } from 'next/server'
import { sendTemplateEmail } from '@/lib/emails'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required. Usage: /api/test-email?email=your@email.com' },
        { status: 400 }
      )
    }

    const result = await sendTemplateEmail(
      email,
      'kyc_approved',
      {
        recipientName: 'Test User',
        companyName: 'Test Company Ltd',
        role: 'client',
      }
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully!',
        messageId: result.messageId,
        sentTo: email,
        template: 'kyc_approved',
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
