import type { Metadata } from "next";
import { desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { games, gameLinks, gameImages, gameVideos } from "@/db/schema";
import GamesBrowser from "@/components/GamesBrowser";
import PageHeader from "@/components/PageHeader";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { groupImagesByParent } from "@/lib/group-images";
import { parseContentItemId } from "@/lib/content-detail-href";

export const metadata: Metadata = {
  title: "Games",
  description: "Current and in-progress game design work by Ege Demir Ünal — solo and group projects built in Unreal Engine 5.",
  alternates: { canonical: "/games" },
};

export default async function GamesPage({ searchParams }: { searchParams: Promise<{ item?: string | string[] }> }) {
  const { item } = await searchParams;
  // See app/(site)/2d/page.tsx for why this is db.batch()'d.
  const [[rows, linkRows, imageRows, videoRows], appearance] = await Promise.all([
    db.batch([
      db.select().from(games).orderBy(desc(games.date), asc(games.sortOrder)),
      db.select().from(gameLinks).orderBy(asc(gameLinks.sortOrder)),
      db.select().from(gameImages).orderBy(asc(gameImages.sortOrder)),
      db.select().from(gameVideos).orderBy(asc(gameVideos.sortOrder)),
    ]),
    getPageAppearance("games"),
  ]);
  const imagesByGame = groupImagesByParent(imageRows, (r) => r.gameId);
  const videosByGame = groupImagesByParent(videoRows, (r) => r.gameId);

  const items = rows.map((g) => ({
    ...g,
    links: linkRows.filter((l) => l.gameId === g.id),
    images: imagesByGame.get(g.id) ?? [],
    videos: videosByGame.get(g.id) ?? [],
  }));

  return (
    <div className="page" style={pageAppearanceVars(appearance)}>
      <PageHeader
        watermark="ゲーム"
        eyebrow="Game Development"
        title="Games"
        subtitle="Solo and group projects. Unreal Engine 5."
      />
      <GamesBrowser items={items} initialItemId={parseContentItemId(item)} />
    </div>
  );
}
