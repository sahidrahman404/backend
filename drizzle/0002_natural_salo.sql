DROP INDEX IF EXISTS `users_googe_id_unique`;--> statement-breakpoint
ALTER TABLE `users` ADD `google_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_google_id_unique` ON `users` (`google_id`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `googe_id`;