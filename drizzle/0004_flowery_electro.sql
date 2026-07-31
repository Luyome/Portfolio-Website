CREATE TABLE "game_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"label" text NOT NULL,
	"href" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game_links" ADD CONSTRAINT "game_links_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;