import { NextResponse } from 'next/server'
import { sendTemplateEmail } from '@/lib/emails'

export async function POST(request: Request) {
  try {
    const { email, fullName, companyName, role } = await request.json()

    if (!email || !fullName) {
      return NextResponse.json(
        { error: 'Email and fullName are required' },
        { status: 400 }
      )
    }

    const result = await sendTemplateEmail(
      email,
      'kyc_approved',
      {
        recipientName: fullName,
        companyName: companyName || '',
        role: role || 'client',
      }
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Welcome email sent successfully',
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Failed to send welcome email:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
