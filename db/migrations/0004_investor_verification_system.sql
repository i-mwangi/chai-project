-- Investor Verification System Migration
-- Adds tables for investor verification, document management, and access control

-- Investor Verifications table for storing verification status and documents
CREATE TABLE IF NOT EXISTS investor_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    investor_address TEXT UNIQUE NOT NULL,
    verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected', 'expired')),
    verification_type TEXT CHECK (verification_type IN ('basic', 'accredited')),
    documents_hash TEXT,
    identity_document_hash TEXT,
    proof_of_address_hash TEXT,
    financial_statement_hash TEXT,
    accreditation_proof_hash TEXT,
    verifier_address TEXT,
    verification_date INTEGER,
    expiry_date INTEGER,
    rejection_reason TEXT,
    access_level TEXT DEFAULT 'none' CHECK (access_level IN ('none', 'limited', 'full')),
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Investor Verification History table for audit trail
CREATE TABLE IF NOT EXISTS investor_verification_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    verification_id INTEGER NOT NULL REFERENCES investor_verifications(id),
    previous_status TEXT,
    new_status TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('submit', 'approve', 'reject', 'expire', 'renew')),
    verifier_address TEXT,
    reason TEXT,
    timestamp INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Investor Profiles table for storing investor information
CREATE TABLE IF NOT EXISTS investor_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    investor_address TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT,
    phone TEXT,
    country TEXT,
    investor_type TEXT CHECK (investor_type IN ('individual', 'institutional', 'accredited')),
    risk_tolerance TEXT CHECK (risk_tolerance IN ('low', 'medium', 'high')),
    investment_preferences TEXT, -- JSON
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_investor_verifications_address ON investor_verifications(investor_address);
CREATE INDEX IF NOT EXISTS idx_investor_verifications_status ON investor_verifications(verification_status);
CREATE INDEX IF NOT EXISTS idx_investor_verifications_type ON investor_verifications(verification_type);
CREATE INDEX IF NOT EXISTS idx_investor_verifications_verifier ON investor_verifications(verifier_address);
CREATE INDEX IF NOT EXISTS idx_investor_verifications_expiry ON investor_verifications(expiry_date) WHERE expiry_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_investor_verification_history_verification_id ON investor_verification_history(verification_id);
CREATE INDEX IF NOT EXISTS idx_investor_verification_history_timestamp ON investor_verification_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_investor_verification_history_action_type ON investor_verification_history(action_type);

CREATE INDEX IF NOT EXISTS idx_investor_profiles_address ON investor_profiles(investor_address);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_type ON investor_profiles(investor_type);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_country ON investor_profiles(country);

-- Create triggers to automatically update the updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_investor_verifications_updated_at
    AFTER UPDATE ON investor_verifications
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE investor_verifications SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_investor_profiles_updated_at
    AFTER UPDATE ON investor_profiles
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE investor_profiles SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

-- Create trigger to automatically log verification status changes
CREATE TRIGGER IF NOT EXISTS log_investor_verification_changes
    AFTER UPDATE OF verification_status ON investor_verifications
    FOR EACH ROW
    WHEN NEW.verification_status != OLD.verification_status
BEGIN
    INSERT INTO investor_verification_history (
        verification_id,
        previous_status,
        new_status,
        action_type,
        verifier_address,
        reason
    ) VALUES (
        NEW.id,
        OLD.verification_status,
        NEW.verification_status,
        CASE 
            WHEN NEW.verification_status = 'pending' THEN 'submit'
            WHEN NEW.verification_status = 'verified' THEN 'approve'
            WHEN NEW.verification_status = 'rejected' THEN 'reject'
            WHEN NEW.verification_status = 'expired' THEN 'expire'
            ELSE 'update'
        END,
        NEW.verifier_address,
        NEW.rejection_reason
    );
END;