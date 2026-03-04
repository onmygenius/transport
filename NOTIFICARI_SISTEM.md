# 📧 Sistem Notificări Email & Dashboard - Trade Container Platform

**Data analiză:** 4 Martie 2026

---

## 🎯 Obiectiv

Implementarea unui sistem complet de notificări prin **Email** și **Dashboard** pentru a ține utilizatorii informați despre evenimente importante din platformă.

---

## 📊 Fluxuri Principale Identificate

### **1. SHIPMENTS (Comenzi Transport)**
- Client postează shipment nou
- Transportator vede shipment disponibil
- Status updates: pending → offer_received → confirmed → picked_up → in_transit → delivered → completed

### **2. OFFERS (Oferte)**
- Transportator trimite ofertă pentru shipment
- Client primește ofertă nouă
- Client acceptă/respinge ofertă
- Transportator primește răspuns la ofertă
- Ofertă expirată (valid_until)

### **3. TRUCK AVAILABILITY**
- Transportator postează truck disponibil
- Client caută transportatori
- Match între truck nou și căutări salvate

### **4. MESSAGES (Chat)**
- Mesaj nou în conversație shipment
- Mesaj necitit

### **5. KYC VERIFICATION**
- User uploadează documente KYC
- Admin aprobă/respinge KYC
- User primește notificare despre status KYC

### **6. SUBSCRIPTION**
- Subscription expiră în 7 zile
- Subscription expiră în 3 zile
- Subscription expiră în 1 zi
- Subscription expirat

### **7. PAYMENTS (Viitor)**
- Payment în escrow
- Payment released
- Payment failed

---

## 📧 NOTIFICĂRI EMAIL - Când să trimitem?

### **Pentru CLIENȚI:**

| Eveniment | Când | Prioritate | Template Email |
|-----------|------|------------|----------------|
| **Ofertă nouă primită** | Transportator trimite ofertă pentru shipment-ul clientului | 🔴 HIGH | "Ai primit o ofertă nouă de la [Transporter] pentru shipment-ul [Origin → Destination]" |
| **Ofertă acceptată de transportator** | Transportator acceptă contra-oferta clientului | 🔴 HIGH | "Oferta ta a fost acceptată de [Transporter]" |
| **Shipment confirmat** | Client acceptă ofertă → shipment devine confirmed | 🟡 MEDIUM | "Shipment-ul tău [ID] a fost confirmat cu [Transporter]" |
| **Status update: Picked Up** | Transportator marchează containerul ca ridicat | 🟡 MEDIUM | "Containerul tău a fost ridicat de [Transporter]" |
| **Status update: In Transit** | Container în tranzit | 🟢 LOW | "Containerul tău este în tranzit către [Destination]" |
| **Status update: Delivered** | Container livrat | 🔴 HIGH | "Containerul tău a fost livrat la destinație!" |
| **Mesaj nou** | Transportator trimite mesaj în chat | 🟡 MEDIUM | "Ai un mesaj nou de la [Transporter] pentru shipment [ID]" |
| **KYC Aprobat** | Admin aprobă KYC | 🔴 HIGH | "Contul tău a fost verificat! Poți acum posta shipment-uri." |
| **KYC Respins** | Admin respinge KYC | 🔴 HIGH | "Verificarea KYC a fost respinsă. Motiv: [reason]" |
| **Subscription expiring** | 7/3/1 zile înainte de expirare | 🟡 MEDIUM | "Subscription-ul tău expiră în [X] zile" |
| **Subscription expired** | Subscription expirat | 🔴 HIGH | "Subscription-ul tău a expirat. Reînnoiește pentru acces complet." |

### **Pentru TRANSPORTATORI:**

