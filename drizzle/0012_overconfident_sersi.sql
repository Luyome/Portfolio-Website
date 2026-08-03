CREATE TABLE "model_3d_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_id" integer NOT NULL,
	"label" text NOT NULL,
	"href" text NOT NULL,
	"kind" text DEFAULT 'link' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"portfolio_id" integer NOT NULL,
	"label" text NOT NULL,
	"href" text NOT NULL,
	"kind" text DEFAULT 'link' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sketch_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"sketch_id" integer NOT NULL,
	"label" text NOT NULL,
	"href" text NOT NULL,
	"kind" text DEFAULT 'link' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "worldbuilding_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" integer NOT NULL,
	"label" text NOT NULL,
	"href" text NOT NULL,
	"kind" text DEFAULT 'link' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game_links" ADD COLUMN "kind" text DEFAULT 'link' NOT NULL;--> statement-breakpoint
ALTER TABLE "model_3d_links" ADD CONSTRAINT "model_3d_links_model_id_models_3d_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models_3d"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_links" ADD CONSTRAINT "portfolio_links_portfolio_id_portfolio_items_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sketch_links" ADD CONSTRAINT "sketch_links_sketch_id_sketches_id_fk" FOREIGN KEY ("sketch_id") REFERENCES "public"."sketches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worldbuilding_links" ADD CONSTRAINT "worldbuilding_links_entry_id_worldbuilding_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."worldbuilding_entries"("id") ON DELETE cascade ON UPDATE no action;