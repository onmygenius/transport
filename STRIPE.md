# 🔷 STRIPE INTEGRATION - IMPLEMENTARE COMPLETĂ

**Data:** 10 Martie 2026  
**Proiect:** Trade Container - European Freight Exchange  
**Scop:** Implementare sistem pricing cu Stripe, free trial, și notificări complete

---

## 📋 CUPRINS

1. [Rezumat Pricing](#rezumat-pricing)
2. [Setup Stripe Dashboard](#setup-stripe-dashboard)
3. [Database Schema](#database-schema)
4. [TypeScript Types](#typescript-types)
5. [Stripe Integration Code](#stripe-integration-code)
6. [Email Notifications](#email-notifications)
7. [Dashboard Notifications](#dashboard-notifications)
8. [Business Logic](#business-logic)
9. [UI Components](#ui-components)
10. [Workflow Complet](#workflow-complet)
11. [Testing](#testing)
12. [Checklist Implementare](#checklist-implementare)

---

## 🎯 REZUMAT PRICING

### **FREE TRIAL:**
- **30 zile** pentru toată lumea
- **Fără card** necesar la sign-up
- Acces complet la toate features

### **CLIENȚI - 4 PACHETE:**

| Pachet | Preț Lunar | Preț 6 Luni | Limite Anunțuri | Features |
|--------|------------|-------------|-----------------|----------|
| **Starter** | €19.99 | €89.94 | 1-5/lună | Basic support, documents |
| **Growth** | €34.99 | €179.94 | 5-10/lună | Priority support, filters |
| **Business** | €59.99 | €329.94 | 10-20/lună | API access, manager |
| **Enterprise** | €99.99 | €569.94 | Unlimited | 24/7 support, analytics |

### **TRANSPORTATORI - 1 PACHET:**

| Pachet | Preț Lunar | Preț 6 Luni | Discount Prima Lună |
|--------|------------|-------------|---------------------|
| **Pro** | €29.99 | €164.94 | 50% OFF (€14.99) |

---

## 🔧 SETUP STRIPE DASHBOARD

### **Pasul 1: Creare Cont Stripe**

1. Accesează [stripe.com](https://stripe.com)
2. Creează cont business
3. Completează informații companie
4. Activează test mode pentru development

### **Pasul 2: Creare Products & Prices**

**În Stripe Dashboard → Products → Create Product:**

#### **1. Client Starter**
```
Product Name: Trade Container - Client Starter
Description: Perfect for small shippers (1-5 shipments/month)

Prices:
├─ Monthly: €19.99/month (recurring)
│  Price ID: price_starter_monthly
│
└─ 6 Months: €89.94 (recurring every 6 months)
   Price ID: price_starter_6months
```

#### **2. Client Growth** ⭐ Most Popular
```
Product Name: Trade Container - Client Growth
Description: For growing businesses (5-10 shipments/month)

Prices:
├─ Monthly: €34.99/month
│  Price ID: price_growth_monthly
│
└─ 6 Months: €179.94
   Price ID: price_growth_6months
```

#### **3. Client Business**
```
Product Name: Trade Container - Client Business
Description: High-volume shippers (10-20 shipments/month)

Prices:
├─ Monthly: €59.99/month
│  Price ID: price_business_monthly
│
└─ 6 Months: €329.94
   Price ID: price_business_6months
```

#### **4. Client Enterprise**
```
Product Name: Trade Container - Client Enterprise
Description: Unlimited everything for large enterprises

Prices:
├─ Monthly: €99.99/month
│  Price ID: price_enterprise_monthly
│
└─ 6 Months: €569.94
   Price ID: price_enterprise_6months
```

#### **5. Transporter Pro**
```
Product Name: Trade Container - Transporter Pro
Description: All-inclusive for transporters

Prices:
├─ Monthly: €29.99/month
│  Price ID: price_transporter_monthly
│
└─ 6 Months: €164.94
   Price ID: price_transporter_6months
```

### **Pasul 3: Configurare Webhook**

1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://transport-nine-mauve.vercel.app/api/stripe/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
4. Copy webhook signing secret → `.env.local`

### **Pasul 4: API Keys**

1. Stripe Dashboard → Developers → API keys
2. Copy:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

---

## 💾 DATABASE SCHEMA

### **1. Migrare Tabel `subscriptions`**

```sql
-- Adăugare coloane noi
ALTER TABLE subscriptions 
  ADD COLUMN tier TEXT NOT NULL DEFAULT 'enterprise',
  ADD COLUMN billing_cycle TEXT DEFAULT 'monthly',
  ADD COLUMN max_active_shipments INTEGER,
  ADD COLUMN current_active_shipments INTEGER DEFAULT 0,
  ADD COLUMN trial_ends_at TIMESTAMP,
  ADD COLUMN is_trial BOOLEAN DEFAULT FALSE,
  ADD COLUMN discount_percent DECIMAL,
  ADD COLUMN discount_ends_at TIMESTAMP,
  ADD COLUMN stripe_price_id TEXT,
  ADD COLUMN cancelled_at TIMESTAMP,
  ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

-- Migrare date existente
UPDATE subscriptions 
SET 
  tier = CASE 
    WHEN (SELECT role FROM profiles WHERE id = user_id) = 'client' THEN 'enterprise'
    WHEN (SELECT role FROM profiles WHERE id = user_id) = 'transporter' THEN 'transporter_pro'
  END,
  billing_cycle = plan,
  max_active_shipments = NULL,
  updated_at = NOW()
WHERE tier IS NULL;

-- Constraints
ALTER TABLE subscriptions
  ADD CONSTRAINT check_tier CHECK (tier IN ('starter', 'growth', 'business', 'enterprise', 'transporter_pro')),
  ADD CONSTRAINT check_billing_cycle CHECK (billing_cycle IN ('monthly', 'semi_annual'));
```

### **2. Tabel NOU: `subscription_usage`**

```sql
CREATE TABLE subscription_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
  
  -- Tracking
  active_shipments_count INTEGER DEFAULT 0,
  total_shipments_posted INTEGER DEFAULT 0,
  month_year TEXT NOT NULL,
  shipments_posted_this_month INTEGER DEFAULT 0,
  
  last_shipment_posted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, month_year)
);

CREATE INDEX idx_subscription_usage_user ON subscription_usage(user_id);
CREATE INDEX idx_subscription_usage_month ON subscription_usage(month_year);
```

### **3. Postgres Functions**

```sql
-- Increment active shipments
CREATE OR REPLACE FUNCTION increment_active_shipments(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE subscriptions
  SET current_active_shipments = current_active_shipments + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Decrement active shipments (când shipment e completed/cancelled)
CREATE OR REPLACE FUNCTION decrement_active_shipments(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE subscriptions
  SET current_active_shipments = GREATEST(current_active_shipments - 1, 0),
      updated_at = NOW()
  WHERE user_id = p_user_id AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Trigger pentru auto-decrement când shipment status devine completed/cancelled
CREATE OR REPLACE FUNCTION shipment_status_change_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('completed', 'cancelled') AND OLD.status NOT IN ('completed', 'cancelled') THEN
    PERFORM decrement_active_shipments(NEW.client_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shipment_status_change
AFTER UPDATE OF status ON shipments
FOR EACH ROW
EXECUTE FUNCTION shipment_status_change_trigger();
```

---

## 📧 EMAIL NOTIFICATIONS

### **Email Templates Necesare:**

#### **1. Subscription Created (Trial Started)**
```
Template: subscription_trial_started.tsx
Trigger: După creare subscription cu trial
Către: User (client sau transporter)
Subject: "Welcome! Your 30-Day Free Trial Has Started 🎉"

Content:
- Confirmare trial started
- Data expirare trial
- Ce features are acces
- Link către dashboard
- Reminder că nu se percepe plată până la sfârșitul trial-ului
```

#### **2. Trial Ending Soon (7 zile înainte)**
```
Template: subscription_trial_ending.tsx
Trigger: Webhook customer.subscription.trial_will_end (7 zile înainte)
Către: User
Subject: "Your trial ends in 7 days - Add payment method"

Content:
- Reminder trial se termină în 7 zile
- CTA: Add payment method
- Pricing reminder
- Link către subscription settings
```

#### **3. Trial Ending Tomorrow**
```
Template: subscription_trial_ending_tomorrow.tsx
Trigger: Cron job (1 zi înainte)
Către: User
Subject: "Last chance! Your trial ends tomorrow"

Content:
- Urgent reminder
- CTA: Add payment method NOW
- Ce se întâmplă dacă nu adaugă card (pierde acces)
```

#### **4. Subscription Activated (După Trial)**
```
Template: subscription_activated.tsx
Trigger: Webhook invoice.payment_succeeded (prima plată)
Către: User
Subject: "Payment Successful - Subscription Activated ✅"

Content:
- Confirmare plată
- Detalii subscription (tier, price, next billing date)
- Invoice PDF attached
- Thank you message
```

#### **5. Payment Failed**
```
Template: subscription_payment_failed.tsx
Trigger: Webhook invoice.payment_failed
Către: User
Subject: "⚠️ Payment Failed - Action Required"

Content:
- Notificare plată eșuată
- Motivul (card expirat, fonduri insuficiente, etc.)
- CTA: Update payment method
- Warning: Subscription va fi suspended după X failed attempts
```

#### **6. Subscription Cancelled**
```
Template: subscription_cancelled.tsx
Trigger: Webhook customer.subscription.deleted
Către: User
Subject: "Subscription Cancelled - We're Sorry to See You Go"

Content:
- Confirmare cancellation
- Data până când mai are acces
- Feedback request (de ce a cancelled?)
- CTA: Reactivate subscription (discount offer?)
```

#### **7. Upgrade/Downgrade Confirmation**
```
Template: subscription_changed.tsx
Trigger: După update subscription
Către: User
Subject: "Subscription Updated Successfully"

Content:
- Confirmare schimbare plan
- Old plan → New plan
- Proration details (dacă există)
- New billing amount
- Next billing date
```

#### **8. Limit Reached Warning**
```
Template: subscription_limit_reached.tsx
Trigger: Când user ajunge la 80% din limită
Către: Client
Subject: "You're approaching your shipment limit"

Content:
- Current usage: 4/5 shipments
- Reminder să upgrade pentru mai multe
- CTA: Upgrade to next tier
- Pricing comparison
```

#### **9. Monthly Invoice**
```
Template: subscription_invoice.tsx
Trigger: Webhook invoice.payment_succeeded
Către: User
Subject: "Your Trade Container Invoice for [Month]"

Content:
- Invoice details
- Amount paid
- Billing period
- PDF invoice attached
- Payment method used
```

---

## 🔔 DASHBOARD NOTIFICATIONS

### **Notificări pentru CLIENȚI:**

#### **1. Trial Started**
```typescript
Type: 'subscription_trial_started'
Title: 'Welcome! 30-Day Free Trial Activated 🎉'
Message: 'Your Starter plan trial is active until [date]. No payment required until then.'
Link: '/dashboard/client/subscription'
Icon: '🎁'
Priority: 'high'
```

#### **2. Trial Ending (7 zile)**
```typescript
Type: 'subscription_trial_ending'
Title: 'Trial ends in 7 days'
Message: 'Add a payment method to continue using Trade Container after your trial ends.'
Link: '/dashboard/client/subscription'
Icon: '⏰'
Priority: 'high'
```

#### **3. Trial Ending (1 zi)**
```typescript
Type: 'subscription_trial_ending_urgent'
Title: '⚠️ Trial ends tomorrow!'
Message: 'Add payment method now to avoid losing access to your account.'
Link: '/dashboard/client/subscription'
Icon: '🚨'
Priority: 'urgent'
```

#### **4. Payment Successful**
```typescript
Type: 'subscription_payment_success'
Title: 'Payment Successful ✅'
Message: 'Your €19.99 payment was processed. Next billing: [date]'
Link: '/dashboard/client/subscription'
Icon: '💳'
Priority: 'medium'
```

#### **5. Payment Failed**
```typescript
Type: 'subscription_payment_failed'
Title: '⚠️ Payment Failed'
Message: 'We couldn't process your payment. Please update your payment method.'
Link: '/dashboard/client/subscription'
Icon: '❌'
Priority: 'urgent'
```

#### **6. Limit Reached (80%)**
```typescript
Type: 'subscription_limit_warning'
Title: 'Approaching shipment limit'
Message: 'You've used 4 of 5 shipments this month. Consider upgrading.'
Link: '/dashboard/client/subscription'
Icon: '📊'
Priority: 'medium'
```

#### **7. Limit Reached (100%)**
```typescript
Type: 'subscription_limit_reached'
Title: 'Shipment limit reached'
Message: 'You've reached your 5 shipments limit. Upgrade to post more.'
Link: '/dashboard/client/subscription'
Icon: '🚫'
Priority: 'high'
```

#### **8. Subscription Upgraded**
```typescript
Type: 'subscription_upgraded'
Title: 'Plan Upgraded Successfully 🎉'
Message: 'You're now on the Growth plan. You can post up to 10 shipments/month.'
Link: '/dashboard/client/subscription'
Icon: '⬆️'
Priority: 'medium'
```

#### **9. Subscription Cancelled**
```typescript
Type: 'subscription_cancelled'
Title: 'Subscription Cancelled'
Message: 'Your subscription will remain active until [date].'
Link: '/dashboard/client/subscription'
Icon: '👋'
Priority: 'high'
```

### **Notificări pentru TRANSPORTATORI:**

#### **1. Trial Started**
```typescript
Type: 'subscription_trial_started'
Title: 'Welcome! 30-Day Free Trial + 50% OFF 🎉'
Message: 'Trial active until [date]. First month after trial: €14.99 (50% OFF)'
Link: '/dashboard/transporter/subscription'
Icon: '🎁'
Priority: 'high'
```

#### **2. First Payment (cu discount)**
```typescript
Type: 'subscription_first_payment'
Title: 'First Payment Successful - 50% Discount Applied ✅'
Message: 'Paid €14.99 (50% OFF). Next month: €29.99'
Link: '/dashboard/transporter/subscription'
Icon: '💰'
Priority: 'medium'
```

#### **3. Discount Ending**
```typescript
Type: 'subscription_discount_ending'
Title: 'First month discount ending soon'
Message: 'Starting next billing cycle, price will be €29.99/month'
Link: '/dashboard/transporter/subscription'
Icon: '💳'
Priority: 'low'
```

### **Notificări pentru ADMIN:**

#### **1. New Subscription**
```typescript
Type: 'admin_subscription_new'
Title: 'New Subscription Created'
Message: '[User] subscribed to [Tier] plan (€[price]/month)'
Link: '/admin/subscriptions'
Icon: '🆕'
Priority: 'low'
```

#### **2. Subscription Cancelled**
```typescript
Type: 'admin_subscription_cancelled'
Title: 'Subscription Cancelled'
Message: '[User] cancelled their [Tier] subscription'
Link: '/admin/subscriptions'
Icon: '❌'
Priority: 'medium'
```

#### **3. Payment Failed**
```typescript
Type: 'admin_payment_failed'
Title: 'Payment Failed for User'
Message: '[User] payment failed. Subscription may be suspended.'
Link: '/admin/subscriptions'
Icon: '⚠️'
Priority: 'high'
```

#### **4. Trial Conversions**
```typescript
Type: 'admin_trial_converted'
Title: 'Trial Converted to Paid'
Message: '[User] converted from trial to paid [Tier] subscription'
Link: '/admin/subscriptions'
Icon: '✅'
Priority: 'low'
```

---

## 🔄 WORKFLOW COMPLET

### **Scenario 1: Client Sign-Up cu Trial**

```
1. User accesează /register?tier=growth&billing=monthly
   └─ Form cu email, password, company info
   └─ NU cere card (free trial)

2. User completează registration
   └─ Creare user în auth.users
   └─ Creare profile în profiles
   └─ Redirect la /dashboard/client

3. User click "Start Free Trial" în dashboard
   └─ API call: createSubscription({ tier: 'growth', billing: 'monthly' })
   └─ Creare Stripe Customer (fără card)
   └─ Creare Stripe Subscription cu trial_period_days: 30
   └─ Creare subscription în DB:
       - status: 'active'
       - is_trial: true
       - trial_ends_at: NOW() + 30 days
       - max_active_shipments: 10
   
4. Email + Dashboard Notification
   └─ Email: "Welcome! Your 30-Day Free Trial Has Started"
   └─ Dashboard: "Trial Activated 🎉"

5. User poate posta shipments (max 10 active)
   └─ Check la fiecare post: canPostShipment()
   └─ Increment current_active_shipments
   └─ Track în subscription_usage

6. Ziua 23 (7 zile înainte de expirare)
   └─ Webhook: customer.subscription.trial_will_end
   └─ Email: "Your trial ends in 7 days - Add payment method"
   └─ Dashboard notification: "Trial ending soon"

7. Ziua 29 (1 zi înainte)
   └─ Cron job
   └─ Email: "Last chance! Trial ends tomorrow"
   └─ Dashboard notification urgent

8a. User adaugă card înainte de expirare
    └─ Stripe procesează plata automată la expirare trial
    └─ Webhook: invoice.payment_succeeded
    └─ Update subscription: is_trial = false
    └─ Email: "Payment Successful - Subscription Activated"
    └─ Dashboard notification: "Payment Successful ✅"

8b. User NU adaugă card
    └─ Stripe nu poate procesa plata
    └─ Webhook: invoice.payment_failed
    └─ Update subscription: status = 'suspended'
    └─ Email: "Payment Failed - Add payment method"
    └─ Dashboard notification urgent
    └─ User NU mai poate posta shipments
```

### **Scenario 2: Transporter Sign-Up cu Discount**

```
1. User accesează /register (transporter)
   └─ Completează registration

2. Start Free Trial
   └─ Creare subscription cu:
       - tier: 'transporter_pro'
       - trial_period_days: 30
       - discount_percent: 50 (pentru prima lună DUPĂ trial)

3. După 30 zile trial
   └─ Prima plată: €14.99 (50% OFF de la €29.99)
   └─ Email: "First Payment - 50% Discount Applied"
   └─ Dashboard: "Paid €14.99 (50% OFF)"

4. După prima lună
   └─ A doua plată: €29.99 (preț normal)
   └─ Email: "Monthly Payment - €29.99"
   └─ Dashboard notification
```

### **Scenario 3: Client Upgrade Plan**

```
1. User pe Starter (€19.99, max 5 shipments)
   └─ Ajunge la 5 shipments active
   └─ Dashboard notification: "Limit reached - Upgrade?"

2. User click "Upgrade to Growth"
   └─ API call: updateSubscription({ newTier: 'growth' })
   └─ Stripe update subscription cu proration
   └─ Calculare credit pentru zilele rămase din Starter
   └─ Charge diferența pentru Growth

3. Update în DB
   └─ tier: 'starter' → 'growth'
   └─ max_active_shipments: 5 → 10
   └─ price: €19.99 → €34.99

4. Email + Notification
   └─ Email: "Subscription Updated - Now on Growth Plan"
   └─ Dashboard: "Plan Upgraded 🎉"

5. User poate posta până la 10 shipments
```

### **Scenario 4: Payment Failed**

```
1. Stripe încearcă să proceseze plata
   └─ Card expirat / fonduri insuficiente
   └─ Webhook: invoice.payment_failed

2. Prima încercare eșuată
   └─ Email: "Payment Failed - Update payment method"
   └─ Dashboard notification urgent
   └─ Subscription rămâne active (grace period 3 zile)

3. Stripe retry automat (după 3 zile)
   └─ Dacă tot fail → a doua încercare

4. După 3 failed attempts
   └─ Webhook: customer.subscription.deleted
   └─ Update subscription: status = 'suspended'
   └─ Email: "Subscription Suspended - Payment Required"
   └─ User NU mai poate posta shipments
   └─ Dashboard: banner roșu "Subscription Suspended"
```

---

## ✅ CHECKLIST IMPLEMENTARE

### **FASE 1: Setup Stripe (2-3 ore)**
- [ ] Creare cont Stripe
- [ ] Creare 5 products în Stripe Dashboard
- [ ] Creare 10 prices (monthly + 6-month pentru fiecare)
- [ ] Configurare webhook endpoint
- [ ] Copy API keys în `.env.local`
- [ ] Test Stripe în test mode

### **FASE 2: Database (1-2 ore)**
- [ ] Migrare tabel `subscriptions` (adăugare coloane)
- [ ] Creare tabel `subscription_usage`
- [ ] Creare Postgres functions (increment/decrement)
- [ ] Creare triggers pentru auto-decrement
- [ ] Test migrații în Supabase

### **FASE 3: Types & Constants (1 oră)**
- [ ] Update `src/types/index.ts` (SubscriptionTier, etc.)
- [ ] Creare `src/lib/pricing.ts` (PRICING_TIERS config)
- [ ] Update interfaces existente

### **FASE 4: Stripe Integration (3-4 ore)**
- [ ] Creare `src/lib/stripe.ts`
- [ ] Creare `src/app/api/stripe/webhook/route.ts`
- [ ] Implementare webhook handlers
- [ ] Test webhook cu Stripe CLI

### **FASE 5: Business Logic (4-5 ore)**
- [ ] Creare `src/lib/actions/subscriptions.ts`
- [ ] Implementare `createSubscription()`
- [ ] Implementare `canPostShipment()`
- [ ] Implementare `updateSubscription()`
- [ ] Implementare `cancelSubscription()`
- [ ] Implementare `incrementShipmentCount()`

### **FASE 6: Email Templates (3-4 ore)**
- [ ] Creare `subscription_trial_started.tsx`
- [ ] Creare `subscription_trial_ending.tsx`
- [ ] Creare `subscription_activated.tsx`
- [ ] Creare `subscription_payment_failed.tsx`
- [ ] Creare `subscription_cancelled.tsx`
- [ ] Creare `subscription_limit_reached.tsx`
- [ ] Update `src/lib/emails.ts` (adăugare noi types)

### **FASE 7: Dashboard Notifications (2-3 ore)**
- [ ] Implementare creare notificări în webhook handler
- [ ] Implementare notificări în subscription actions
- [ ] Test notificări în dashboard

### **FASE 8: UI Components (5-6 ore)**
- [ ] Update `src/app/page.tsx` (pricing section)
- [ ] Creare `src/components/pricing/pricing-cards.tsx`
- [ ] Creare `src/components/pricing/pricing-toggle.tsx`
- [ ] Update `src/app/dashboard/client/subscription/page.tsx`
- [ ] Update `src/app/dashboard/transporter/subscription/page.tsx`
- [ ] Creare subscription management UI (upgrade/cancel)

### **FASE 9: Limitare Anunțuri (2-3 ore)**
- [ ] Update `src/app/dashboard/client/post/page.tsx` (check limite)
- [ ] Implementare UI pentru "limit reached"
- [ ] Implementare CTA upgrade când e la limită
- [ ] Test flow complet post shipment

### **FASE 10: Testing (3-4 ore)**
- [ ] Test sign-up cu trial
- [ ] Test trial ending flow
- [ ] Test payment success
- [ ] Test payment failed
- [ ] Test upgrade/downgrade
- [ ] Test cancel subscription
- [ ] Test limite anunțuri
- [ ] Test email notifications
- [ ] Test dashboard notifications

### **FASE 11: Production Deploy (1-2 ore)**
- [ ] Switch Stripe la live mode
- [ ] Update environment variables pe Vercel
- [ ] Configure webhook în live mode
- [ ] Test final în production

---

**TOTAL ESTIMAT: 28-37 ore implementare**

**Data Start:** [TBD]  
**Data Target Finalizare:** [TBD]

---

**Document creat:** 10 Martie 2026  
**Ultima actualizare:** 10 Martie 2026
