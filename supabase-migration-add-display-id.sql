-- Add display_id column to shipments table
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS display_id TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shipments_display_id ON shipments(display_id);

-- Add display_id column to profiles table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_id TEXT UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_profiles_display_id ON profiles(display_id);
  END IF;
END $$;

-- Add display_id column to offers table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'offers') THEN
    ALTER TABLE offers ADD COLUMN IF NOT EXISTS display_id TEXT UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_offers_display_id ON offers(display_id);
  END IF;
END $$;
