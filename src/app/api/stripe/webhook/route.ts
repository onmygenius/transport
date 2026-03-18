import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
})

const PLAN_LIMITS: Record<string, number | null> = {
  'starter': 5,
  'professional': 15,
  'enterprise': null, // unlimited
  'basic': 10,
  'growth': null, // unlimited
  'premium': null, // unlimited
}

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('⚠️ Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  console.log('✅ Webhook received:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        console.log('💳 Checkout completed:', session.id)
        console.log('📋 Session mode:', session.mode)
        console.log('📋 Session metadata:', session.metadata)
        console.log('📋 Client reference ID:', session.client_reference_id)

        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string
          console.log('🔑 Subscription ID:', subscriptionId)
          
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          console.log('📦 Subscription retrieved:', subscription.id, 'status:', subscription.status)
          
          const userId = session.metadata?.userId || session.client_reference_id
          console.log('👤 User ID:', userId)
          
          if (!userId) {
            console.error('❌ No userId in session metadata')
            break
          }

          // Determină plan type din price ID
          const priceId = subscription.items.data[0].price.id
          console.log('💰 Price ID from subscription:', priceId)
          
          let planType = 'starter'
          let planName = 'Starter'
          
          // Map price IDs to plan types
          const priceIdMap: Record<string, { type: string; name: string }> = {
            'price_1TASbp0dqWRNGixPqAoh7aKf': { type: 'starter', name: 'Starter' },
            'price_1TAScM0dqWRNGixPJ3llWAut': { type: 'growth', name: 'Growth' },
            'price_1TASci0dqWRNGixPZ5yVzA7d': { type: 'business', name: 'Business' },
            'price_1TASdA0dqWRNGixPXq896wn9': { type: 'enterprise', name: 'Enterprise' },
            'price_1TASdg0dqWRNGixPXI5TsjFt': { type: 'basic', name: 'Basic' },
          }

          if (priceIdMap[priceId]) {
            planType = priceIdMap[priceId].type
            planName = priceIdMap[priceId].name
            console.log('✅ Price ID matched:', planType, planName)
          } else {
            console.warn('⚠️ Price ID NOT in map, using default:', priceId)
          }

          const shipments_limit = PLAN_LIMITS[planType]
          console.log('📊 Shipments limit for plan:', shipments_limit)

          // Verifică dacă există deja subscription
          const { data: existingSub, error: checkError } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('user_id', userId)
            .single()

          console.log('🔍 Existing subscription check:', existingSub ? 'Found' : 'Not found', checkError?.message || '')

          // @ts-ignore - Stripe types issue with current_period_start/end
          const periodStart = subscription.current_period_start
          // @ts-ignore - Stripe types issue with current_period_start/end
          const periodEnd = subscription.current_period_end
          // @ts-ignore - Stripe types issue with trial_end
          const trialEnd = subscription.trial_end

          if (existingSub) {
            // Update existing
            console.log('🔄 Updating existing subscription...')
            const { error: updateError } = await supabase
              .from('subscriptions')
              .update({
                stripe_subscription_id: subscription.id,
                plan: planType,
                plan_name: planName,
                status: subscription.status,
                price: subscription.items.data[0].price.unit_amount! / 100,
                currency: subscription.currency.toUpperCase(),
                starts_at: new Date(periodStart * 1000).toISOString(),
                expires_at: new Date(periodEnd * 1000).toISOString(),
                trial_ends_at: trialEnd 
                  ? new Date(trialEnd * 1000).toISOString()
                  : null,
                shipments_limit,
                shipments_used: 0,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', userId)
            
            if (updateError) {
              console.error('❌ Update subscription error:', updateError)
            } else {
              console.log('✅ Subscription updated successfully')
            }
          } else {
            // Insert new
            console.log('➕ Inserting new subscription...')
            const { error: insertError } = await supabase
              .from('subscriptions')
              .insert({
                user_id: userId,
                stripe_subscription_id: subscription.id,
                stripe_payment_intent_id: session.payment_intent as string || null,
                plan: planType,
                plan_name: planName,
                status: subscription.status,
                price: subscription.items.data[0].price.unit_amount! / 100,
                currency: subscription.currency.toUpperCase(),
                starts_at: new Date(periodStart * 1000).toISOString(),
                expires_at: new Date(periodEnd * 1000).toISOString(),
                trial_ends_at: trialEnd 
                  ? new Date(trialEnd * 1000).toISOString()
                  : null,
                shipments_limit,
                shipments_used: 0,
              })
            
            if (insertError) {
              console.error('❌ Insert subscription error:', insertError)
            } else {
              console.log('✅ Subscription inserted successfully')
            }
          }

          // Update stripe_customer_id în client_profiles sau transporter_profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()

          if (profile?.role === 'client') {
            await supabase
              .from('client_profiles')
              .upsert({
                profile_id: userId,
                stripe_customer_id: session.customer as string,
              }, {
                onConflict: 'profile_id'
              })
          } else if (profile?.role === 'transporter') {
            await supabase
              .from('transporter_profiles')
              .upsert({
                profile_id: userId,
                stripe_account_id: session.customer as string,
              }, {
                onConflict: 'profile_id'
              })
          }

          console.log('✅ Subscription created/updated for user:', userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log('🔄 Subscription updated:', subscription.id)

        // @ts-ignore - Stripe types issue
        const periodStart = subscription.current_period_start
        // @ts-ignore - Stripe types issue
        const periodEnd = subscription.current_period_end
        // @ts-ignore - Stripe types issue
        const trialEnd = subscription.trial_end

        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            starts_at: new Date(periodStart * 1000).toISOString(),
            expires_at: new Date(periodEnd * 1000).toISOString(),
            trial_ends_at: trialEnd 
              ? new Date(trialEnd * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        // Reset shipments_used la începutul unei noi perioade
        if (subscription.status === 'active') {
          await supabase
            .from('subscriptions')
            .update({ shipments_used: 0 })
            .eq('stripe_subscription_id', subscription.id)
        }

        console.log('✅ Subscription updated:', subscription.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log('❌ Subscription deleted:', subscription.id)

        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        console.log('✅ Subscription marked as canceled:', subscription.id)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        console.log('💰 Payment succeeded for invoice:', invoice.id)

        // @ts-ignore - Stripe types issue
        const subscriptionId = invoice.subscription

        if (subscriptionId) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId as string)

          console.log('✅ Subscription activated after payment')
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        console.log('⚠️ Payment failed for invoice:', invoice.id)

        // @ts-ignore - Stripe types issue
        const subscriptionId = invoice.subscription

        if (subscriptionId) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId as string)

          console.log('⚠️ Subscription marked as past_due')
        }
        break
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log('⏰ Trial will end soon for:', subscription.id)
        
        // TODO: Send email notification to user
        // const { data: sub } = await supabase
        //   .from('subscriptions')
        //   .select('user_id')
        //   .eq('stripe_subscription_id', subscription.id)
        //   .single()
        
        // if (sub) {
        //   await sendTrialEndingEmail(sub.user_id)
        // }
        
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('❌ Webhook handler error:', error)
    return NextResponse.json(
      { error: `Webhook handler failed: ${error.message}` },
      { status: 500 }
    )
  }
}
