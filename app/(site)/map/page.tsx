import { asc } from "drizzle-orm";
import { db } from "@/db";
import { mapSettings, mapLocations } from "@/db/schema";
import MapViewer from "@/components/MapViewer";

export default async function MapPage() {
  const [settingsRows, locations] = await Promise.all([
    db.select().from(mapSettings).limit(1),
    db.select().from(mapLocations).orderBy(asc(mapLocations.sortOrder)),
  ]);
  const imageUrl = settingsRows[0]?.imageUrl ?? "";

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-wm">地図</div>
        <div className="ph-eyebrow">World Geography</div>
        <h2 className="ph-title">Map</h2>
        <p className="ph-sub">An interactive map of the world — zoom in and click a location to learn more.</p>
      </div>
      <MapViewer imageUrl={imageUrl} locations={locations} />
    </div>
  );
}
