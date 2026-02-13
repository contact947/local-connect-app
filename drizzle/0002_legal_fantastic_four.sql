ALTER TABLE `articles` ADD `imageData` text;--> statement-breakpoint
ALTER TABLE `articles` ADD `imageFileName` varchar(255);--> statement-breakpoint
ALTER TABLE `articles` ADD `imageMimeType` varchar(50);--> statement-breakpoint
ALTER TABLE `events` ADD `imageData` text;--> statement-breakpoint
ALTER TABLE `events` ADD `imageFileName` varchar(255);--> statement-breakpoint
ALTER TABLE `events` ADD `imageMimeType` varchar(50);--> statement-breakpoint
ALTER TABLE `gifts` ADD `imageData` text;--> statement-breakpoint
ALTER TABLE `gifts` ADD `imageFileName` varchar(255);--> statement-breakpoint
ALTER TABLE `gifts` ADD `imageMimeType` varchar(50);--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `profileImageData` text;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `profileImageFileName` varchar(255);--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `profileImageMimeType` varchar(50);