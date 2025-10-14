-- Rollback: Drop coffee_groves indexes
DROP INDEX IF EXISTS idx_coffee_groves_farmer_account;
DROP INDEX IF EXISTS idx_coffee_groves_name;
