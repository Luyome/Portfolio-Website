import { asc } from "drizzle-orm";
import { db } from "@/db";
import { worldMaps, mapLocations, worldbuildingEntries } from "@/db/schema";
import MapEditor from "@/components/admin/MapEditor";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminMapPinsPage() {
  const [maps, locations, entryRows] = await Promise.all([
    db.select().from(worldMaps).orderBy(asc(worldMaps.sortOrder)),
    db.select().from(mapLocations).orderBy(asc(mapLocations.sortOrder)),
    db.select({ id: worldbuildingEntries.id, title: worldbuildingEntries.title }).from(worldbuildingEntries),
  ]);

  return (
    <div>
      <AdminPageHeader title="Map Pins" description="Pick a map, then click to place named pins — link each one to a Lore Entry or a Sub-Map." />
      <MapEditor maps={maps} locations={locations} entries={entryRows} />
    </div>
  );
}
