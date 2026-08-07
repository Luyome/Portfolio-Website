CREATE TABLE "home_content_selections" (
	"id" serial PRIMARY KEY NOT NULL,
	"section" text NOT NULL,
	"portfolio_id" integer,
	"sketch_id" integer,
	"model_3d_id" integer,
	"worldbuilding_entry_id" integer,
	"game_id" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "home_content_selections_section_check" CHECK ("home_content_selections"."section" in ('featured_work', 'worldbuilding_highlight', 'latest_dispatch')),
	CONSTRAINT "home_content_selections_one_target_check" CHECK (num_nonnulls("home_content_selections"."portfolio_id", "home_content_selections"."sketch_id", "home_content_selections"."model_3d_id", "home_content_selections"."worldbuilding_entry_id", "home_content_selections"."game_id") = 1),
	CONSTRAINT "home_content_selections_worldbuilding_target_check" CHECK ("home_content_selections"."section" <> 'worldbuilding_highlight' or "home_content_selections"."worldbuilding_entry_id" is not null)
);
--> statement-breakpoint
CREATE TABLE "home_map_preview" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"map_id" integer,
	"is_visible" boolean DEFAULT false NOT NULL,
	CONSTRAINT "home_map_preview_singleton_check" CHECK ("home_map_preview"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "home_map_preview_pins" (
	"id" serial PRIMARY KEY NOT NULL,
	"preview_id" integer DEFAULT 1 NOT NULL,
	"location_id" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "home_skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "home_stat_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"is_visible" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "is_home_visible" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "home_content_selections" ADD CONSTRAINT "home_content_selections_portfolio_id_portfolio_items_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "home_content_selections" ADD CONSTRAINT "home_content_selections_sketch_id_sketches_id_fk" FOREIGN KEY ("sketch_id") REFERENCES "public"."sketches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "home_content_selections" ADD CONSTRAINT "home_content_selections_model_3d_id_models_3d_id_fk" FOREIGN KEY ("model_3d_id") REFERENCES "public"."models_3d"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "home_content_selections" ADD CONSTRAINT "home_content_selections_worldbuilding_entry_id_worldbuilding_entries_id_fk" FOREIGN KEY ("worldbuilding_entry_id") REFERENCES "public"."worldbuilding_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "home_content_selections" ADD CONSTRAINT "home_content_selections_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "home_map_preview" ADD CONSTRAINT "home_map_preview_map_id_world_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."world_maps"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "home_map_preview_pins" ADD CONSTRAINT "home_map_preview_pins_preview_id_home_map_preview_id_fk" FOREIGN KEY ("preview_id") REFERENCES "public"."home_map_preview"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "home_map_preview_pins" ADD CONSTRAINT "home_map_preview_pins_location_id_map_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."map_locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "home_content_selections_portfolio_unique_idx" ON "home_content_selections" USING btree ("section","portfolio_id");--> statement-breakpoint
CREATE UNIQUE INDEX "home_content_selections_sketch_unique_idx" ON "home_content_selections" USING btree ("section","sketch_id");--> statement-breakpoint
CREATE UNIQUE INDEX "home_content_selections_model_3d_unique_idx" ON "home_content_selections" USING btree ("section","model_3d_id");--> statement-breakpoint
CREATE UNIQUE INDEX "home_content_selections_worldbuilding_unique_idx" ON "home_content_selections" USING btree ("section","worldbuilding_entry_id");--> statement-breakpoint
CREATE UNIQUE INDEX "home_content_selections_game_unique_idx" ON "home_content_selections" USING btree ("section","game_id");--> statement-breakpoint
CREATE INDEX "home_content_selections_section_order_idx" ON "home_content_selections" USING btree ("section","sort_order","id");--> statement-breakpoint
CREATE UNIQUE INDEX "home_map_preview_pins_location_unique_idx" ON "home_map_preview_pins" USING btree ("preview_id","location_id");--> statement-breakpoint
CREATE INDEX "home_map_preview_pins_order_idx" ON "home_map_preview_pins" USING btree ("preview_id","sort_order","id");--> statement-breakpoint
CREATE UNIQUE INDEX "home_skills_label_unique_idx" ON "home_skills" USING btree ("label");--> statement-breakpoint
CREATE INDEX "home_skills_visibility_order_idx" ON "home_skills" USING btree ("is_visible","sort_order","id");
--> statement-breakpoint
INSERT INTO "home_map_preview" ("id", "map_id", "is_visible") VALUES (1, NULL, false);
--> statement-breakpoint
INSERT INTO "home_stat_settings" ("key", "is_visible") VALUES
	('3d_works', false),
	('2d_works', false),
	('worldbuilding_entries', false),
	('game_projects', false),
	('stories_devlogs', false),
	('published_entries', false);
