-- Migration: add user_settings table

CREATE TABLE IF NOT EXISTS user_settings (
  account TEXT PRIMARY KEY NOT NULL,
  skip_farmer_verification INTEGER DEFAULT 0,
  skip_investor_verification INTEGER DEFAULT 0,
  demo_bypass INTEGER DEFAULT 0,
  updated_at INTEGER DEFAULT (strftime('%s','now'))
);
