ALTER TABLE "site_settings" ADD COLUMN "contact_bg_image" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "contact_bg_opacity" integer DEFAULT 30 NOT NULL;