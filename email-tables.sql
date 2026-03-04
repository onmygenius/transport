-- =============================================
-- EMAIL SYSTEM TABLES
-- Run this in Supabase SQL Editor
-- =============================================

-- Email Queue Table (for async email sending)
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_user ON email_queue(user_id);

-- Email Preferences Table
CREATE TABLE IF NOT EXISTS email_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  email_offer_new BOOLEAN DEFAULT true,
  email_offer_accepted BOOLEAN DEFAULT true,
  email_shipment_status BOOLEAN DEFAULT true,
  email_message_new BOOLEAN DEFAULT true,
  email_kyc_status BOOLEAN DEFAULT true,
  email_subscription BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- Email queue policies (only system can manage)
DROP POLICY IF EXISTS "Only system can manage email queue" ON email_queue;
CREATE POLICY "Only system can manage email queue" ON email_queue FOR ALL USING (false);

-- Email preferences policies
DROP POLICY IF EXISTS "Users can view own email preferences" ON email_preferences;
CREATE POLICY "Users can view own email preferences" ON email_preferences FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own email preferences" ON email_preferences;
CREATE POLICY "Users can update own email preferences" ON email_preferences FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own email preferences" ON email_preferences;
CREATE POLICY "Users can insert own email preferences" ON email_preferences FOR INSERT WITH CHECK (user_id = auth.uid());
