import { asc } from "drizzle-orm";
import { db } from "@/db";
import { games } from "@/db/schema";
import GamesBrowser from "@/components/GamesBrowser";

export default async function GamesPage() {
  const items = await db.select().from(games).orderBy(asc(games.sortOrder));

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
