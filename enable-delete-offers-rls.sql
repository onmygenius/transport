-- Enable DELETE for transporters on their own withdrawn/rejected/expired offers
-- Run this in Supabase Dashboard -> SQL Editor

CREATE POLICY "Transporters can delete their own inactive offers"
ON offers
FOR DELETE
TO authenticated
USING (
  transporter_id = auth.uid() 
  AND status IN ('withdrawn', 'rejected', 'expired')
);
