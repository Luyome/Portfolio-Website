CREATE TABLE "portfolio_metadata_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"portfolio_id" integer NOT NULL,
	"metadata_option_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "portfolio_metadata_options" ADD CONSTRAINT "portfolio_metadata_options_portfolio_id_portfolio_items_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_metadata_options" ADD CONSTRAINT "portfolio_metadata_options_metadata_option_id_metadata_options_id_fk" FOREIGN KEY ("metadata_option_id") REFERENCES "public"."metadata_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "portfolio_metadata_options_unique_idx" ON "portfolio_metadata_options" USING btree ("portfolio_id","metadata_option_id");--> statement-breakpoint
CREATE INDEX "portfolio_metadata_options_portfolio_idx" ON "portfolio_metadata_options" USING btree ("portfolio_id");--> statement-breakpoint
CREATE INDEX "portfolio_metadata_options_option_idx" ON "portfolio_metadata_options" USING btree ("metadata_option_id");