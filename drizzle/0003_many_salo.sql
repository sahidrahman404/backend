ALTER TABLE `users` ADD `logged_in_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `last_logged_out_at` integer;