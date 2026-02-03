CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` enum('store','event','interview','column','other') NOT NULL DEFAULT 'other',
	`prefecture` varchar(50),
	`city` varchar(100),
	`imageUrl` text,
	`viewCount` int NOT NULL DEFAULT 0,
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`eventDate` timestamp NOT NULL,
	`venue` varchar(255) NOT NULL,
	`price` decimal(10,2) NOT NULL DEFAULT '0.00',
	`prefecture` varchar(50),
	`city` varchar(100),
	`imageUrl` text,
	`capacity` int,
	`availableTickets` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gift_usages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`giftId` int NOT NULL,
	`qrCode` varchar(255) NOT NULL,
	`usedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gift_usages_id` PRIMARY KEY(`id`),
	CONSTRAINT `gift_usages_qrCode_unique` UNIQUE(`qrCode`)
);
--> statement-breakpoint
CREATE TABLE `gifts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeName` varchar(255) NOT NULL,
	`giftTitle` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`latitude` double NOT NULL,
	`longitude` double NOT NULL,
	`address` text,
	`prefecture` varchar(50),
	`city` varchar(100),
	`imageUrl` text,
	`expiryDate` timestamp,
	`usageLimit` int NOT NULL DEFAULT 1,
	`ageRestriction` int,
	`schoolTypeRestriction` enum('high_school','university','working','none') DEFAULT 'none',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gifts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventId` int NOT NULL,
	`qrCode` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`totalPrice` decimal(10,2) NOT NULL,
	`isUsed` boolean NOT NULL DEFAULT false,
	`usedAt` timestamp,
	`purchasedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `tickets_qrCode_unique` UNIQUE(`qrCode`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`age` int,
	`gender` enum('male','female','other','prefer_not_to_say'),
	`address` text,
	`prefecture` varchar(50),
	`city` varchar(100),
	`schoolType` enum('high_school','university','working','other'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_userId_unique` UNIQUE(`userId`)
);
