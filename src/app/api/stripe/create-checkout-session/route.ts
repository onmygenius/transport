import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { priceId } = await request.json()

    console.log('🔍 CREATE CHECKOUT SESSION - Received priceId:', priceId)

    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing priceId' },
        { status: 400 }
      )
    }

    // Get user profile and role
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    let customerId: string | undefined

    // Check if customer already exists in client_profiles or transporter_profiles
    if (profile.role === 'client') {
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('stripe_customer_id')
        .eq('profile_id', user.id)
        .single()

      customerId = clientProfile?.stripe_customer_id || undefined
    } else if (profile.role === 'transporter') {
      const { data: transporterProfile } = await supabase
        .from('transporter_profiles')
        .select('stripe_account_id')
        .eq('profile_id', user.id)
        .single()

      customerId = transporterProfile?.stripe_account_id || undefined
    }

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.full_name || undefined,
        metadata: {
          supabase_user_id: user.id,
          role: profile.role,
        },
      })

      customerId = customer.id

      // Save customer ID to appropriate table
      if (profile.role === 'client') {
        await supabase
          .from('client_profiles')
          .upsert({
            profile_id: user.id,
            stripe_customer_id: customerId,
          }, {
            onConflict: 'profile_id'
          })
      } else if (profile.role === 'transporter') {
        await supabase
          .from('transporter_profiles')
          .upsert({
            profile_id: user.id,
            stripe_account_id: customerId,
          }, {
            onConflict: 'profile_id'
          })
      }
    }

    // Determine success URL based on role
    const dashboardUrl = profile.role === 'client' 
      ? '/dashboard/client/subscription'
      : '/dashboard/transporter/subscription'

    // Create checkout session - NO TRIAL, user pays immediately
    const sessionConfig: any = {
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}${dashboardUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}${dashboardUrl}`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        role: profile.role,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          role: profile.role,
        },
      },
      allow_promotion_codes: true,
    }

    console.log('🔍 Creating Stripe checkout session with config:', {
      priceId,
      customerId,
      mode: sessionConfig.mode,
      userId: user.id,
      role: profile.role
    })

    const session = await stripe.checkout.sessions.create(sessionConfig)

    console.log('✅ Checkout session created successfully:', session.id)

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('❌ Stripe checkout error:', error)
    console.error('❌ Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      raw: error.raw
    })
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
