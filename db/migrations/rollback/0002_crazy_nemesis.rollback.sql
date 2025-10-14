-- Rollback: Drop tree monitoring and investor verification tables
DROP TABLE IF EXISTS tree_health_records;
DROP TABLE IF EXISTS sensor_configurations;
DROP TABLE IF EXISTS price_history;
DROP TABLE IF EXISTS market_alerts;
DROP TABLE IF EXISTS maintenance_activities;
DROP TABLE IF EXISTS iot_sensor_data;
DROP TABLE IF EXISTS investor_verifications;
DROP TABLE IF EXISTS investor_verification_history;
DROP TABLE IF EXISTS investor_profiles;
DROP TABLE IF EXISTS farmers;
DROP TABLE IF EXISTS environmental_alerts;
