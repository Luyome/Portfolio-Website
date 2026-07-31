CREATE TABLE "hero_buttons" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"href" text NOT NULL,
	"style" text DEFAULT 'primary' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "year" integer DEFAULT 2026 NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "content" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "hero_eyebrow" text DEFAULT 'Istanbul, Turkey — 2026' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "hero_jp_line" text DEFAULT 'ゲームデザイナー　物語　世界' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "hero_bio" text DEFAULT 'Game Designer & worldbuilder. Building **visceral, narrative-driven** games with Unreal Engine 5. Currently developing **The Abyss** — a psychological horror anomaly game for Steam.' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "home_bg_image" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "home_bg_opacity" integer DEFAULT 30 NOT NULL;