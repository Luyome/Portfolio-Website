CREATE TABLE "link_label_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"slug" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "link_label_options_slug_idx" ON "link_label_options" USING btree ("slug");
--> statement-breakpoint
INSERT INTO "link_label_options" ("label", "slug", "sort_order") VALUES
	('ArtStation', 'artstation', 0),
	('YouTube', 'youtube', 1),
	('Steam', 'steam', 2),
	('itch.io', 'itchio', 3),
	('GitHub', 'github', 4),
	('Website', 'website', 5),
	('Trailer', 'trailer', 6),
	('PDF', 'pdf', 7),
	('Download', 'download', 8)
ON CONFLICT ("slug") DO NOTHING;