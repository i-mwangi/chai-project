-- Migration: Add comprehensive transaction history table
-- Created: 2025-10-06

CREATE TABLE IF NOT EXISTS transaction_history (
    id TEXT PRIMARY KEY NOT NULL UNIQUE,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    asset TEXT NOT NULL,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    status TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    transaction_hash TEXT,
    block_explorer_url TEXT,
    metadata TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS transaction_history_from_idx ON transaction_history(from_address);
CREATE INDEX IF NOT EXISTS transaction_history_to_idx ON transaction_history(to_address);
CREATE INDEX IF NOT EXISTS transaction_history_type_idx ON transaction_history(type);
CREATE INDEX IF NOT EXISTS transaction_history_status_idx ON transaction_history(status);
CREATE INDEX IF NOT EXISTS transaction_history_timestamp_idx ON transaction_history(timestamp);

-- Create composite index for user queries (from or to address)
CREATE INDEX IF NOT EXISTS transaction_history_user_idx ON transaction_history(from_address, to_address, timestamp DESC);
