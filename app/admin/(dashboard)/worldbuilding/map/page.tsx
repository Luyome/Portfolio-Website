import { asc } from "drizzle-orm";
import { db } from "@/db";
import { worldMaps, mapLocations, worldbuildingEntries } from "@/db/schema";
import MapEditor from "@/components/admin/MapEditor";

export default async function AdminMapPinsPage() {
  const [maps, locations, entryRows] = await Promise.all([
    db.select().from(worldMaps).orderBy(asc(worldMaps.sortOrder)),
    db.select().from(mapLocations).orderBy(asc(mapLocations.sortOrder)),
    db.select({ id: worldbuildingEntries.id, title: worldbuildingEntries.title }).from(worldbuildingEntries),
  ]);

  return (
    <div>
      <div className="adm-title">Map Pins</div>
      <p className="adm-sub">Pick a map, then click to place named pins — link each one to a Lore Entry or a Sub-Map.</p>
      <MapEditor maps={maps} locations={locations} entries={entryRows} />
    </div>
  );
}
