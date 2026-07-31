import { asc } from "drizzle-orm";
import { db } from "@/db";
import { mapSettings, mapLocations } from "@/db/schema";
import MapEditor from "@/components/admin/MapEditor";

export default async function AdminMapPage() {
  const [settingsRows, locations] = await Promise.all([
    db.select().from(mapSettings).limit(1),
    db.select().from(mapLocations).orderBy(asc(mapLocations.sortOrder)),
  ]);
  const imageUrl = settingsRows[0]?.imageUrl ?? "";

  return (
    <div>
      <div className="adm-title">Map</div>
      <p className="adm-sub">Upload a map image, then add and drag named pins onto it.</p>
      <MapEditor imageUrl={imageUrl} locations={locations} />
    </div>
  );
}
