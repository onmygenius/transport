-- =============================================
-- RLS POLICIES FOR CHAT_MESSAGES
-- =============================================

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view messages for their shipments" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages for their shipments" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;

-- Policy: Users can view messages for shipments they are involved in
CREATE POLICY "Users can view messages for their shipments" ON chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM shipments
    WHERE shipments.id = chat_messages.shipment_id
    AND (
      shipments.client_id = auth.uid() OR
      shipments.transporter_id = auth.uid()
    )
  )
);

-- Policy: Users can send messages for shipments they are involved in
CREATE POLICY "Users can send messages for their shipments" ON chat_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM shipments
    WHERE shipments.id = chat_messages.shipment_id
    AND (
      shipments.client_id = auth.uid() OR
      shipments.transporter_id = auth.uid()
    )
  )
);

-- Policy: Users can update messages in their shipments (for marking as read)
CREATE POLICY "Users can update their own messages" ON chat_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM shipments
    WHERE shipments.id = chat_messages.shipment_id
    AND (
      shipments.client_id = auth.uid() OR
      shipments.transporter_id = auth.uid()
    )
  )
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_shipment_id ON chat_messages(shipment_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON chat_messages(is_read) WHERE is_read = false;