| Eveniment | Când | Prioritate | Template Email |
|-----------|------|------------|----------------|
| **Shipment nou disponibil** | Client postează shipment care match-uiește cu țările transportatorului | 🟡 MEDIUM | "Shipment nou disponibil: [Origin → Destination], [Container Type]" |
| **Ofertă acceptată** | Client acceptă oferta transportatorului | 🔴 HIGH | "Felicitări! Oferta ta pentru shipment [ID] a fost acceptată" |
| **Ofertă respinsă** | Client respinge oferta | 🟡 MEDIUM | "Oferta ta pentru shipment [ID] a fost respinsă" |
| **Ofertă expirată** | Oferta ajunge la valid_until | 🟢 LOW | "Oferta ta pentru shipment [ID] a expirat" |
| **Mesaj nou** | Client trimite mesaj în chat | 🟡 MEDIUM | "Ai un mesaj nou de la [Client] pentru shipment [ID]" |
| **KYC Aprobat** | Admin aprobă KYC | 🔴 HIGH | "Contul tău a fost verificat! Poți acum trimite oferte." |
| **KYC Respins** | Admin respinge KYC | 🔴 HIGH | "Verificarea KYC a fost respinsă. Motiv: [reason]" |
| **Subscription expiring** | 7/3/1 zile înainte de expirare | 🟡 MEDIUM | "Subscription-ul tău expiră în [X] zile" |
| **Subscription expired** | 🔴 HIGH | "Subscription-ul tău a expirat. Reînnoiește pentru a vedea shipment-uri." |
| **Reminder: Update status** | 24h după picked_up fără update | 🟢 LOW | "Nu uita să updatezi statusul pentru shipment [ID]" |

### **Pentru ADMIN:**

| Eveniment | Când | Prioritate | Template Email |
|-----------|------|------------|----------------|
| **KYC submission nou** | User uploadează documente KYC | 🟡 MEDIUM | "User nou [Company] a trimis documente KYC pentru verificare" |
| **Dispute deschis** | User deschide dispute | 🔴 HIGH | "Dispute nou deschis pentru shipment [ID]" |
| **Payment în escrow** | Payment mare în escrow (>€2000) | 🟡 MEDIUM | "Payment de €[amount] în escrow pentru shipment [ID]" |
| **Suspicious activity** | Multiple failed logins | 🔴 HIGH | "Activitate suspectă detectată pentru account [email]" |

---

## 🔔 NOTIFICĂRI DASHBOARD - Când să afișăm?

### **Caracteristici Dashboard Notifications:**
- Afișare în real-time (sau la refresh)
- Badge cu număr de notificări necitite
- Click pe notificare → redirect la pagina relevantă
- Mark as read individual sau bulk
- Păstrare istoric 30 zile

### **Pentru CLIENȚI:**

| Eveniment | Mesaj Dashboard | Link |
|-----------|-----------------|------|
| **Ofertă nouă** | "Ofertă nouă de la [Transporter] - €[price]" | `/dashboard/client/shipments/[id]` |
| **Ofertă acceptată** | "[Transporter] a acceptat oferta ta" | `/dashboard/client/shipments/[id]` |
| **Status: Picked Up** | "Container ridicat pentru shipment [ID]" | `/dashboard/client/shipments/[id]` |
| **Status: Delivered** | "Container livrat pentru shipment [ID]" | `/dashboard/client/shipments/[id]` |
| **Mesaj nou** | "Mesaj nou de la [Transporter]" | `/dashboard/client/messages/[shipment_id]` |
| **KYC Aprobat** | "Contul tău a fost verificat ✓" | `/dashboard/client/settings` |
| **KYC Respins** | "KYC respins - verifică motivul" | `/dashboard/client/settings` |

### **Pentru TRANSPORTATORI:**

| Eveniment | Mesaj Dashboard | Link |
|-----------|-----------------|------|
| **Shipment nou** | "Shipment nou: [Origin → Destination]" | `/dashboard/transporter/shipments` |
| **Ofertă acceptată** | "Oferta ta pentru [ID] a fost acceptată!" | `/dashboard/transporter/jobs` |
| **Ofertă respinsă** | "Oferta ta pentru [ID] a fost respinsă" | `/dashboard/transporter/offers` |
| **Mesaj nou** | "Mesaj nou de la [Client]" | `/dashboard/transporter/messages/[shipment_id]` |
| **KYC Aprobat** | "Contul tău a fost verificat ✓" | `/dashboard/transporter/settings` |
| **Reminder status** | "Updatează statusul pentru shipment [ID]" | `/dashboard/transporter/jobs` |

