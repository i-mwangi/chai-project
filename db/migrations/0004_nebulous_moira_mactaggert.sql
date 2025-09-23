-- Migration to add indexes and constraints for investor verification tables
-- Improves query performance for investor verification API endpoints

-- Add indexes for investor_verifications table
CREATE INDEX IF NOT EXISTS idx_investor_verifications_status ON investor_verifications(verification_status);
CREATE INDEX IF NOT EXISTS idx_investor_verifications_type ON investor_verifications(verification_type);
CREATE INDEX IF NOT EXISTS idx_investor_verifications_verifier ON investor_verifications(verifier_address);
CREATE INDEX IF NOT EXISTS idx_investor_verifications_date ON investor_verifications(verification_date);
CREATE INDEX IF NOT EXISTS idx_investor_verifications_expiry ON investor_verifications(expiry_date);
CREATE INDEX IF NOT EXISTS idx_investor_verifications_access_level ON investor_verifications(access_level);
CREATE INDEX IF NOT EXISTS idx_investor_verifications_created_at ON investor_verifications(created_at);

-- Add indexes for investor_verification_history table
CREATE INDEX IF NOT EXISTS idx_investor_verification_history_verification_id ON investor_verification_history(verification_id);
CREATE INDEX IF NOT EXISTS idx_investor_verification_history_action_type ON investor_verification_history(action_type);
CREATE INDEX IF NOT EXISTS idx_investor_verification_history_timestamp ON investor_verification_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_investor_verification_history_verifier ON investor_verification_history(verifier_address);

-- Add indexes for investor_profiles table
CREATE INDEX IF NOT EXISTS idx_investor_profiles_country ON investor_profiles(country);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_investor_type ON investor_profiles(investor_type);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_risk_tolerance ON investor_profiles(risk_tolerance);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_created_at ON investor_profiles(created_at);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_investor_verifications_status_type ON investor_verifications(verification_status, verification_type);
CREATE INDEX IF NOT EXISTS idx_investor_verifications_pending_created ON investor_verifications(verification_status, created_at) WHERE verification_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_investor_verifications_expired ON investor_verifications(expiry_date) WHERE expiry_date IS NOT NULL AND expiry_date < strftime('%s', 'now');