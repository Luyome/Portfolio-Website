import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { worldMaps } from "@/db/schema";
import { updateWorldMap } from "@/lib/actions/map";
import WorldMapForm from "@/components/admin/WorldMapForm";
import { requiredId } from "@/lib/validation";

export default async function EditMapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let mapId: number;
  try {
    mapId = requiredId(id, "Map");
  } catch {
    notFound();
  }
  const [[item], allMaps] = await Promise.all([
    db.select().from(worldMaps).where(eq(worldMaps.id, mapId)),
    db.select().from(worldMaps).orderBy(asc(worldMaps.sortOrder)),
  ]);
  if (!item) notFound();

  const updateWithId = updateWorldMap.bind(null, item.id);
  const otherMaps = allMaps.filter((m) => m.id !== item.id);

  return (
    <div>
      <div className="adm-title">Edit Map</div>
      <WorldMapForm action={updateWithId} item={item} otherMaps={otherMaps} />
    </div>
  );
}