---

## 🏗️ Arhitectură Tehnică

### **1. Bază de Date**

```sql
-- Tabel notifications (există deja în types/index.ts)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'offer_new', 'offer_accepted', 'shipment_status', 'message_new', 'kyc_approved', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- URL către pagina relevantă
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata pentru filtrare și context
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  related_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL -- cine a declanșat notificarea
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Tabel email_queue (pentru trimitere asincronă)
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_queue_status ON email_queue(status, created_at);
```

### **2. Server Actions**

**`src/lib/actions/notifications.ts`** (NOU)
```typescript
// Funcții pentru notificări dashboard
- createNotification(userId, type, title, message, link, metadata)
- getUserNotifications(userId, limit, offset)
- markNotificationAsRead(notificationId)
- markAllNotificationsAsRead(userId)
- getUnreadCount(userId)
- deleteOldNotifications() // cleanup după 30 zile
```

**`src/lib/actions/emails.ts`** (NOU)
```typescript
// Funcții pentru email notifications
- queueEmail(userId, emailType, templateData)
- sendEmail(emailId) // procesare din queue
- processEmailQueue() // cron job pentru trimitere batch
```

### **3. Triggers Database**

**Supabase Database Webhooks sau Functions:**

```sql
-- Trigger când se creează ofertă nouă
CREATE OR REPLACE FUNCTION notify_new_offer()
RETURNS TRIGGER AS $$
BEGIN
  -- Creează notificare dashboard pentru client
  INSERT INTO notifications (user_id, type, title, message, link, shipment_id, offer_id, related_user_id)
  SELECT 
    s.client_id,
    'offer_new',
    'Ofertă nouă primită',
    'Ai primit o ofertă de la ' || p.company_name || ' - €' || NEW.price,
    '/dashboard/client/shipments/' || NEW.shipment_id,
    NEW.shipment_id,
    NEW.id,
    NEW.transporter_id
  FROM shipments s
  JOIN profiles p ON p.id = NEW.transporter_id
  WHERE s.id = NEW.shipment_id;
  
  -- Queue email pentru client
  INSERT INTO email_queue (user_id, email_type, recipient_email, subject, template_data)
  SELECT 
    s.client_id,
    'offer_new',
    p.email,
    'Ofertă nouă pentru shipment-ul tău',
    jsonb_build_object(
      'transporter_name', tp.company_name,
      'price', NEW.price,
      'shipment_id', NEW.shipment_id,
      'origin', s.origin_city || ', ' || s.origin_country,
      'destination', s.destination_city || ', ' || s.destination_country
    )
  FROM shipments s
  JOIN profiles p ON p.id = s.client_id
  JOIN profiles tp ON tp.id = NEW.transporter_id
  WHERE s.id = NEW.shipment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_offer
AFTER INSERT ON offers
FOR EACH ROW
EXECUTE FUNCTION notify_new_offer();
```

**Triggers similare pentru:**
- Ofertă acceptată
- Shipment status update
- Mesaj nou
- KYC approved/rejected
- Subscription expiring

### **4. Email Service**

**Provider:** Resend, SendGrid, sau AWS SES

**Template-uri Email:**
- HTML responsive templates
- Personalizare cu date dinamice
- Unsubscribe link
- Branding Trade Container

**Cron Job pentru procesare queue:**
```typescript
// Rulează la fiecare 5 minute
export async function processEmailQueue() {
  const pendingEmails = await getPendingEmails(limit: 100)
  
  for (const email of pendingEmails) {
    try {
      await sendEmailViaProvider(email)
      await markEmailAsSent(email.id)
    } catch (error) {
      await incrementAttempts(email.id, error.message)
      if (email.attempts >= 3) {
        await markEmailAsFailed(email.id)
      }
    }
  }
}
```

### **5. Frontend Components**

