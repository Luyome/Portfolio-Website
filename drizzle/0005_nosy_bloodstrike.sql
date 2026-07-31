CREATE TABLE "page_appearance" (
	"id" serial PRIMARY KEY NOT NULL,
	"page" text NOT NULL,
	"bg" text,
	"bg2" text,
	"bg3" text,
	"text" text,
	"text2" text,
	"accent" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "page_appearance_page_unique" UNIQUE("page")
);
--> statement-breakpoint
ALTER TABLE "about_content" ADD COLUMN "styles" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "styles" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD COLUMN "styles" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "home_bg_width" integer;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "home_bg_height" integer;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "styles" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "sketches" ADD COLUMN "styles" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "worldbuilding_entries" ADD COLUMN "styles" jsonb DEFAULT '{}'::jsonb NOT NULL;