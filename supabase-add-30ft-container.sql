-- Add '30ft' to container_type enum
-- This migration adds the missing '30ft' value to the container_type enum

ALTER TYPE container_type ADD VALUE IF NOT EXISTS '30ft';
