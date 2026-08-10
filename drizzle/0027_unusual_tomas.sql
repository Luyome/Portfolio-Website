CREATE TABLE "model_3d_metadata_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_id" integer NOT NULL,
	"metadata_option_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sketch_metadata_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"sketch_id" integer NOT NULL,
	"metadata_option_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "model_3d_metadata_options" ADD CONSTRAINT "model_3d_metadata_options_model_id_models_3d_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models_3d"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_3d_metadata_options" ADD CONSTRAINT "model_3d_metadata_options_metadata_option_id_metadata_options_id_fk" FOREIGN KEY ("metadata_option_id") REFERENCES "public"."metadata_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sketch_metadata_options" ADD CONSTRAINT "sketch_metadata_options_sketch_id_sketches_id_fk" FOREIGN KEY ("sketch_id") REFERENCES "public"."sketches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sketch_metadata_options" ADD CONSTRAINT "sketch_metadata_options_metadata_option_id_metadata_options_id_fk" FOREIGN KEY ("metadata_option_id") REFERENCES "public"."metadata_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "model_3d_metadata_options_unique_idx" ON "model_3d_metadata_options" USING btree ("model_id","metadata_option_id");--> statement-breakpoint
CREATE INDEX "model_3d_metadata_options_model_idx" ON "model_3d_metadata_options" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "model_3d_metadata_options_option_idx" ON "model_3d_metadata_options" USING btree ("metadata_option_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sketch_metadata_options_unique_idx" ON "sketch_metadata_options" USING btree ("sketch_id","metadata_option_id");--> statement-breakpoint
CREATE INDEX "sketch_metadata_options_sketch_idx" ON "sketch_metadata_options" USING btree ("sketch_id");--> statement-breakpoint
CREATE INDEX "sketch_metadata_options_option_idx" ON "sketch_metadata_options" USING btree ("metadata_option_id");