CREATE TABLE "worldbuilding_metadata_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" integer NOT NULL,
	"metadata_option_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "display_template" text DEFAULT 'gallery' NOT NULL;--> statement-breakpoint
ALTER TABLE "models_3d" ADD COLUMN "display_template" text DEFAULT 'gallery' NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD COLUMN "display_template" text DEFAULT 'gallery' NOT NULL;--> statement-breakpoint
ALTER TABLE "sketches" ADD COLUMN "display_template" text DEFAULT 'gallery' NOT NULL;--> statement-breakpoint
ALTER TABLE "worldbuilding_entries" ADD COLUMN "display_template" text DEFAULT 'gallery' NOT NULL;--> statement-breakpoint
ALTER TABLE "worldbuilding_metadata_options" ADD CONSTRAINT "worldbuilding_metadata_options_entry_id_worldbuilding_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."worldbuilding_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worldbuilding_metadata_options" ADD CONSTRAINT "worldbuilding_metadata_options_metadata_option_id_metadata_options_id_fk" FOREIGN KEY ("metadata_option_id") REFERENCES "public"."metadata_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "worldbuilding_metadata_options_unique_idx" ON "worldbuilding_metadata_options" USING btree ("entry_id","metadata_option_id");--> statement-breakpoint
CREATE INDEX "worldbuilding_metadata_options_entry_idx" ON "worldbuilding_metadata_options" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX "worldbuilding_metadata_options_option_idx" ON "worldbuilding_metadata_options" USING btree ("metadata_option_id");--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_display_template_check" CHECK ("games"."display_template" in ('gallery', 'blog'));--> statement-breakpoint
ALTER TABLE "models_3d" ADD CONSTRAINT "models_3d_display_template_check" CHECK ("models_3d"."display_template" in ('gallery', 'blog'));--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_display_template_check" CHECK ("portfolio_items"."display_template" in ('gallery', 'blog'));--> statement-breakpoint
ALTER TABLE "sketches" ADD CONSTRAINT "sketches_display_template_check" CHECK ("sketches"."display_template" in ('gallery', 'blog'));--> statement-breakpoint
ALTER TABLE "worldbuilding_entries" ADD CONSTRAINT "worldbuilding_entries_display_template_check" CHECK ("worldbuilding_entries"."display_template" in ('gallery', 'blog'));--> statement-breakpoint
-- Phase 2 seed data: the pre-existing fixed Entity Type / Category lists
-- (types/worldbuilding.ts) become the starting managed options, so existing
-- entries' legacy `entityType`/`cat` values already match a real option by
-- slug/name — `npm run db:backfill-worldbuilding-metadata` links every
-- existing entry to these (and any chip values) after this migration runs.
INSERT INTO "metadata_options" ("type", "name", "slug", "sort_order", "is_active") VALUES
  ('wb_entity_type', 'Character',   'character',   0, true),
  ('wb_entity_type', 'Location',    'location',    1, true),
  ('wb_entity_type', 'Corporation', 'corporation', 2, true),
  ('wb_entity_type', 'Technology',  'technology',  3, true),
  ('wb_entity_type', 'Lore',        'lore',        4, true)
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "metadata_options" ("type", "name", "slug", "sort_order", "is_active") VALUES
  ('wb_category', 'Characters', 'characters', 0, true),
  ('wb_category', 'Cities',     'cities',     1, true),
  ('wb_category', 'Systems',    'systems',    2, true),
  ('wb_category', 'Factions',   'factions',   3, true),
  ('wb_category', 'Items',      'items',      4, true),
  ('wb_category', 'History',    'history',    5, true)
ON CONFLICT DO NOTHING;