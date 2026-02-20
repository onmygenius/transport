-- =============================================
-- EUROPEAN CONTAINER FREIGHT EXCHANGE
-- Supabase Database Schema
-- =============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE user_role AS ENUM ('admin', 'transporter', 'client');
CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'suspended', 'cancelled');
CREATE TYPE subscription_plan AS ENUM ('monthly', 'annual');
CREATE TYPE shipment_status AS ENUM ('pending', 'offer_received', 'confirmed', 'picked_up', 'in_transit', 'delivered', 'completed', 'disputed', 'cancelled');
CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'expired', 'withdrawn');
CREATE TYPE container_type AS ENUM ('20ft', '40ft', '40ft_hc', '45ft', 'reefer_20ft', 'reefer_40ft', 'open_top', 'flat_rack');
CREATE TYPE equipment_type AS ENUM ('flatbed', 'curtainsider', 'reefer', 'tank', 'lowbed', 'mega_trailer', 'other');
CREATE TYPE transport_type AS ENUM ('fcl', 'lcl');
CREATE TYPE cargo_type AS ENUM ('general', 'dangerous', 'perishable', 'oversized');
CREATE TYPE dispute_status AS ENUM ('open', 'in_review', 'resolved', 'closed');
CREATE TYPE document_type AS ENUM ('cmr', 'invoice', 'proof_of_pickup', 'proof_of_delivery', 'kyc_registration', 'kyc_license', 'kyc_insurance', 'other');

-- =============================================
-- PROFILES (extends auth.users)
-- =============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'client',
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  company_cif TEXT,
  company_country TEXT,
  company_address TEXT,
  phone TEXT,
  contact_person TEXT,
  kyc_status kyc_status NOT NULL DEFAULT 'pending',
  kyc_rejection_reason TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TRANSPORTER PROFILES
-- =============================================

CREATE TABLE transporter_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  fleet_size INTEGER DEFAULT 1,
  equipment_types equipment_type[] DEFAULT '{}',
  container_types container_type[] DEFAULT '{}',
  operating_countries TEXT[] DEFAULT '{}',
  operating_regions TEXT[] DEFAULT '{}',
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  completed_shipments INTEGER DEFAULT 0,
  avg_delivery_days DECIMAL(5,2) DEFAULT 0,
  stripe_account_id TEXT,
  wallet_balance DECIMAL(12,2) DEFAULT 0,
  wallet_escrow DECIMAL(12,2) DEFAULT 0,
  iban TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- CLIENT PROFILES
-- =============================================

CREATE TABLE client_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  total_shipments INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SUBSCRIPTIONS
-- =============================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  stripe_subscription_id TEXT,
  stripe_payment_intent_id TEXT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SYSTEM SETTINGS
-- =============================================

CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO system_settings (key, value, description) VALUES
  ('subscription_monthly_transporter', '49', 'Monthly subscription price for transporters (EUR)'),
  ('subscription_annual_transporter', '470', 'Annual subscription price for transporters (EUR)'),
  ('subscription_monthly_client', '29', 'Monthly subscription price for clients (EUR)'),
  ('subscription_annual_client', '278', 'Annual subscription price for clients (EUR)'),
  ('subscription_annual_discount', '20', 'Annual subscription discount percentage'),
  ('trial_days', '14', 'Free trial period in days'),
  ('platform_commission_percent', '3', 'Platform commission percentage per transaction'),
  ('platform_commission_min', '10', 'Minimum platform commission (EUR)'),
  ('platform_commission_max', '500', 'Maximum platform commission (EUR)'),
  ('max_active_posts_free', '1', 'Max active posts without subscription'),
  ('max_active_posts_subscribed', '20', 'Max active posts with subscription'),
  ('post_expiry_days', '30', 'Days until post expires automatically'),
  ('offer_expiry_hours', '72', 'Hours until offer expires automatically'),
  ('max_file_size_mb', '10', 'Maximum file upload size in MB'),
  ('escrow_release_days', '3', 'Days after delivery to auto-release escrow'),
  ('payout_minimum', '50', 'Minimum payout amount (EUR)'),
  ('matching_radius_km', '200', 'Default matching radius in km'),
  ('platform_name', 'FreightEx Europe', 'Platform name'),
  ('support_email', 'support@freightex.eu', 'Support email address');

-- =============================================
-- SHIPMENTS (Cereri Transport)
-- =============================================

CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id),
  transporter_id UUID REFERENCES profiles(id),
  origin_city TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  origin_address TEXT,
  destination_city TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  destination_address TEXT,
  container_type container_type NOT NULL,
  container_count INTEGER NOT NULL DEFAULT 1,
  cargo_weight DECIMAL(10,2) NOT NULL,
  cargo_type cargo_type NOT NULL DEFAULT 'general',
  transport_type transport_type NOT NULL DEFAULT 'fcl',
  pickup_date DATE NOT NULL,
  delivery_date DATE,
  budget DECIMAL(10,2),
  budget_visible BOOLEAN DEFAULT true,
  currency TEXT NOT NULL DEFAULT 'EUR',
  special_instructions TEXT,
  status shipment_status NOT NULL DEFAULT 'pending',
  distance_km INTEGER,
  agreed_price DECIMAL(10,2),
  platform_commission DECIMAL(10,2),
  stripe_payment_intent_id TEXT,
  escrow_released_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TRUCK AVAILABILITY (Camioane Disponibile)
-- =============================================

CREATE TABLE truck_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  origin_city TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  destination_city TEXT,
  destination_country TEXT,
  radius_km INTEGER NOT NULL DEFAULT 100,
  available_from DATE NOT NULL,
  available_until DATE,
  equipment_type equipment_type NOT NULL,
  container_types container_type[] NOT NULL DEFAULT '{}',
  max_weight DECIMAL(10,2) NOT NULL,
  price_per_km DECIMAL(8,2),
  fixed_price DECIMAL(10,2),
  currency TEXT NOT NULL DEFAULT 'EUR',
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- OFFERS
-- =============================================

CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  transporter_id UUID NOT NULL REFERENCES profiles(id),
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  price_breakdown TEXT,
  estimated_days INTEGER NOT NULL,
  available_from DATE NOT NULL,
  message TEXT,
  valid_until TIMESTAMPTZ NOT NULL,
  status offer_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shipment_id, transporter_id)
);

-- =============================================
-- DOCUMENTS
-- =============================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  type document_type NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- RATINGS
-- =============================================

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id),
  from_user_id UUID NOT NULL REFERENCES profiles(id),
  to_user_id UUID NOT NULL REFERENCES profiles(id),
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  review_text TEXT,
  punctuality INTEGER CHECK (punctuality >= 1 AND punctuality <= 5),
  communication INTEGER CHECK (communication >= 1 AND communication <= 5),
  cargo_care INTEGER CHECK (cargo_care >= 1 AND cargo_care <= 5),
  documentation INTEGER CHECK (documentation >= 1 AND documentation <= 5),
  reply TEXT,
  reply_at TIMESTAMPTZ,
  is_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shipment_id, from_user_id)
);

-- =============================================
-- DISPUTES
-- =============================================

CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id),
  opened_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status dispute_status NOT NULL DEFAULT 'open',
  admin_notes TEXT,
  resolution TEXT,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- CHAT MESSAGES
-- =============================================

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_name TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- AUDIT LOGS
-- =============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SAVED FILTERS (Alerte automate transportatori)
-- =============================================

CREATE TABLE saved_filters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  notify_email BOOLEAN DEFAULT true,
  notify_inapp BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_kyc_status ON profiles(kyc_status);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_expires_at ON subscriptions(expires_at);
