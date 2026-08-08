ALTER TABLE "map_locations" ADD COLUMN "priority" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "map_locations" ADD COLUMN "min_zoom" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "map_locations" ADD COLUMN "max_zoom" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
CREATE INDEX "map_locations_map_priority_idx" ON "map_locations" USING btree ("map_id","priority","id");--> statement-breakpoint
ALTER TABLE "map_locations" ADD CONSTRAINT "map_locations_priority_range_check" CHECK ("map_locations"."priority" between 0 and 100);--> statement-breakpoint
ALTER TABLE "map_locations" ADD CONSTRAINT "map_locations_min_zoom_range_check" CHECK ("map_locations"."min_zoom" between 1 and 5);--> statement-breakpoint
ALTER TABLE "map_locations" ADD CONSTRAINT "map_locations_max_zoom_range_check" CHECK ("map_locations"."max_zoom" between 1 and 5);--> statement-breakpoint
ALTER TABLE "map_locations" ADD CONSTRAINT "map_locations_zoom_order_check" CHECK ("map_locations"."min_zoom" <= "map_locations"."max_zoom");