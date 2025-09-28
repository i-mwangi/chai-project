-- Migration to add performance index for harvest records
-- Improves query performance for harvest reporting and history API endpoints

-- Create composite index on grove_id and harvest_date for faster queries
CREATE INDEX IF NOT EXISTS idx_harvest_records_grove_date ON harvest_records(grove_id, harvest_date);

-- Add additional indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_harvest_records_revenue_distributed ON harvest_records(revenue_distributed);
CREATE INDEX IF NOT EXISTS idx_harvest_records_quality_grade ON harvest_records(quality_grade);
CREATE INDEX IF NOT EXISTS idx_harvest_records_created_at ON harvest_records(created_at);

-- Add composite indexes for common filtering patterns
CREATE INDEX IF NOT EXISTS idx_harvest_records_grove_distributed ON harvest_records(grove_id, revenue_distributed);
CREATE INDEX IF NOT EXISTS idx_harvest_records_date_distributed ON harvest_records(harvest_date, revenue_distributed);