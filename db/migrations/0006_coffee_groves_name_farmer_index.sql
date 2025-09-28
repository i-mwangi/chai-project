-- Migration to add performance index for coffee groves lookup
-- Improves query performance for harvest reporting API endpoint

-- Create composite index on grove_name and farmer_address for faster grove lookup
CREATE INDEX IF NOT EXISTS idx_coffee_groves_name_farmer ON coffee_groves(grove_name, farmer_address);