**`src/components/notifications/notification-bell.tsx`** (NOU)
- Bell icon cu badge unread count
- Dropdown cu ultimele 5 notificări
- Link către pagina completă de notificări
- Real-time updates (polling sau websockets)

**`src/app/dashboard/[role]/notifications/page.tsx`** (NOU)
- Lista completă notificări
- Filtrare: all, unread, read
- Filtrare pe tip: offers, shipments, messages, kyc
- Pagination
- Mark all as read
- Delete old notifications

---

## 📋 Preferințe Utilizator (Settings)

**În pagina Settings → Notifications:**

```typescript
interface NotificationPreferences {
  // Email notifications
  email_offer_new: boolean
  email_offer_accepted: boolean
  email_shipment_status: boolean
  email_message_new: boolean
  email_kyc_status: boolean
  email_subscription: boolean
  
  // Dashboard notifications (întotdeauna ON)
  dashboard_enabled: true // nu se poate dezactiva
  
  // Frequency
  email_digest: 'instant' | 'daily' | 'weekly' // pentru notificări LOW priority
}
```

---

## 🚀 Plan de Implementare

### **Faza 1: Database & Backend (2-3 zile)**
1. ✅ Creează tabelele `notifications` și `email_queue`
2. ✅ Creează server actions pentru notifications
3. ✅ Creează server actions pentru emails
4. ✅ Implementează triggers pentru evenimente critice

### **Faza 2: Email Service (2 zile)**
1. ✅ Setup provider (Resend recomandat)
2. ✅ Creează template-uri HTML pentru fiecare tip email
3. ✅ Implementează queue processing
4. ✅ Setup cron job pentru trimitere

### **Faza 3: Frontend Dashboard (2 zile)**
1. ✅ Notification bell component
2. ✅ Notifications page
3. ✅ Real-time updates (polling)
4. ✅ Mark as read functionality

### **Faza 4: Settings & Preferences (1 zi)**
1. ✅ UI pentru notification preferences
2. ✅ Save/load preferences
3. ✅ Respectare preferințe în triggers

### **Faza 5: Testing & Optimization (2 zile)**
1. ✅ Test toate tipurile de notificări
2. ✅ Test email delivery
3. ✅ Performance optimization
4. ✅ Cleanup old notifications

**Total: 9-10 zile**

---

## 💡 Best Practices

### **Email:**
- ✅ Subject line clar și concis
- ✅ CTA (Call-to-Action) vizibil
- ✅ Link direct către pagina relevantă
- ✅ Unsubscribe option
- ✅ Mobile responsive
- ✅ Plain text fallback

### **Dashboard:**
- ✅ Real-time sau near real-time updates
- ✅ Badge cu unread count vizibil
- ✅ Grupare pe tip
- ✅ Auto-mark as read când user dă click
- ✅ Cleanup automat după 30 zile

### **Performance:**
- ✅ Indexuri pe `user_id`, `is_read`, `created_at`
- ✅ Pagination pentru liste mari
- ✅ Batch processing pentru emails
- ✅ Rate limiting pentru a evita spam

---

## 📊 Metrici de Success

### **Email:**
- Open rate > 40%
- Click-through rate > 15%
- Unsubscribe rate < 2%
- Delivery rate > 95%

### **Dashboard:**
- Notification read rate > 70%
- Average time to read < 1 hour (pentru HIGH priority)
- User engagement cu notificări > 60%

---

## 🔐 Securitate & Privacy

### **GDPR Compliance:**
- ✅ Opt-in explicit pentru email notifications
- ✅ Opt-out ușor (unsubscribe)
- ✅ Data retention 30 zile pentru notificări
- ✅ Nu trimitem date sensibile în email (doar link)

### **Security:**
- ✅ Verificare ownership pentru mark as read
- ✅ Rate limiting pentru a evita spam
- ✅ Sanitizare input în mesaje
- ✅ HTTPS pentru toate link-urile

---

*Document generat: 4 Martie 2026*
*Trade Container Platform - European Container Freight Exchange*
