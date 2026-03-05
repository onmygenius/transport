# 💳 IMPLEMENTARE STRIPE - SISTEM ABONAMENTE

## 📦 PACHETE DEFINITE

### 🎁 FREE TRIAL
- **Durată:** 30 de zile
- **Disponibil pentru:** Toți utilizatorii noi (Clienți și Transportatori)
- **Acces:** Funcționalitate completă în perioada de trial

---

### 👔 PACHETE CLIENȚI

#### **Pachet 1 - STARTER**
- **Lunar:** 19,99 €/lună (1-5 shipments)
- **Semi-anual:** 89,94 € pentru 6 luni (economie: 29,94 €)

#### **Pachet 2 - BUSINESS**
- **Lunar:** 34,99 €/lună (5-10 shipments)
- **Semi-anual:** 179,94 € pentru 6 luni (economie: 29,94 €)

#### **Pachet 3 - PROFESSIONAL**
- **Lunar:** 59,99 €/lună (10-20 shipments)
- **Semi-anual:** 329,94 € pentru 6 luni (economie: 29,94 €)

#### **Pachet 4 - ENTERPRISE**
- **Lunar:** 99,99 €/lună (UNLIMITED shipments)
- **Semi-anual:** 569,94 € pentru 6 luni (economie: 29,94 €)

---

### 🚛 PACHET TRANSPORTATORI

#### **STANDARD**
- **Lunar:** 29,99 €/lună
- **DISCOUNT PRIMA LUNĂ:** 50% → 14,99 € prima lună
- **Beneficii:** Acces complet la toate shipment-urile, oferte nelimitate

---

## 🔧 IMPLEMENTARE STRIPE - PAS CU PAS

### **STEP 1: Setup Stripe Account**

1. Creează cont Stripe: https://dashboard.stripe.com/register
2. Activează modul Test pentru development
3. Obține API keys:
   - **Publishable key:** `pk_test_...`
   - **Secret key:** `sk_test_...`

### **STEP 2: Instalare Stripe SDK**

```bash
npm install stripe @stripe/stripe-js
npm install --save-dev @types/stripe
```

### **STEP 3: Environment Variables**

**`.env.local`:**
```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Vercel Production:**
```env
STRIPE_SECRET_KEY=sk_live_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://transport-nine-mauve.vercel.app
```

### **STEP 4: Creare Produse în Stripe Dashboard**

**Mergi la:** https://dashboard.stripe.com/products

**Creează 9 produse:**

1. **Client Starter Monthly** - 19.99 EUR/month (recurring)
2. **Client Starter Semi-Annual** - 89.94 EUR/6 months (recurring)
3. **Client Business Monthly** - 34.99 EUR/month (recurring)
4. **Client Business Semi-Annual** - 179.94 EUR/6 months (recurring)
5. **Client Professional Monthly** - 59.99 EUR/month (recurring)
6. **Client Professional Semi-Annual** - 329.94 EUR/6 months (recurring)
7. **Client Enterprise Monthly** - 99.99 EUR/month (recurring)
8. **Client Enterprise Semi-Annual** - 569.94 EUR/6 months (recurring)
9. **Transporter Standard Monthly** - 29.99 EUR/month (recurring)

**Pentru fiecare produs:**
- Copiază **Price ID** (ex: `price_1ABC123...`)
- Salvează într-un fișier de configurare

### **STEP 5: Configurare Price IDs**

**`src/lib/stripe/config.ts`:**
```typescript
export const STRIPE_PRICES = {
  client: {
    starter: {
      monthly: 'price_1ABC123...',
      semiAnnual: 'price_1DEF456...',
    },
    business: {
      monthly: 'price_1GHI789...',
      semiAnnual: 'price_1JKL012...',
    },
    professional: {
      monthly: 'price_1MNO345...',
      semiAnnual: 'price_1PQR678...',
    },
    enterprise: {
      monthly: 'price_1STU901...',
      semiAnnual: 'price_1VWX234...',
    },
  },
  transporter: {
    standard: {
      monthly: 'price_1YZA567...',
    },
  },
}

export const PLAN_LIMITS = {
  client_starter: { min: 1, max: 5 },
  client_business: { min: 5, max: 10 },
  client_professional: { min: 10, max: 20 },
  client_enterprise: { min: null, max: null }, // unlimited
}
```

### **STEP 6: Database Schema**

**`supabase/migrations/add_subscriptions.sql`:**
```sql
-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_price_id VARCHAR(255) NOT NULL,
  plan_type VARCHAR(50) NOT NULL, -- 'client_starter', 'client_business', etc.
  billing_cycle VARCHAR(20) NOT NULL, -- 'monthly', 'semi_annual'
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'past_due', 'trialing'
  trial_ends_at TIMESTAMP,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  shipments_limit INTEGER, -- NULL pentru unlimited
  shipments_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Trigger pentru reset lunar
