CREATE TABLE "map_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"x" double precision DEFAULT 50 NOT NULL,
	"y" double precision DEFAULT 50 NOT NULL,
	"info" text DEFAULT '' NOT NULL,
	"img" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "map_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_url" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "sketches" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "worldbuilding_entries" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;