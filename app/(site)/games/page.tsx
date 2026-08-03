import { asc } from "drizzle-orm";
import { db } from "@/db";
import { games, gameLinks, gameImages, gameVideos } from "@/db/schema";
import GamesBrowser from "@/components/GamesBrowser";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { groupImagesByParent } from "@/lib/group-images";

export default async function GamesPage() {
  const [rows, linkRows, imageRows, videoRows, appearance] = await Promise.all([
    db.select().from(games).orderBy(asc(games.sortOrder)),
    db.select().from(gameLinks).orderBy(asc(gameLinks.sortOrder)),
    db.select().from(gameImages).orderBy(asc(gameImages.sortOrder)),
    db.select().from(gameVideos).orderBy(asc(gameVideos.sortOrder)),
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
      <div className="ph">
        <div className="ph-wm">ゲーム</div>
        <div className="ph-eyebrow">Game Development</div>
        <h2 className="ph-title">Games</h2>
        <p className="ph-sub">Solo and group projects. Unreal Engine 5.</p>
      </div>
      <GamesBrowser items={items} />
    </div>
  );
}
