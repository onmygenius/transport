-- =============================================
-- CREATE STORAGE BUCKET FOR SHIPMENT DOCUMENTS
-- =============================================

-- Insert bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('shipment-documents', 'shipment-documents', false)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STORAGE POLICIES FOR SHIPMENT DOCUMENTS
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload documents for their shipments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view documents for their shipments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Policy 1: Upload documents
-- Clients can upload for their shipments
-- Transporters can upload for accepted shipments
CREATE POLICY "Users can upload documents for their shipments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'shipment-documents' AND
  (
    -- Client uploading for their own shipment
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id::text = (storage.foldername(name))[1]
      AND shipments.client_id = auth.uid()
    )
    OR
    -- Transporter uploading for accepted shipment
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id::text = (storage.foldername(name))[1]
      AND shipments.transporter_id = auth.uid()
      AND shipments.status IN ('confirmed', 'picked_up', 'in_transit', 'delivered', 'completed')
    )
  )
);

-- Policy 2: View/Download documents
-- Clients can view their shipment documents
-- Transporters can view documents for accepted shipments
CREATE POLICY "Users can view documents for their shipments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'shipment-documents' AND
  (
    -- Client viewing their own shipment documents
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id::text = (storage.foldername(name))[1]
      AND shipments.client_id = auth.uid()
    )
    OR
    -- Transporter viewing documents for accepted shipment
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id::text = (storage.foldername(name))[1]
      AND shipments.transporter_id = auth.uid()
      AND shipments.status IN ('confirmed', 'picked_up', 'in_transit', 'delivered', 'completed')
    )
  )
);

-- Policy 3: Delete documents
-- Users can only delete their own uploaded documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'shipment-documents' AND
  EXISTS (
    SELECT 1 FROM shipment_documents
    WHERE shipment_documents.file_path = name
    AND shipment_documents.uploaded_by = auth.uid()
  )
);
