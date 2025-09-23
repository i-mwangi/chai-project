-- Migration for market alerts and price history tables
-- Created for coffee market API integration

CREATE TABLE `farmers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`address` text NOT NULL,
	`name` text,
	`email` text,
	`phone` text,
	`location` text,
	`verification_status` text DEFAULT 'pending',
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);

CREATE UNIQUE INDEX `farmers_address_unique` ON `farmers` (`address`);

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

CREATE TABLE `price_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`variety` integer NOT NULL,
	`grade` integer NOT NULL,
	`price` integer NOT NULL,
	`source` text NOT NULL,
	`region` text,
	`timestamp` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);

-- Create indexes for better query performance
CREATE INDEX `market_alerts_farmer_idx` ON `market_alerts` (`farmer_address`);
CREATE INDEX `market_alerts_variety_idx` ON `market_alerts` (`variety`, `grade`);
CREATE INDEX `market_alerts_sent_at_idx` ON `market_alerts` (`sent_at`);

CREATE INDEX `price_history_variety_idx` ON `price_history` (`variety`, `grade`);
CREATE INDEX `price_history_timestamp_idx` ON `price_history` (`timestamp`);
CREATE INDEX `price_history_source_idx` ON `price_history` (`source`);