-- Migration: Add Withdrawal Tables
-- Created: 2025-10-10

-- Farmer Withdrawals Table
CREATE TABLE IF NOT EXISTS farmer_withdrawals (
    id TEXT PRIMARY KEY NOT NULL,
    farmer_address TEXT NOT NULL,
    grove_id INTEGER REFERENCES coffee_groves(id),
    amount INTEGER NOT NULL,
    status TEXT NOT NULL,
    transaction_hash TEXT,
    block_explorer_url TEXT,
    error_message TEXT,
    requested_at INTEGER NOT NULL,
    completed_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE INDEX IF NOT EXISTS farmer_withdrawals_farmer_idx ON farmer_withdrawals(farmer_address);
CREATE INDEX IF NOT EXISTS farmer_withdrawals_status_idx ON farmer_withdrawals(status);
CREATE INDEX IF NOT EXISTS farmer_withdrawals_requested_idx ON farmer_withdrawals(requested_at);

-- Liquidity Withdrawals Table
CREATE TABLE IF NOT EXISTS liquidity_withdrawals (
    id TEXT PRIMARY KEY NOT NULL,
    provider_address TEXT NOT NULL,
    asset_address TEXT NOT NULL,
    lp_token_amount INTEGER NOT NULL,
    usdc_returned INTEGER NOT NULL,
    rewards_earned INTEGER NOT NULL,
    status TEXT NOT NULL,
    transaction_hash TEXT,
    block_explorer_url TEXT,
    error_message TEXT,
    requested_at INTEGER NOT NULL,
    completed_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE INDEX IF NOT EXISTS liquidity_withdrawals_provider_idx ON liquidity_withdrawals(provider_address);
CREATE INDEX IF NOT EXISTS liquidity_withdrawals_asset_idx ON liquidity_withdrawals(asset_address);
CREATE INDEX IF NOT EXISTS liquidity_withdrawals_status_idx ON liquidity_withdrawals(status);
CREATE INDEX IF NOT EXISTS liquidity_withdrawals_requested_idx ON liquidity_withdrawals(requested_at);

-- Farmer Balances Table
CREATE TABLE IF NOT EXISTS farmer_balances (
    farmer_address TEXT PRIMARY KEY NOT NULL,
    available_balance INTEGER NOT NULL DEFAULT 0,
    pending_balance INTEGER NOT NULL DEFAULT 0,
    total_earned INTEGER NOT NULL DEFAULT 0,
    total_withdrawn INTEGER NOT NULL DEFAULT 0,
    last_withdrawal_at INTEGER,
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);
