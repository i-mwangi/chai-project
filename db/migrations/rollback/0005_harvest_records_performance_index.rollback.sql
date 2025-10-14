-- Rollback: Drop harvest_records performance index
DROP INDEX IF EXISTS idx_harvest_records_grove_timestamp;
