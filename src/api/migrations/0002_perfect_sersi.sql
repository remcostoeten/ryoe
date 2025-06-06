ALTER TABLE `users` ADD `is_setup_complete` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `storage_type` text DEFAULT 'turso' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `preferences` text;