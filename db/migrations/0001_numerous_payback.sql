CREATE TABLE `coffee_groves` (
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
	`created_at` integer DEFAULT 1758294921626,
	`updated_at` integer DEFAULT 1758294921626
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coffee_groves_grove_name_unique` ON `coffee_groves` (`grove_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `coffee_groves_token_address_unique` ON `coffee_groves` (`token_address`);--> statement-breakpoint
CREATE TABLE `farmer_verifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`farmer_address` text NOT NULL,
	`verification_status` text DEFAULT 'pending',
	`documents_hash` text,
	`verifier_address` text,
	`verification_date` integer,
	`rejection_reason` text,
	`created_at` integer DEFAULT 1758294921627
);
--> statement-breakpoint
CREATE UNIQUE INDEX `farmer_verifications_farmer_address_unique` ON `farmer_verifications` (`farmer_address`);--> statement-breakpoint
CREATE TABLE `harvest_records` (
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
	`created_at` integer DEFAULT 1758294921627,
	FOREIGN KEY (`grove_id`) REFERENCES `coffee_groves`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `revenue_distributions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`harvest_id` integer NOT NULL,
	`holder_address` text NOT NULL,
	`token_amount` integer NOT NULL,
	`revenue_share` integer NOT NULL,
	`distribution_date` integer NOT NULL,
	`transaction_hash` text,
	FOREIGN KEY (`harvest_id`) REFERENCES `harvest_records`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `token_holdings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`holder_address` text NOT NULL,
	`grove_id` integer NOT NULL,
	`token_amount` integer NOT NULL,
	`purchase_price` integer NOT NULL,
	`purchase_date` integer NOT NULL,
	`is_active` integer DEFAULT true,
	FOREIGN KEY (`grove_id`) REFERENCES `coffee_groves`(`id`) ON UPDATE no action ON DELETE no action
);
