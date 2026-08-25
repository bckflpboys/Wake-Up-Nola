CREATE TABLE `attendees` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`phone` text,
	`event_id` text NOT NULL,
	`ticket_count` integer,
	`tickets_scanned` integer,
	`check_in_status` text,
	`last_sync_at` text
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`date` text NOT NULL,
	`end_time` text,
	`location` text,
	`images` text,
	`organizer_id` text NOT NULL,
	`category` text,
	`status` text,
	`ticket_types` text,
	`total_tickets` integer,
	`tickets_sold` integer,
	`tickets_scanned` integer,
	`revenue` integer,
	`synced` integer DEFAULT true,
	`last_sync_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scan_history` (
	`id` text PRIMARY KEY NOT NULL,
	`ticket_id` text NOT NULL,
	`event_id` text NOT NULL,
	`event_title` text,
	`order_id` text,
	`ticket_type` text,
	`attendee_name` text,
	`attendee_email` text,
	`scanned_by` text,
	`scanned_at` text NOT NULL,
	`scan_result` text NOT NULL,
	`error_message` text,
	`synced` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `scanners` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`added_at` text NOT NULL,
	`added_by` text,
	`is_active` integer DEFAULT true,
	`scans_count` integer DEFAULT 0,
	`synced` integer DEFAULT true
);
--> statement-breakpoint
CREATE TABLE `sync_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`operation` text NOT NULL,
	`table_name` text NOT NULL,
	`record_id` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'pending',
	`attempts` integer DEFAULT 0,
	`last_attempt_at` text,
	`error_message` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`ticket_id` text NOT NULL,
	`event_id` text NOT NULL,
	`order_id` text NOT NULL,
	`ticket_type` text,
	`price` integer,
	`is_scanned` integer DEFAULT false,
	`scanned_at` text,
	`scanned_by` text,
	`customer_name` text,
	`customer_email` text,
	`synced` integer DEFAULT true
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`role` text,
	`avatar` text,
	`token` text,
	`is_logged_in` integer DEFAULT false,
	`last_sync_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
