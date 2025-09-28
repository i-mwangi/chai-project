-- Migration to add performance indexes for token holdings
-- Improves query performance for revenue distribution calculations

-- Create indexes on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_token_holdings_grove_id ON token_holdings(grove_id);
CREATE INDEX IF NOT EXISTS idx_token_holdings_holder_address ON token_holdings(holder_address);
CREATE INDEX IF NOT EXISTS idx_token_holdings_is_active ON token_holdings(is_active);
CREATE INDEX IF NOT EXISTS idx_token_holdings_grove_active ON token_holdings(grove_id, is_active);