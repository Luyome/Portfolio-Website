CREATE TABLE "worldbuilding_relationships" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_entry_id" integer NOT NULL,
	"target_entry_id" integer NOT NULL,
	"relationship_type" text DEFAULT 'related' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "worldbuilding_relationships_no_self_relation_check" CHECK ("worldbuilding_relationships"."source_entry_id" <> "worldbuilding_relationships"."target_entry_id")
);
--> statement-breakpoint
ALTER TABLE "worldbuilding_entries" ADD COLUMN "entity_type" text;--> statement-breakpoint
ALTER TABLE "worldbuilding_relationships" ADD CONSTRAINT "worldbuilding_relationships_source_entry_id_worldbuilding_entries_id_fk" FOREIGN KEY ("source_entry_id") REFERENCES "public"."worldbuilding_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worldbuilding_relationships" ADD CONSTRAINT "worldbuilding_relationships_target_entry_id_worldbuilding_entries_id_fk" FOREIGN KEY ("target_entry_id") REFERENCES "public"."worldbuilding_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "worldbuilding_relationships_exact_unique_idx" ON "worldbuilding_relationships" USING btree ("source_entry_id","target_entry_id","relationship_type");--> statement-breakpoint
CREATE INDEX "worldbuilding_relationships_source_order_idx" ON "worldbuilding_relationships" USING btree ("source_entry_id","sort_order","id");--> statement-breakpoint
CREATE INDEX "worldbuilding_relationships_target_order_idx" ON "worldbuilding_relationships" USING btree ("target_entry_id","sort_order","id");--> statement-breakpoint
CREATE INDEX "worldbuilding_entries_entity_type_idx" ON "worldbuilding_entries" USING btree ("entity_type");