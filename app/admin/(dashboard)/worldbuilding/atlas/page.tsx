import { asc } from "drizzle-orm";
import { db } from "@/db";
import { worldMaps, mapLocations } from "@/db/schema";
import AdminMapAtlas from "@/components/admin/AdminMapAtlas";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminMapOverviewPage() {
  const [maps, locations] = await Promise.all([
    db.select().from(worldMaps).orderBy(asc(worldMaps.sortOrder), asc(worldMaps.id)),
    db.select().from(mapLocations).orderBy(asc(mapLocations.sortOrder), asc(mapLocations.id)),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Map"
        description="Preview any map exactly as a visitor sees it on the public site — the same pan/zoom explorer, the same pins. Use this to confirm a map or pin you just added actually shows up correctly."
      />
      <AdminMapAtlas maps={maps} locations={locations} />
    </div>
  );
}
