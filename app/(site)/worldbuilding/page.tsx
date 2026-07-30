import { desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { worldbuildingEntries } from "@/db/schema";
import WorldbuildingBrowser from "@/components/WorldbuildingBrowser";

export default async function WorldbuildingPage() {
  const items = await db
    .select()
    .from(worldbuildingEntries)
    .orderBy(desc(worldbuildingEntries.year), asc(worldbuildingEntries.sortOrder));

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-wm">世界観</div>
        <div className="ph-eyebrow">Lore &amp; Stories</div>
        <h2 className="ph-title">Worldbuilding Chronicles</h2>
        <p className="ph-sub">Explore stories, lore and characters from created worlds.</p>
      </div>
      <WorldbuildingBrowser items={items} />
    </div>
  );
}