CREATE OR REPLACE FUNCTION reset_monthly_shipments()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET shipments_used = 0,
      current_period_start = current_period_end,
      current_period_end = current_period_end + INTERVAL '1 month'
  WHERE billing_cycle = 'monthly'
    AND current_period_end < NOW()
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;
```

### **STEP 7: Stripe Client Setup**

**`src/lib/stripe/client.ts`:**
```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})
```

### **STEP 8: API Route - Create Checkout Session**

**`src/app/api/stripe/create-checkout/route.ts`:**
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { priceId, planType, billingCycle } = await request.json()

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single()

    let customerId: string

    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (existingSub?.stripe_customer_id) {
      customerId = existingSub.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.full_name,
        metadata: { userId: user.id },
      })
      customerId = customer.id
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        userId: user.id,
        planType,
        billingCycle,
      },
      subscription_data: {
        trial_period_days: 30, // Free trial
        metadata: {
          userId: user.id,
          planType,
          billingCycle,
        },
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

### **STEP 9: Webhook Handler**

**`src/app/api/stripe/webhook/route.ts`:**
```typescript
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/server'
import { PLAN_LIMITS } from '@/lib/stripe/config'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { userId, planType, billingCycle } = session.metadata!
        
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        const limits = PLAN_LIMITS[planType as keyof typeof PLAN_LIMITS]

        await supabase.from('subscriptions').insert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0].price.id,
          plan_type: planType,
          billing_cycle: billingCycle,
          status: subscription.status,
          trial_ends_at: subscription.trial_end 
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          shipments_limit: limits?.max || null,
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', invoice.subscription as string)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

### **STEP 10: Configurare Webhook în Stripe**

1. Mergi la: https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. URL: `https://transport-nine-mauve.vercel.app/api/stripe/webhook`
4. Selectează events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copiază **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### **STEP 11: Frontend - Pricing Page**

**`src/app/pricing/page.tsx`:**
```typescript
'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { STRIPE_PRICES } from '@/lib/stripe/config'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string, planType: string, billingCycle: string) => {
    setLoading(priceId)
    
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planType, billingCycle }),
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Subscription error:', error)
      setLoading(null)
    }
  }

  return (
    <div className="pricing-page">
      {/* Pricing cards aici */}
    </div>
  )
}
```

### **STEP 12: Verificare Limite la Creare Shipment**

**`src/lib/actions/shipments.ts`:**
```typescript
export async function createShipment(data: ShipmentFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Verifică abonament
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!subscription) {
    return { success: false, error: 'Nu aveți un abonament activ. Alegeți un pachet.' }
  }

  // Verifică trial expirat
  if (subscription.status === 'trialing' && new Date() > new Date(subscription.trial_ends_at)) {
    return { success: false, error: 'Perioada de trial a expirat.' }
  }

  // Verifică limită shipments
  if (subscription.shipments_limit !== null) {
    if (subscription.shipments_used >= subscription.shipments_limit) {
      return { 
        success: false, 
        error: `Ați atins limita de ${subscription.shipments_limit} shipment-uri pentru luna curentă.` 
      }
    }
  }

  // Creează shipment...
  const { data: shipment, error } = await supabase
    .from('shipments')
    .insert({ ...data, client_id: user.id })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  // Incrementează counter
  await supabase
    .from('subscriptions')
    .update({ shipments_used: subscription.shipments_used + 1 })
    .eq('id', subscription.id)

  return { success: true, data: shipment }
}
```

---

## 🎯 DISCOUNT PRIMA LUNĂ TRANSPORTATORI

**Implementare cu Stripe Coupons:**

1. Creează coupon în Stripe Dashboard:
   - Name: `TRANSPORTER_FIRST_MONTH`
   - Discount: 50% off
   - Duration: Once
   - Applies to: Transporter Standard Monthly product

2. Aplică automat la checkout pentru transportatori:

```typescript
const session = await stripe.checkout.sessions.create({
  // ...
  discounts: userRole === 'transporter' ? [{
    coupon: 'TRANSPORTER_FIRST_MONTH'
  }] : undefined,
})
```

---

## 📊 TESTARE

### **Test Cards Stripe:**
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0027 6000 3184`

**Orice dată viitoare, orice CVC (3 cifre)**

### **Flow de testare:**
1. Înregistrare user nou → Free trial 30 zile
2. Selectare pachet → Redirect Stripe Checkout
3. Plată cu test card → Success
4. Verificare webhook → Subscription creată în DB
5. Creare shipment → Verificare limită
6. Așteptare 30 zile (sau modificare manual trial_ends_at) → Trial expirat
7. Renewal automat → Plată lunară

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Stripe account creat (Test + Production)
- [ ] Produse și prețuri create în Stripe
- [ ] Environment variables setate (Vercel)
- [ ] Webhook configurat în Stripe
- [ ] Database migration rulată (subscriptions table)
- [ ] API routes testate local
- [ ] Frontend pricing page implementată
- [ ] Verificare limite la creare shipment
- [ ] Email notifications pentru subscription events
- [ ] Testare completă cu test cards
- [ ] Switch la Production keys

---

**Data creare:** 5 Martie 2026  
**Versiune:** 2.0  
**Status:** Ready for implementation
