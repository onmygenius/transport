# 📦 IMPLEMENTARE PACHETE ABONAMENT - TRADE CONTAINER PLATFORM

## 🎁 FREE TRIAL
- **Durată:** 30 de zile
- **Disponibil pentru:** Toți utilizatorii noi (Clienți și Transportatori)
- **Acces:** Funcționalitate completă în perioada de trial

---

## 👔 PACHETE PENTRU CLIENȚI

### **Pachet 1 - STARTER**
- **Preț lunar:** 19,99 €
- **Preț 6 luni:** 89,94 € (economisești 29,94 €)
- **Limite:** 1-5 shipment-uri/lună
- **Ideal pentru:** Clienți cu volum redus, comenzi ocazionale

### **Pachet 2 - BUSINESS**
- **Preț lunar:** 34,99 €
- **Preț 6 luni:** 179,94 € (economisești 29,94 €)
- **Limite:** 5-10 shipment-uri/lună
- **Ideal pentru:** Afaceri mici și mijlocii cu volum moderat

### **Pachet 3 - PROFESSIONAL**
- **Preț lunar:** 59,99 €
- **Preț 6 luni:** 329,94 € (economisești 29,94 €)
- **Limite:** 10-20 shipment-uri/lună
- **Ideal pentru:** Companii cu volum mare de transport

### **Pachet 4 - ENTERPRISE**
- **Preț lunar:** 99,99 €
- **Preț 6 luni:** 569,94 € (economisești 29,94 €)
- **Limite:** UNLIMITED - shipment-uri nelimitate
- **Ideal pentru:** Companii mari cu volum foarte mare

---

## 🚛 PACHET PENTRU TRANSPORTATORI

### **Pachet TRANSPORTATOR - STANDARD**
- **Preț lunar:** 29,99 €
- **DISCOUNT PRIMA LUNĂ:** 50% → **14,99 € prima lună**
- **Limite:** Acces complet la toate shipment-urile disponibile
- **Beneficii:**
  - Notificări instant pentru shipment-uri noi
  - Posibilitate de a trimite oferte nelimitate
  - Acces la dashboard complet
  - Vizibilitate în lista de transportatori verificați

---

## 🔧 DETALII TEHNICE PENTRU IMPLEMENTARE

### **1. Tabel Database - Subscriptions**

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL, -- 'client_starter', 'client_business', 'client_professional', 'client_enterprise', 'transporter_standard'
  billing_cycle VARCHAR(20) NOT NULL, -- 'monthly', 'semi_annual'
  price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'trial'
  trial_ends_at TIMESTAMP,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  shipments_limit INTEGER, -- NULL pentru unlimited
  shipments_used INTEGER DEFAULT 0,
  auto_renew BOOLEAN DEFAULT true,
  payment_method_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

### **2. Logica de Verificare Limite**

**La crearea unui shipment nou (client):**
```typescript
// Verifică dacă user-ul are abonament activ
const subscription = await getActiveSubscription(userId)

if (!subscription) {
  return { error: 'Nu aveți un abonament activ' }
}

// Verifică dacă este în perioada de trial
if (subscription.status === 'trial' && new Date() > subscription.trial_ends_at) {
  return { error: 'Perioada de trial a expirat. Vă rugăm să alegeți un pachet.' }
}

// Verifică limita de shipment-uri (doar dacă nu e unlimited)
if (subscription.shipments_limit !== null) {
  if (subscription.shipments_used >= subscription.shipments_limit) {
    return { error: `Ați atins limita de ${subscription.shipments_limit} shipment-uri pentru luna curentă.` }
  }
}

// Incrementează counter
await incrementShipmentsUsed(subscription.id)
```

### **3. Reset Lunar al Limitelor**

**Cron job sau trigger pentru reset la începutul fiecărei luni:**
```sql
-- Reset shipments_used la 1 a fiecărei luni
UPDATE subscriptions 
SET shipments_used = 0, 
    current_period_start = NOW(),
    current_period_end = NOW() + INTERVAL '1 month'
WHERE billing_cycle = 'monthly' 
  AND current_period_end < NOW()
  AND status = 'active';
```

