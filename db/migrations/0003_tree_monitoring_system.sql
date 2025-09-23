-- Tree Monitoring System Migration
-- Adds tables for IoT sensor data ingestion and tree health monitoring

-- IoT Sensor Data table for storing environmental monitoring data
CREATE TABLE IF NOT EXISTS iot_sensor_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grove_id INTEGER NOT NULL REFERENCES coffee_groves(id),
    sensor_id TEXT NOT NULL,
    sensor_type TEXT NOT NULL, -- 'soil_moisture', 'temperature', 'humidity', 'ph', 'light', 'rainfall'
    value REAL NOT NULL,
    unit TEXT NOT NULL, -- '%', 'C', 'F', 'pH', 'lux', 'mm'
    location_lat REAL,
    location_lng REAL,
    timestamp INTEGER NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Tree Health Records table for storing calculated health scores and assessments
CREATE TABLE IF NOT EXISTS tree_health_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grove_id INTEGER NOT NULL REFERENCES coffee_groves(id),
    health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
    assessment_date INTEGER NOT NULL,
    soil_moisture_score INTEGER CHECK (soil_moisture_score >= 0 AND soil_moisture_score <= 100),
    temperature_score INTEGER CHECK (temperature_score >= 0 AND temperature_score <= 100),
    humidity_score INTEGER CHECK (humidity_score >= 0 AND humidity_score <= 100),
    ph_score INTEGER CHECK (ph_score >= 0 AND ph_score <= 100),
    light_score INTEGER CHECK (light_score >= 0 AND light_score <= 100),
    rainfall_score INTEGER CHECK (rainfall_score >= 0 AND rainfall_score <= 100),
    risk_factors TEXT, -- JSON array of identified risks
    recommendations TEXT, -- JSON array of care recommendations
    yield_impact_projection REAL, -- Projected impact on yield (-1.0 to 1.0)
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Environmental Alerts table for storing automated alerts about tree health issues
CREATE TABLE IF NOT EXISTS environmental_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grove_id INTEGER NOT NULL REFERENCES coffee_groves(id),
    alert_type TEXT NOT NULL, -- 'DROUGHT_RISK', 'TEMPERATURE_EXTREME', 'DISEASE_RISK', 'PEST_RISK', 'NUTRIENT_DEFICIENCY'
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    sensor_data_id INTEGER REFERENCES iot_sensor_data(id),
    health_record_id INTEGER REFERENCES tree_health_records(id),
    farmer_notified INTEGER DEFAULT 0, -- boolean
    investor_notified INTEGER DEFAULT 0, -- boolean
    acknowledged INTEGER DEFAULT 0, -- boolean
    resolved INTEGER DEFAULT 0, -- boolean
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    resolved_at INTEGER
);

-- Maintenance Activities table for logging care activities and farmer actions
CREATE TABLE IF NOT EXISTS maintenance_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grove_id INTEGER NOT NULL REFERENCES coffee_groves(id),
    farmer_address TEXT NOT NULL,
    activity_type TEXT NOT NULL, -- 'WATERING', 'FERTILIZING', 'PRUNING', 'PEST_TREATMENT', 'DISEASE_TREATMENT', 'SOIL_AMENDMENT'
    description TEXT NOT NULL,
    cost REAL, -- Cost in USDC cents
    materials_used TEXT, -- JSON array of materials/chemicals used
    area_treated REAL, -- Area in hectares or number of trees
    weather_conditions TEXT,
    notes TEXT,
    activity_date INTEGER NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Sensor Configurations table for managing IoT sensor settings and thresholds
CREATE TABLE IF NOT EXISTS sensor_configurations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grove_id INTEGER NOT NULL REFERENCES coffee_groves(id),
    sensor_type TEXT NOT NULL,
    optimal_min REAL NOT NULL,
    optimal_max REAL NOT NULL,
    warning_min REAL NOT NULL,
    warning_max REAL NOT NULL,
    critical_min REAL NOT NULL,
    critical_max REAL NOT NULL,
    unit TEXT NOT NULL,
    reading_frequency INTEGER NOT NULL, -- Minutes between readings
    alert_threshold_count INTEGER DEFAULT 3, -- Number of consecutive bad readings before alert
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_iot_sensor_data_grove_timestamp ON iot_sensor_data(grove_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_iot_sensor_data_sensor_type ON iot_sensor_data(sensor_type);
CREATE INDEX IF NOT EXISTS idx_tree_health_records_grove_date ON tree_health_records(grove_id, assessment_date);
CREATE INDEX IF NOT EXISTS idx_environmental_alerts_grove_severity ON environmental_alerts(grove_id, severity);
CREATE INDEX IF NOT EXISTS idx_environmental_alerts_unresolved ON environmental_alerts(resolved) WHERE resolved = 0;
CREATE INDEX IF NOT EXISTS idx_maintenance_activities_grove_date ON maintenance_activities(grove_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_sensor_configurations_grove_type ON sensor_configurations(grove_id, sensor_type);