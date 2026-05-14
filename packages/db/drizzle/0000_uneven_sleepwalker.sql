CREATE TABLE `contact_form_submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`budget` text NOT NULL,
	`message` text,
	`ip` text,
	`submitted_at` text NOT NULL
);