CREATE INDEX idx_shipments_client_id ON shipments(client_id);
CREATE INDEX idx_shipments_transporter_id ON shipments(transporter_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_origin_country ON shipments(origin_country);
CREATE INDEX idx_shipments_destination_country ON shipments(destination_country);
CREATE INDEX idx_shipments_pickup_date ON shipments(pickup_date);
CREATE INDEX idx_truck_availability_transporter_id ON truck_availability(transporter_id);
CREATE INDEX idx_truck_availability_is_active ON truck_availability(is_active);
CREATE INDEX idx_offers_shipment_id ON offers(shipment_id);
CREATE INDEX idx_offers_transporter_id ON offers(transporter_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_chat_messages_shipment_id ON chat_messages(shipment_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_transporter_profiles_updated_at BEFORE UPDATE ON transporter_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON client_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_truck_availability_updated_at BEFORE UPDATE ON truck_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'role', 'client')::user_role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION update_transporter_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE transporter_profiles
  SET
    rating_average = (
      SELECT ROUND(AVG(stars)::numeric, 2)
      FROM ratings
      WHERE to_user_id = NEW.to_user_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM ratings
      WHERE to_user_id = NEW.to_user_id
    )
  WHERE profile_id = NEW.to_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_rating_created
  AFTER INSERT ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_transporter_rating();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transporter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE truck_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Transporter profiles policies
CREATE POLICY "Transporter profiles viewable by all" ON transporter_profiles FOR SELECT USING (true);
CREATE POLICY "Transporters can update own profile" ON transporter_profiles FOR UPDATE USING (
  profile_id = auth.uid()
);
CREATE POLICY "Transporters can insert own profile" ON transporter_profiles FOR INSERT WITH CHECK (
  profile_id = auth.uid()
);

-- Client profiles policies
CREATE POLICY "Client profiles viewable by all" ON client_profiles FOR SELECT USING (true);
CREATE POLICY "Clients can update own profile" ON client_profiles FOR UPDATE USING (
  profile_id = auth.uid()
);
CREATE POLICY "Clients can insert own profile" ON client_profiles FOR INSERT WITH CHECK (
  profile_id = auth.uid()
);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all subscriptions" ON subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update subscriptions" ON subscriptions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Shipments policies
CREATE POLICY "Shipments viewable by involved parties" ON shipments FOR SELECT USING (
  client_id = auth.uid() OR
  transporter_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'transporter')
);
CREATE POLICY "Clients can insert shipments" ON shipments FOR INSERT WITH CHECK (
  client_id = auth.uid() AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client')
);
CREATE POLICY "Clients can update own shipments" ON shipments FOR UPDATE USING (client_id = auth.uid());
CREATE POLICY "Admins can update any shipment" ON shipments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Truck availability policies
CREATE POLICY "Truck availability viewable by all authenticated" ON truck_availability FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Transporters can manage own availability" ON truck_availability FOR ALL USING (transporter_id = auth.uid());

-- Offers policies
CREATE POLICY "Offers viewable by involved parties" ON offers FOR SELECT USING (
  transporter_id = auth.uid() OR
  EXISTS (SELECT 1 FROM shipments WHERE id = offers.shipment_id AND client_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Transporters can insert offers" ON offers FOR INSERT WITH CHECK (
  transporter_id = auth.uid() AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'transporter')
);
CREATE POLICY "Transporters can update own offers" ON offers FOR UPDATE USING (transporter_id = auth.uid());

-- Documents policies
CREATE POLICY "Documents viewable by involved parties" ON documents FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM shipments WHERE id = documents.shipment_id AND (client_id = auth.uid() OR transporter_id = auth.uid())) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can upload own documents" ON documents FOR INSERT WITH CHECK (user_id = auth.uid());

-- Ratings policies
CREATE POLICY "Ratings are publicly viewable" ON ratings FOR SELECT USING (true);
CREATE POLICY "Users can insert ratings for completed shipments" ON ratings FOR INSERT WITH CHECK (
  from_user_id = auth.uid()
);
CREATE POLICY "Users can reply to own ratings" ON ratings FOR UPDATE USING (to_user_id = auth.uid());

-- Disputes policies
CREATE POLICY "Disputes viewable by involved parties" ON disputes FOR SELECT USING (
  opened_by = auth.uid() OR
  EXISTS (SELECT 1 FROM shipments WHERE id = disputes.shipment_id AND (client_id = auth.uid() OR transporter_id = auth.uid())) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can open disputes" ON disputes FOR INSERT WITH CHECK (opened_by = auth.uid());
CREATE POLICY "Admins can update disputes" ON disputes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Chat messages policies
CREATE POLICY "Chat messages viewable by shipment parties" ON chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM shipments WHERE id = chat_messages.shipment_id AND (client_id = auth.uid() OR transporter_id = auth.uid())) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can send messages in own shipments" ON chat_messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (SELECT 1 FROM shipments WHERE id = chat_messages.shipment_id AND (client_id = auth.uid() OR transporter_id = auth.uid()))
);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Audit logs policies
CREATE POLICY "Only admins can view audit logs" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Saved filters policies
CREATE POLICY "Users can manage own saved filters" ON saved_filters FOR ALL USING (user_id = auth.uid());

-- System settings policies
CREATE POLICY "System settings viewable by all authenticated" ON system_settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Only admins can update system settings" ON system_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
