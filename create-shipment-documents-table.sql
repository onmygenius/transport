-- =============================================
-- SHIPMENT DOCUMENTS TABLE
-- =============================================

-- Create function for updating updated_at column (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create document_type enum (only if it doesn't exist)
DO $$ BEGIN
  CREATE TYPE document_type AS ENUM (
    'cmr',
    'bol',
    'packing_list',
    'pod',
    'commercial_invoice',
    'customs_declaration',
    'insurance_certificate',
    'temperature_record',
    'weighbridge_certificate',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create document_status enum (only if it doesn't exist)
DO $$ BEGIN
  CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create shipment_documents table
CREATE TABLE shipment_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  uploaded_by_role TEXT NOT NULL CHECK (uploaded_by_role IN ('client', 'transporter')),
  document_type document_type NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_size INTEGER NOT NULL, -- bytes
  mime_type TEXT NOT NULL,
  status document_status DEFAULT 'pending',
  rejection_reason TEXT,
  notes TEXT, -- Optional notes about the document
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX idx_shipment_documents_shipment ON shipment_documents(shipment_id);
CREATE INDEX idx_shipment_documents_uploaded_by ON shipment_documents(uploaded_by);
CREATE INDEX idx_shipment_documents_type ON shipment_documents(document_type);

-- Enable RLS
ALTER TABLE shipment_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Clients can view all documents for their shipments
CREATE POLICY "Clients can view their shipment documents"
  ON shipment_documents FOR SELECT
  USING (
    shipment_id IN (
      SELECT id FROM shipments WHERE client_id = auth.uid()
    )
  );

-- RLS Policy: Transporters can view documents ONLY for accepted shipments
CREATE POLICY "Transporters can view accepted shipment documents"
  ON shipment_documents FOR SELECT
  USING (
    shipment_id IN (
      SELECT id FROM shipments 
      WHERE transporter_id = auth.uid() 
      AND status IN ('confirmed', 'in_transit', 'delivered', 'completed')
    )
  );

-- RLS Policy: Clients can upload documents for their shipments
CREATE POLICY "Clients can upload documents"
  ON shipment_documents FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid() AND
    uploaded_by_role = 'client' AND
    shipment_id IN (SELECT id FROM shipments WHERE client_id = auth.uid())
  );

-- RLS Policy: Transporters can upload documents for accepted shipments
CREATE POLICY "Transporters can upload documents"
  ON shipment_documents FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid() AND
    uploaded_by_role = 'transporter' AND
    shipment_id IN (
      SELECT id FROM shipments 
      WHERE transporter_id = auth.uid() 
      AND status IN ('confirmed', 'in_transit', 'delivered', 'completed')
    )
  );

-- RLS Policy: Users can update their own documents
CREATE POLICY "Users can update their own documents"
  ON shipment_documents FOR UPDATE
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());

-- RLS Policy: Users can delete their own documents
CREATE POLICY "Users can delete their own documents"
  ON shipment_documents FOR DELETE
  USING (uploaded_by = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_shipment_documents_updated_at
  BEFORE UPDATE ON shipment_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SUPABASE STORAGE BUCKET
-- =============================================

-- Create storage bucket for shipment documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('shipment-documents', 'shipment-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage: Clients can upload to their shipments
CREATE POLICY "Clients can upload to their shipments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'shipment-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM shipments WHERE client_id = auth.uid()
    )
  );

-- RLS for storage: Transporters can upload to accepted shipments
CREATE POLICY "Transporters can upload to accepted shipments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'shipment-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM shipments 
      WHERE transporter_id = auth.uid() 
      AND status IN ('confirmed', 'in_transit', 'delivered', 'completed')
    )
  );

-- RLS for storage: Clients can view their shipment documents
CREATE POLICY "Clients can view their shipment documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'shipment-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM shipments WHERE client_id = auth.uid()
    )
  );

-- RLS for storage: Transporters can view accepted shipment documents
CREATE POLICY "Transporters can view accepted shipment documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'shipment-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM shipments 
      WHERE transporter_id = auth.uid() 
      AND status IN ('confirmed', 'in_transit', 'delivered', 'completed')
    )
  );

-- RLS for storage: Users can delete their own documents
CREATE POLICY "Users can delete their own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'shipment-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM shipments 
      WHERE client_id = auth.uid() OR transporter_id = auth.uid()
    )
  );
