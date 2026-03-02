# 📧 EMAIL & NOTIFICATIONS STRATEGY
## FreightEx Europe - European Container Freight Exchange

---

## 📊 CURRENT SITUATION ANALYSIS

### ✅ What EXISTS:

#### 1. Database Infrastructure
- **Table `notifications`** - Complete structure:
  ```sql
  - id (UUID)
  - user_id (UUID) → profiles
  - type (TEXT) - notification type
  - title (TEXT) - notification title
  - message (TEXT) - notification content
  - link (TEXT) - link to relevant resource
  - is_read (BOOLEAN) - read status
  - created_at (TIMESTAMPTZ)
  ```
- **RLS Policies:** ✅ Users can view/update own notifications
- **Indexes:** ✅ user_id, is_read

#### 2. UI Components
- **Bell icon** in headers (Client, Transporter, Admin)
- **Admin notifications page** with full UI (filters, search, pagination)
- **Hardcoded badge numbers:** Client (3), Transporter (2)

### ❌ What is MISSING:

#### 1. In-App Notifications
- ❌ No connection to database
- ❌ No dropdown/modal for displaying notifications
- ❌ No "mark as read" functionality
- ❌ No real-time updates
- ❌ No automatic notification creation on events

#### 2. Email Notifications
- ❌ No email service integration (Resend, SendGrid, etc.)
- ❌ No email templates
- ❌ No trigger functions for sending emails
- ❌ No user preferences for email notifications

---

## 🎯 PROPOSED ARCHITECTURE

### Phase 1: IN-APP NOTIFICATIONS (Priority 1)

#### A. Components to Create:
1. **NotificationDropdown** component
   - Fetch notifications from DB
   - Display list with title, message, timestamp
   - Mark as read on click
   - Link to relevant resource
   - "Mark all as read" button
   - Empty state

2. **NotificationBadge** component
   - Real count from DB (unread notifications)
   - Real-time updates via Supabase Realtime
   - Visual indicator (red dot)

3. **NotificationProvider** (Context)
   - Global state for notifications
   - Fetch notifications on mount
   - Subscribe to real-time updates
   - Mark as read function
   - Delete notification function

#### B. Integration Points:
- **Client Header:** Replace hardcoded "3" with real count
- **Transporter Header:** Replace hardcoded "2" with real count
- **Admin Header:** Connect to notifications system

