CREATE TABLE "world_maps" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"parent_map_id" integer,
	"image_url" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "world_maps" ADD CONSTRAINT "world_maps_parent_map_id_world_maps_id_fk" FOREIGN KEY ("parent_map_id") REFERENCES "public"."world_maps"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "world_maps" ("title", "image_url")
SELECT 'World Map', COALESCE((SELECT "image_url" FROM "map_settings" LIMIT 1), '');
--> statement-breakpoint
ALTER TABLE "worldbuilding_entries" ADD COLUMN "content" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "worldbuilding_entries" ADD COLUMN "content_order" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "map_locations" ADD COLUMN "map_id" integer;
--> statement-breakpoint
ALTER TABLE "map_locations" ADD COLUMN "pin_type" text DEFAULT 'lore' NOT NULL;
--> statement-breakpoint
ALTER TABLE "map_locations" ADD COLUMN "target_map_id" integer;
--> statement-breakpoint
ALTER TABLE "map_locations" ADD COLUMN "entry_id" integer;
--> statement-breakpoint
ALTER TABLE "map_locations" ADD COLUMN "icon_type" text DEFAULT 'default' NOT NULL;
--> statement-breakpoint
UPDATE "map_locations" SET "map_id" = (SELECT "id" FROM "world_maps" ORDER BY "id" LIMIT 1) WHERE "map_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "map_locations" ALTER COLUMN "map_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "map_locations" ADD CONSTRAINT "map_locations_map_id_world_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."world_maps"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "map_locations" ADD CONSTRAINT "map_locations_target_map_id_world_maps_id_fk" FOREIGN KEY ("target_map_id") REFERENCES "public"."world_maps"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "map_locations" ADD CONSTRAINT "map_locations_entry_id_worldbuilding_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."worldbuilding_entries"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
DROP TABLE "map_settings";