### **4. Integrare Stripe pentru Plăți**

**Environment Variables necesare:**
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Prețuri Stripe (Product IDs):**
- `price_client_starter_monthly`
- `price_client_starter_semi_annual`
- `price_client_business_monthly`
- `price_client_business_semi_annual`
- `price_client_professional_monthly`
- `price_client_professional_semi_annual`
- `price_client_enterprise_monthly`
- `price_client_enterprise_semi_annual`
- `price_transporter_standard_monthly`

### **5. Flow Utilizator**

**Pentru Clienți:**
1. Înregistrare → Free trial 30 zile (unlimited)
2. După 30 zile → Prompt să aleagă pachet
3. Selectare pachet → Redirect la Stripe Checkout
4. Plată success → Activare abonament
5. La fiecare shipment nou → Verificare limită
6. La final de lună → Reset counter sau renewal

**Pentru Transportatori:**
1. Înregistrare → Free trial 30 zile
2. După 30 zile → Prompt să aleagă pachet
3. Prima lună → 50% discount (14,99 €)
4. Lunile următoare → 29,99 €/lună
5. Acces complet la toate shipment-urile

### **6. UI/UX - Pagini Necesare**

- `/dashboard/client/subscription` - Gestionare abonament client
- `/dashboard/transporter/subscription` - Gestionare abonament transportator
- `/pricing` - Pagină publică cu toate pachetele
- `/checkout` - Stripe Checkout integration
- `/subscription/success` - Confirmare plată
- `/subscription/cancelled` - Anulare plată

### **7. Email Notifications**

- **Trial ending (5 zile înainte):** "Your trial is ending soon"
- **Trial ended:** "Your trial has ended - Choose a plan"
- **Subscription activated:** "Welcome to [Plan Name]"
- **Limit reached:** "You've reached your monthly limit"
- **Renewal reminder (3 zile înainte):** "Your subscription will renew on [date]"
- **Payment failed:** "Payment failed - Update payment method"
- **Subscription cancelled:** "Your subscription has been cancelled"

### **8. Discount Codes (Opțional)**

```sql
CREATE TABLE discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_percent INTEGER, -- 10, 20, 50
  discount_amount DECIMAL(10,2), -- sau sumă fixă
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  max_uses INTEGER,
  times_used INTEGER DEFAULT 0,
  applicable_to VARCHAR(50), -- 'all', 'client', 'transporter'
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📊 METRICI ȘI RAPORTARE

**Dashboard Admin - Statistici:**
- Total abonamente active per tip
- Revenue lunar/anual
- Churn rate (anulări)
- Conversion rate (trial → paid)
- Average shipments per plan
- Top performing plans

---

## 🚀 PRIORITATE IMPLEMENTARE

1. **Faza 1 (MVP):**
   - Tabel subscriptions
   - Free trial 30 zile
   - Verificare limite la creare shipment
   - Pagină /pricing

2. **Faza 2:**
   - Integrare Stripe
   - Checkout flow
   - Email notifications

3. **Faza 3:**
   - Reset lunar automat
   - Dashboard subscription management
   - Discount codes

4. **Faza 4:**
   - Analytics și raportare
   - Upgrade/downgrade plans
   - Refund logic

---

## 💡 NOTE IMPORTANTE

- **Free trial:** Toți utilizatorii noi primesc 30 zile gratuit cu acces complet
- **Transportatori:** Prima lună 50% discount (14,99 € în loc de 29,99 €)
- **Clienți:** 4 pachete diferite în funcție de volum
- **Billing:** Lunar sau semi-anual (6 luni cu discount)
- **Limite:** Se resetează la începutul fiecărei luni
- **Enterprise:** Unlimited shipments

---

**Data creare:** 5 Martie 2026  
**Versiune:** 1.0  
**Status:** Planificare - Neimplementat
