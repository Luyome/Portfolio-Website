import { asc } from "drizzle-orm";
import { db } from "@/db";
import { games, gameLinks } from "@/db/schema";
import GamesBrowser from "@/components/GamesBrowser";

export default async function GamesPage() {
  const [rows, linkRows] = await Promise.all([
    db.select().from(games).orderBy(asc(games.sortOrder)),
    db.select().from(gameLinks).orderBy(asc(gameLinks.sortOrder)),
  ]);

  const items = rows.map((g) => ({
    ...g,
    links: linkRows.filter((l) => l.gameId === g.id),
  }));

  return (
    <div className="page">
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