#### C. Database Functions:
```sql
-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (p_user_id, p_type, p_title, p_message, p_link)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET is_read = true
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET is_read = true
  WHERE user_id = auth.uid() AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### Phase 2: EMAIL NOTIFICATIONS (Priority 2)

#### A. Email Service: **Resend**
**Why Resend?**
- ✅ Free tier: 3,000 emails/month
- ✅ Simple API
- ✅ Great deliverability
- ✅ React Email support (HTML templates)
- ✅ Built for developers

**Alternative:** SendGrid (10,000 emails/month free)

#### B. Setup:
1. Create Resend account
2. Verify domain (optional, can use resend.dev)
3. Get API key
4. Add to environment variables:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

#### C. Email Templates (React Email):
```typescript
// emails/new-offer.tsx
export function NewOfferEmail({ 
  clientName, 
  shipmentId, 
  origin, 
  destination, 
  price 
}) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Heading>New Offer Received!</Heading>
          <Text>Hi {clientName},</Text>
          <Text>
            You have received a new offer for your shipment 
            from {origin} to {destination}.
          </Text>
          <Text>Offered Price: €{price}</Text>
          <Button href={`https://app.freightex.eu/dashboard/client/shipments/${shipmentId}`}>
            View Offer
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
```

#### D. Email Sending Function:
```typescript
// lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  template,
  data
}: {
  to: string
  subject: string
  template: string
  data: any
}) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: 'FreightEx <notifications@freightex.eu>',
      to: [to],
      subject,
      react: getEmailTemplate(template, data)
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Email send exception:', error)
    return { success: false, error }
  }
}
```

---

## 🔔 NOTIFICATION EVENTS & TRIGGERS

### Event Matrix:

| Event | Recipient | In-App | Email | Priority |
|-------|-----------|--------|-------|----------|
| **New offer received** | Client | ✅ | ✅ | High |
| **Offer accepted** | Transporter | ✅ | ✅ | High |
| **Offer rejected** | Transporter | ✅ | ❌ | Medium |
| **Shipment confirmed** | Both | ✅ | ✅ | High |
| **Shipment picked up** | Client | ✅ | ❌ | Medium |
| **Shipment in transit** | Client | ✅ | ❌ | Low |
| **Shipment delivered** | Both | ✅ | ✅ | High |
| **Shipment completed** | Both | ✅ | ✅ | High |
| **Payment received** | Transporter | ✅ | ✅ | High |
| **New message** | Recipient | ✅ | ❌ | Medium |
| **Dispute opened** | Both | ✅ | ✅ | Critical |
| **Dispute resolved** | Both | ✅ | ✅ | High |
| **KYC submitted** | Admin | ✅ | ✅ | High |
| **KYC approved** | Transporter | ✅ | ✅ | High |
| **KYC rejected** | Transporter | ✅ | ✅ | High |
| **Subscription expiring** | User | ✅ | ✅ | High |
| **Subscription expired** | User | ✅ | ✅ | Critical |

---

## 📝 NOTIFICATION TEMPLATES

### 1. New Offer Received (Client)
**In-App:**
```
Title: "New Offer Received"
Message: "You received an offer of €{price} for shipment {origin} → {destination}"
Link: "/dashboard/client/shipments/{shipmentId}"
Type: "offer"
```

**Email:**
```
Subject: "New Offer for Your Shipment"
Template: new-offer.tsx
```

### 2. Offer Accepted (Transporter)
**In-App:**
```
Title: "Offer Accepted!"
Message: "{clientName} accepted your offer of €{price}"
Link: "/dashboard/transporter/jobs"
Type: "offer"
```

**Email:**
```
Subject: "Your Offer Has Been Accepted"
Template: offer-accepted.tsx
```

### 3. Shipment Status Changed
**In-App:**
```
Title: "Shipment Status Updated"
Message: "Shipment {origin} → {destination} is now {status}"
Link: "/dashboard/.../shipments/{shipmentId}"
Type: "shipment"
```

**Email:** Only for "delivered" and "completed"

### 4. Payment Received (Transporter)
**In-App:**
```
Title: "Payment Received"
Message: "You received €{amount} for shipment {shipmentId}"
Link: "/dashboard/transporter/wallet"
Type: "payment"
```

**Email:**
```
Subject: "Payment Received - €{amount}"
Template: payment-received.tsx
```

### 5. Dispute Opened
**In-App:**
```
Title: "Dispute Opened"
Message: "A dispute has been opened for shipment {shipmentId}"
Link: "/dashboard/.../disputes/{disputeId}"
Type: "dispute"
```

**Email:**
```
Subject: "URGENT: Dispute Opened"
Template: dispute-opened.tsx
```

### 6. KYC Status Changed
**In-App:**
```
Title: "KYC {status}"
Message: "Your KYC verification has been {status}"
Link: "/dashboard/transporter/settings"
Type: "kyc"
```

**Email:**
```
Subject: "KYC Verification {Status}"
Template: kyc-status.tsx
```

---

## 🛠️ IMPLEMENTATION PLAN

### Step 1: Database Functions (1-2 hours)
- [ ] Create `create_notification()` function
- [ ] Create `mark_notification_read()` function
- [ ] Create `mark_all_notifications_read()` function
- [ ] Test functions in Supabase SQL Editor

### Step 2: Notification Context & Hooks (2-3 hours)
- [ ] Create `NotificationProvider` context
- [ ] Create `useNotifications` hook
- [ ] Implement fetch notifications
- [ ] Implement real-time subscription
- [ ] Implement mark as read

### Step 3: UI Components (3-4 hours)
- [ ] Create `NotificationDropdown` component
- [ ] Create `NotificationBadge` component
- [ ] Create `NotificationItem` component
- [ ] Style components (Tailwind)
- [ ] Add animations (framer-motion optional)

### Step 4: Integration (2-3 hours)
- [ ] Replace hardcoded badge in Client Header
- [ ] Replace hardcoded badge in Transporter Header
- [ ] Add dropdown to headers
- [ ] Test real-time updates
- [ ] Test mark as read

### Step 5: Event Triggers - Server Actions (4-6 hours)
- [ ] Create notification on new offer
- [ ] Create notification on offer accepted
- [ ] Create notification on shipment status change
- [ ] Create notification on payment received
- [ ] Create notification on dispute opened
- [ ] Create notification on KYC status change

### Step 6: Email Setup (2-3 hours)
- [ ] Create Resend account
- [ ] Add API key to environment
- [ ] Install Resend SDK: `npm install resend`
- [ ] Install React Email: `npm install @react-email/components`
- [ ] Create email utility functions

### Step 7: Email Templates (4-6 hours)
- [ ] Create base email layout
- [ ] Create new-offer template
- [ ] Create offer-accepted template
- [ ] Create shipment-status template
- [ ] Create payment-received template
- [ ] Create dispute-opened template
- [ ] Create kyc-status template

### Step 8: Email Integration (3-4 hours)
- [ ] Add email sending to offer creation
- [ ] Add email sending to offer acceptance
- [ ] Add email sending to shipment completion
- [ ] Add email sending to payment
- [ ] Add email sending to dispute
- [ ] Add email sending to KYC status

### Step 9: User Preferences (2-3 hours)
- [ ] Add email_notifications column to profiles
- [ ] Create notification preferences UI in Settings
- [ ] Implement preference checks before sending email

### Step 10: Testing & Polish (2-3 hours)
- [ ] Test all notification flows
- [ ] Test email delivery
- [ ] Test real-time updates
- [ ] Fix bugs
- [ ] Polish UI/UX

---

## ⏱️ TIME ESTIMATES

| Phase | Tasks | Time |
|-------|-------|------|
| **Phase 1: In-App** | Steps 1-5 | 12-18 hours |
| **Phase 2: Email** | Steps 6-8 | 9-13 hours |
| **Phase 3: Preferences** | Step 9 | 2-3 hours |
| **Phase 4: Testing** | Step 10 | 2-3 hours |
| **TOTAL** | All steps | **25-37 hours** |

**Recommended:** 3-5 days of focused work

---

## 🎯 PRIORITIES

### Must Have (Phase 1):
1. ✅ In-app notifications functional
2. ✅ Real-time updates
3. ✅ Mark as read
4. ✅ Notifications for critical events (offer, shipment, payment)

### Should Have (Phase 2):
1. ✅ Email notifications for critical events
2. ✅ Email templates
3. ✅ User preferences

### Nice to Have (Phase 3):
1. ⏸️ Push notifications (mobile)
2. ⏸️ SMS notifications (Twilio)
3. ⏸️ Notification history page
4. ⏸️ Notification settings (granular control)

---

## 💡 TECHNICAL DECISIONS

### Real-time Updates:
**Option 1: Supabase Realtime** (Recommended)
- ✅ Built-in
- ✅ WebSocket based
- ✅ Free tier: 200 concurrent connections
- ✅ Automatic reconnection

**Option 2: Polling**
- ❌ Less efficient
- ❌ Delayed updates
- ✅ Simpler implementation

**Decision:** Use Supabase Realtime

### Email Service:
**Option 1: Resend** (Recommended)
- ✅ 3,000 emails/month free
- ✅ React Email support
- ✅ Simple API
- ✅ Great deliverability

**Option 2: SendGrid**
- ✅ 10,000 emails/month free
- ❌ More complex setup
- ❌ Older API

**Decision:** Use Resend

### Email Templates:
**Option 1: React Email** (Recommended)
- ✅ Write templates in React
- ✅ Type-safe
- ✅ Preview in browser
- ✅ Responsive by default

**Option 2: HTML strings**
- ❌ Hard to maintain
- ❌ No type safety
- ✅ Simpler

**Decision:** Use React Email

---

## 🔒 SECURITY CONSIDERATIONS

1. **RLS Policies:** ✅ Already implemented
2. **Email validation:** Validate email addresses before sending
3. **Rate limiting:** Prevent spam (max 10 notifications/minute per user)
4. **Unsubscribe link:** Required by law (GDPR)
5. **Data privacy:** Don't include sensitive data in emails
6. **API key security:** Store in environment variables, never commit

---

## 📊 MONITORING & ANALYTICS

### Metrics to Track:
1. **Notification delivery rate**
2. **Email open rate**
3. **Email click-through rate**
4. **Notification read rate**
5. **Time to read notification**
6. **Unsubscribe rate**

### Tools:
- Resend Dashboard (email analytics)
- Supabase Dashboard (database queries)
- Custom analytics table (optional)

---

## 🚀 NEXT STEPS

1. **Review this strategy document**
2. **Decide on priorities:** In-App only or In-App + Email?
3. **Approve implementation plan**
4. **Start with Phase 1 (In-App Notifications)**
5. **Test thoroughly**
6. **Deploy to production**
7. **Monitor and iterate**

---

## 📝 NOTES

- All timestamps should be in user's timezone
- Notifications should be deletable by user
- Consider notification grouping (e.g., "3 new offers")
- Add notification sound (optional, user preference)
- Consider digest emails (daily/weekly summary)
- Implement notification archiving (auto-delete after 30 days)

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-02  
**Status:** Draft - Awaiting Review
