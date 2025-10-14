-- Rollback: Drop migration history tracking table
DROP INDEX IF EXISTS idx_migration_history_applied_at;
DROP INDEX IF EXISTS idx_migration_history_name;
DROP TABLE IF EXISTS migration_history;
