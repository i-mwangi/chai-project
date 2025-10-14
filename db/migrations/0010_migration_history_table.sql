-- Migration: Create migration history tracking table
CREATE TABLE IF NOT EXISTS migration_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    migration_name TEXT NOT NULL UNIQUE,
    applied_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    rolled_back_at INTEGER DEFAULT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_migration_history_name ON migration_history(migration_name);
CREATE INDEX IF NOT EXISTS idx_migration_history_applied_at ON migration_history(applied_at);
