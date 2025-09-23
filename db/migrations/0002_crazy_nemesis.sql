CREATE TABLE `environmental_alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`grove_id` integer NOT NULL,
	`alert_type` text NOT NULL,
	`severity` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`sensor_data_id` integer,
	`health_record_id` integer,
	`farmer_notified` integer DEFAULT false,
	`investor_notified` integer DEFAULT false,
	`acknowledged` integer DEFAULT false,
	`resolved` integer DEFAULT false,
	`created_at` integer DEFAULT 1758336692280,
	`resolved_at` integer,
	FOREIGN KEY (`grove_id`) REFERENCES `coffee_groves`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sensor_data_id`) REFERENCES `iot_sensor_data`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`health_record_id`) REFERENCES `tree_health_records`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `farmers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`address` text NOT NULL,
	`name` text,
	`email` text,
	`phone` text,
	`location` text,
	`verification_status` text DEFAULT 'pending',
	`created_at` integer DEFAULT 1758336692279
);
--> statement-breakpoint
CREATE UNIQUE INDEX `farmers_address_unique` ON `farmers` (`address`);--> statement-breakpoint
CREATE TABLE `investor_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`investor_address` text NOT NULL,
	`name` text,
	`email` text,
	`phone` text,
	`country` text,
	`investor_type` text,
	`risk_tolerance` text,
	`investment_preferences` text,
	`created_at` integer DEFAULT 1758336692280,
	`updated_at` integer DEFAULT 1758336692280
);
--> statement-breakpoint
CREATE UNIQUE INDEX `investor_profiles_investor_address_unique` ON `investor_profiles` (`investor_address`);--> statement-breakpoint
CREATE TABLE `investor_verification_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`verification_id` integer NOT NULL,
	`previous_status` text,
	`new_status` text NOT NULL,
	`action_type` text NOT NULL,
	`verifier_address` text,
	`reason` text,
	`timestamp` integer DEFAULT 1758336692280,
	FOREIGN KEY (`verification_id`) REFERENCES `investor_verifications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `investor_verifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`investor_address` text NOT NULL,
	`verification_status` text DEFAULT 'unverified',
	`verification_type` text,
	`documents_hash` text,
	`identity_document_hash` text,
	`proof_of_address_hash` text,
	`financial_statement_hash` text,
	`accreditation_proof_hash` text,
	`verifier_address` text,
	`verification_date` integer,
	`expiry_date` integer,
	`rejection_reason` text,
	`access_level` text DEFAULT 'none',
	`created_at` integer DEFAULT 1758336692280,
	`updated_at` integer DEFAULT 1758336692280
);
--> statement-breakpoint
CREATE UNIQUE INDEX `investor_verifications_investor_address_unique` ON `investor_verifications` (`investor_address`);--> statement-breakpoint
CREATE TABLE `iot_sensor_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`grove_id` integer NOT NULL,
	`sensor_id` text NOT NULL,
	`sensor_type` text NOT NULL,
	`value` real NOT NULL,
	`unit` text NOT NULL,
	`location_lat` real,
	`location_lng` real,
	`timestamp` integer NOT NULL,
	`created_at` integer DEFAULT 1758336692280,
	FOREIGN KEY (`grove_id`) REFERENCES `coffee_groves`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `maintenance_activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`grove_id` integer NOT NULL,
	`farmer_address` text NOT NULL,
	`activity_type` text NOT NULL,
	`description` text NOT NULL,
	`cost` real,
	`materials_used` text,
	`area_treated` real,
	`weather_conditions` text,
	`notes` text,
	`activity_date` integer NOT NULL,
	`created_at` integer DEFAULT 1758336692280,
	FOREIGN KEY (`grove_id`) REFERENCES `coffee_groves`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `market_alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`farmer_address` text NOT NULL,
	`alert_type` text NOT NULL,
	`variety` integer NOT NULL,
	`grade` integer NOT NULL,
	`current_price` integer NOT NULL,
	`previous_price` integer NOT NULL,
	`change_percent` integer NOT NULL,
	`message` text NOT NULL,
	`sent_at` integer NOT NULL,
	`channel` text NOT NULL,
	`acknowledged` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `price_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`variety` integer NOT NULL,
	`grade` integer NOT NULL,
	`price` integer NOT NULL,
	`source` text NOT NULL,
	`region` text,
	`timestamp` integer NOT NULL,
	`created_at` integer DEFAULT 1758336692280
);
--> statement-breakpoint
CREATE TABLE `sensor_configurations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`grove_id` integer NOT NULL,
	`sensor_type` text NOT NULL,
	`optimal_min` real NOT NULL,
	`optimal_max` real NOT NULL,
	`warning_min` real NOT NULL,
	`warning_max` real NOT NULL,
	`critical_min` real NOT NULL,
	`critical_max` real NOT NULL,
	`unit` text NOT NULL,
	`reading_frequency` integer NOT NULL,
	`alert_threshold_count` integer DEFAULT 3,
	`created_at` integer DEFAULT 1758336692280,
	`updated_at` integer DEFAULT 1758336692280,
	FOREIGN KEY (`grove_id`) REFERENCES `coffee_groves`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tree_health_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`grove_id` integer NOT NULL,
	`health_score` integer NOT NULL,
	`assessment_date` integer NOT NULL,
	`soil_moisture_score` integer,
	`temperature_score` integer,
	`humidity_score` integer,
	`ph_score` integer,
	`light_score` integer,
	`rainfall_score` integer,
	`risk_factors` text,
	`recommendations` text,
	`yield_impact_projection` real,
	`created_at` integer DEFAULT 1758336692280,
	FOREIGN KEY (`grove_id`) REFERENCES `coffee_groves`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_coffee_groves` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`grove_name` text NOT NULL,
	`farmer_address` text NOT NULL,
	`token_address` text,
	`location` text NOT NULL,
	`coordinates_lat` real,
	`coordinates_lng` real,
	`tree_count` integer NOT NULL,
	`coffee_variety` text NOT NULL,
	`planting_date` integer,
	`expected_yield_per_tree` integer,
	`total_tokens_issued` integer,
	`tokens_per_tree` integer,
	`verification_status` text DEFAULT 'pending',
	`current_health_score` integer,
	`created_at` integer DEFAULT 1758336692279,
	`updated_at` integer DEFAULT 1758336692279
);
--> statement-breakpoint
INSERT INTO `__new_coffee_groves`("id", "grove_name", "farmer_address", "token_address", "location", "coordinates_lat", "coordinates_lng", "tree_count", "coffee_variety", "planting_date", "expected_yield_per_tree", "total_tokens_issued", "tokens_per_tree", "verification_status", "current_health_score", "created_at", "updated_at") SELECT "id", "grove_name", "farmer_address", "token_address", "location", "coordinates_lat", "coordinates_lng", "tree_count", "coffee_variety", "planting_date", "expected_yield_per_tree", "total_tokens_issued", "tokens_per_tree", "verification_status", "current_health_score", "created_at", "updated_at" FROM `coffee_groves`;--> statement-breakpoint
DROP TABLE `coffee_groves`;--> statement-breakpoint
ALTER TABLE `__new_coffee_groves` RENAME TO `coffee_groves`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `coffee_groves_grove_name_unique` ON `coffee_groves` (`grove_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `coffee_groves_token_address_unique` ON `coffee_groves` (`token_address`);--> statement-breakpoint
CREATE TABLE `__new_farmer_verifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`farmer_address` text NOT NULL,
	`verification_status` text DEFAULT 'pending',
	`documents_hash` text,
	`verifier_address` text,
	`verification_date` integer,
	`rejection_reason` text,
	`created_at` integer DEFAULT 1758336692279
);
--> statement-breakpoint
INSERT INTO `__new_farmer_verifications`("id", "farmer_address", "verification_status", "documents_hash", "verifier_address", "verification_date", "rejection_reason", "created_at") SELECT "id", "farmer_address", "verification_status", "documents_hash", "verifier_address", "verification_date", "rejection_reason", "created_at" FROM `farmer_verifications`;--> statement-breakpoint
DROP TABLE `farmer_verifications`;--> statement-breakpoint
ALTER TABLE `__new_farmer_verifications` RENAME TO `farmer_verifications`;--> statement-breakpoint
CREATE UNIQUE INDEX `farmer_verifications_farmer_address_unique` ON `farmer_verifications` (`farmer_address`);--> statement-breakpoint
CREATE TABLE `__new_harvest_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`grove_id` integer NOT NULL,
	`harvest_date` integer NOT NULL,
	`yield_kg` integer NOT NULL,
	`quality_grade` integer NOT NULL,
	`sale_price_per_kg` integer NOT NULL,
	`total_revenue` integer NOT NULL,
	`farmer_share` integer NOT NULL,
	`investor_share` integer NOT NULL,
	`revenue_distributed` integer DEFAULT false,
	`transaction_hash` text,
	`created_at` integer DEFAULT 1758336692279,
	FOREIGN KEY (`grove_id`) REFERENCES `coffee_groves`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_harvest_records`("id", "grove_id", "harvest_date", "yield_kg", "quality_grade", "sale_price_per_kg", "total_revenue", "farmer_share", "investor_share", "revenue_distributed", "transaction_hash", "created_at") SELECT "id", "grove_id", "harvest_date", "yield_kg", "quality_grade", "sale_price_per_kg", "total_revenue", "farmer_share", "investor_share", "revenue_distributed", "transaction_hash", "created_at" FROM `harvest_records`;--> statement-breakpoint
DROP TABLE `harvest_records`;--> statement-breakpoint
ALTER TABLE `__new_harvest_records` RENAME TO `harvest_records`;