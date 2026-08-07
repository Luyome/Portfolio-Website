import { asc } from "drizzle-orm";
import { db } from "@/db";
import { worldMaps } from "@/db/schema";
import { createWorldMap } from "@/lib/actions/map";
import WorldMapForm from "@/components/admin/WorldMapForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function NewMapPage() {
  const otherMaps = await db.select().from(worldMaps).orderBy(asc(worldMaps.sortOrder));

  return (
    <div>
      <AdminPageHeader title="New Map" />
      <WorldMapForm action={createWorldMap} otherMaps={otherMaps} />
    </div>
  );
}
