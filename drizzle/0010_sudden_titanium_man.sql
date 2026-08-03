CREATE TABLE "model_3d_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_id" integer NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "models_3d" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"label" text NOT NULL,
	"desc" text DEFAULT '' NOT NULL,
	"img" text,
	"link" text,
	"color_hex" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"styles" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"portfolio_id" integer NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sketch_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"sketch_id" integer NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "worldbuilding_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" integer NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sketches" ADD COLUMN "link" text;--> statement-breakpoint
ALTER TABLE "model_3d_images" ADD CONSTRAINT "model_3d_images_model_id_models_3d_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models_3d"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_images" ADD CONSTRAINT "portfolio_images_portfolio_id_portfolio_items_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sketch_images" ADD CONSTRAINT "sketch_images_sketch_id_sketches_id_fk" FOREIGN KEY ("sketch_id") REFERENCES "public"."sketches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worldbuilding_images" ADD CONSTRAINT "worldbuilding_images_entry_id_worldbuilding_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."worldbuilding_entries"("id") ON DELETE cascade ON UPDATE no action;