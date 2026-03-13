import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { priceId, userId, email } = await request.json()

    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing priceId' },
        { status: 400 }
      )
    }

    let customerId: string | undefined
    let customerEmail: string | undefined

    // If user is authenticated, get their profile
    if (userId) {
      const supabase = await createClient()
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name, stripe_customer_id')
        .eq('id', userId)
        .single()

      if (profile) {
        customerId = profile.stripe_customer_id || undefined
        customerEmail = profile.email

        // Create Stripe customer if doesn't exist
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: profile.email,
            name: profile.full_name || undefined,
            metadata: {
              supabase_user_id: userId,
            },
          })

          customerId = customer.id

          await supabase
            .from('profiles')
            .update({ stripe_customer_id: customerId })
            .eq('id', userId)
        }
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : (email || undefined),
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/register?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing`,
      metadata: {
        user_id: userId || 'guest',
        price_id: priceId,
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
