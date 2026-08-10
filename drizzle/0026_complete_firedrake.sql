-- worldbuilding_entries.date: was a free-text "Display Date" (e.g. "Aug 10,
-- 2026") entered via the DatePicker; Postgres's date parser accepts that
-- exact "Month DD, YYYY" format directly, so a straight type-change cast is
-- safe here and needs no intermediate conversion.
ALTER TABLE "worldbuilding_entries" ALTER COLUMN "date" SET DATA TYPE date USING "date"::date;--> statement-breakpoint

-- The other four tables are gaining a brand-new `date` column alongside
-- their existing `year` integer — added nullable first, backfilled from the
-- existing year (Jan 1 of that year, edited later by the admin as needed),
-- then locked to NOT NULL, since a plain NOT NULL ADD COLUMN with no default
-- would fail against existing rows.
ALTER TABLE "games" ADD COLUMN "date" date;--> statement-breakpoint
ALTER TABLE "models_3d" ADD COLUMN "date" date;--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD COLUMN "date" date;--> statement-breakpoint
ALTER TABLE "sketches" ADD COLUMN "date" date;--> statement-breakpoint
UPDATE "games" SET "date" = make_date("year", 1, 1) WHERE "date" IS NULL;--> statement-breakpoint
UPDATE "models_3d" SET "date" = make_date("year", 1, 1) WHERE "date" IS NULL;--> statement-breakpoint
UPDATE "portfolio_items" SET "date" = make_date("year", 1, 1) WHERE "date" IS NULL;--> statement-breakpoint
UPDATE "sketches" SET "date" = make_date("year", 1, 1) WHERE "date" IS NULL;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "models_3d" ALTER COLUMN "date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolio_items" ALTER COLUMN "date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sketches" ALTER COLUMN "date" SET NOT NULL;
