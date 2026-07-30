CREATE TABLE "about_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"who_i_am_paragraphs" text[] DEFAULT '{}' NOT NULL,
	"tools" text[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"status" text NOT NULL,
	"engine" text NOT NULL,
	"desc" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"feats" text[] DEFAULT '{}' NOT NULL,
	"target" text NOT NULL,
	"img" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"cat" text NOT NULL,
	"year" integer NOT NULL,
	"desc" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"medium" text NOT NULL,
	"software" text NOT NULL,
	"link" text NOT NULL,
	"img" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"icon" text NOT NULL,
	"title" text NOT NULL,
	"desc" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"handle" text NOT NULL,
	"jp_label" text NOT NULL,
	"footer_line" text NOT NULL,
	"contact_email" text DEFAULT '' NOT NULL,
	"twitter_url" text DEFAULT '' NOT NULL,
	"artstation_url" text DEFAULT '' NOT NULL,
	"linkedin_url" text DEFAULT '' NOT NULL,
	"instagram_url" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sketches" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"label" text NOT NULL,
	"desc" text DEFAULT '' NOT NULL,
	"img" text,
	"color_hex" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timeline_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" text NOT NULL,
	"text" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "worldbuilding_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"date" text NOT NULL,
	"cat" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text NOT NULL,
	"chips" text[] DEFAULT '{}' NOT NULL,
	"img" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
