CREATE TABLE "game_videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model_3d_videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_id" integer NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"portfolio_id" integer NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sketch_videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"sketch_id" integer NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "worldbuilding_videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" integer NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game_videos" ADD CONSTRAINT "game_videos_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_3d_videos" ADD CONSTRAINT "model_3d_videos_model_id_models_3d_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models_3d"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_videos" ADD CONSTRAINT "portfolio_videos_portfolio_id_portfolio_items_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sketch_videos" ADD CONSTRAINT "sketch_videos_sketch_id_sketches_id_fk" FOREIGN KEY ("sketch_id") REFERENCES "public"."sketches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worldbuilding_videos" ADD CONSTRAINT "worldbuilding_videos_entry_id_worldbuilding_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."worldbuilding_entries"("id") ON DELETE cascade ON UPDATE no action;