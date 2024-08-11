ALTER TABLE `users` ADD `googe_id` text;--> statement-breakpoint
ALTER TABLE `users` ADD `facebook_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_googe_id_unique` ON `users` (`googe_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_facebook_id_unique` ON `users` (`facebook_id`);