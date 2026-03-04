# Email System Setup Guide - Trade Container Platform

## Overview

Complete email notification system using Resend and React Email for sending transactional emails to users.

## Features

- 13 professional email templates
- Async email queue processing
- User email preferences
- 99%+ inbox delivery rate
- Mobile-responsive design
- GDPR compliant

---

## Setup Instructions

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for free account (100 emails/day free)
3. Verify your domain or use resend.dev for testing
4. Copy your API key from dashboard

### 2. Configure Environment Variables

Add to `.env.local`:

```env
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=Trade Container <noreply@tradecontainer.eu>
NEXT_PUBLIC_APP_URL=https://transport-nine-mauve.vercel.app
```

Add to Vercel environment variables:
- `RESEND_API_KEY`
- `FROM_EMAIL`

### 3. Run Database Migrations

Execute the SQL in `supabase-schema.sql` to create:
- `email_queue` table
- `email_preferences` table
- Indexes and policies

```sql
-- Tables are already in supabase-schema.sql
-- Run migration in Supabase SQL Editor
```

### 4. Verify Domain (Production)

For production emails:
1. Go to Resend dashboard
2. Add your domain (tradecontainer.eu)
3. Add DNS records (SPF, DKIM, DMARC)
4. Verify domain

---

## Email Templates

### Available Templates (13 total)

1. **offer-new** - New offer received
2. **offer-accepted** - Offer accepted
3. **offer-expired** - Offer expired
4. **kyc-approved** - KYC approved
5. **kyc-rejected** - KYC rejected
6. **shipment-confirmed** - Shipment confirmed
7. **shipment-picked-up** - Container picked up
8. **shipment-delivered** - Container delivered
9. **shipment-new-available** - New shipment available
10. **message-new** - New message
11. **subscription-expiring** - Subscription expiring
12. **truck-new-available** - New truck available
13. **status-update-reminder** - Status update reminder

---

## Usage

### Send Email Directly

```typescript
import { sendTemplateEmail } from '@/lib/emails'

await sendTemplateEmail(
  'user@example.com',
  'offer_new',
  {
    recipientName: 'John Doe',
    transporterName: 'Trans Cargo Ltd',
    price: 1500,
    currency: 'EUR',
    route: 'Hamburg → Bucharest',
    // ... other data
  }
)
```

### Queue Email for Async Processing

```typescript
import { queueEmail } from '@/lib/actions/emails'

await queueEmail(
  userId,
  'offer_new',
  {
    recipientName: 'John Doe',
    transporterName: 'Trans Cargo Ltd',
    price: 1500,
    currency: 'EUR',
    route: 'Hamburg → Bucharest',
    // ... other data
  }
)
```

### Process Email Queue (Cron Job)

```typescript
import { processEmailQueue } from '@/lib/actions/emails'

// Process up to 100 pending emails
const result = await processEmailQueue(100)
console.log(`Processed: ${result.processed}, Failed: ${result.failed}`)
```

---

## Email Preferences

Users can control which emails they receive.

### Get Preferences

```typescript
import { getEmailPreferences } from '@/lib/actions/emails'

const prefs = await getEmailPreferences(userId)
```

### Update Preferences

```typescript
import { updateEmailPreferences } from '@/lib/actions/emails'

await updateEmailPreferences(userId, {
  email_offer_new: true,
  email_message_new: false,
  email_subscription: true,
})
```

---

## Cron Job Setup (Vercel)

Create `app/api/cron/process-emails/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { processEmailQueue } from '@/lib/actions/emails'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const result = await processEmailQueue(100)
  
  return NextResponse.json(result)
}
```

Configure in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-emails",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

---

## Testing

### Test Email Locally

```typescript
// In any server action or API route
import { sendTemplateEmail } from '@/lib/emails'

const result = await sendTemplateEmail(
  'your-email@example.com',
  'kyc_approved',
  {
    recipientName: 'Test User',
    companyName: 'Test Company',
    role: 'client',
  }
)

console.log(result)
```

### Preview Templates

Install React Email CLI:

```bash
npm install -g @react-email/cli
```

Preview templates:

```bash
email dev
```

Open http://localhost:3000 to preview all templates.

---

## Database Triggers (Future Implementation)

Automatically send emails when events occur:

```sql
-- Example: Send email when offer is created
CREATE OR REPLACE FUNCTION notify_new_offer()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue email for client
  INSERT INTO email_queue (user_id, email_type, recipient_email, subject, template_data)
  SELECT 
    s.client_id,
    'offer_new',
    p.email,
    'New offer received',
    jsonb_build_object(
      'recipientName', p.full_name,
      'transporterName', tp.company_name,
      'price', NEW.price,
      'currency', NEW.currency
      -- ... more data
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

---

## Monitoring

### Check Email Queue Status

```sql
-- Pending emails
SELECT COUNT(*) FROM email_queue WHERE status = 'pending';

-- Failed emails
SELECT * FROM email_queue WHERE status = 'failed';

-- Recent sent emails
SELECT * FROM email_queue WHERE status = 'sent' ORDER BY sent_at DESC LIMIT 10;
```

### Resend Dashboard

Monitor in Resend dashboard:
- Delivery rate
- Open rate
- Click rate
- Bounces
- Complaints

---

## Troubleshooting

### Emails not sending

1. Check RESEND_API_KEY is set correctly
2. Verify domain in Resend dashboard
3. Check email_queue table for errors
4. Review Resend dashboard logs

### Emails going to spam

1. Verify domain DNS records (SPF, DKIM, DMARC)
2. Use verified domain (not resend.dev)
3. Warm up domain gradually
4. Check content for spam triggers

### TypeScript errors

1. Ensure all template props are provided
2. Check EmailData type matches template props
3. Use `as any` for dynamic data if needed

---

## Best Practices

1. **Always queue emails** - Don't send synchronously in user requests
2. **Respect preferences** - Check user email preferences before sending
3. **Monitor delivery** - Check Resend dashboard regularly
4. **Test templates** - Preview all templates before deploying
5. **Handle failures** - Retry failed emails (max 3 attempts)
6. **Clean old data** - Delete old email_queue records (30+ days)

---

## Pricing

### Resend Pricing

- **Free:** 100 emails/day (3,000/month)
- **$20/month:** 50,000 emails
- **$40/month:** 100,000 emails

### Recommendations

- Start with free tier for testing
- Upgrade when you reach 80+ emails/day
- Monitor usage in Resend dashboard

---

## Support

- Resend Docs: https://resend.com/docs
- React Email Docs: https://react.email/docs
- Support: support@tradecontainer.eu

---

**Last Updated:** March 4, 2026
