import type { Metadata } from "next";
import { desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { worldbuildingEntries, worldbuildingImages, worldbuildingLinks, worldbuildingVideos, worldbuildingRelationships, worldMaps, mapLocations } from "@/db/schema";
import WorldbuildingBrowser from "@/components/WorldbuildingBrowser";
import PageHeader from "@/components/PageHeader";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { groupImagesByParent } from "@/lib/group-images";
import { parseContentItemId } from "@/lib/content-detail-href";
import { getActiveWbMetadataOptionsByType } from "@/lib/worldbuilding-metadata";

export const metadata: Metadata = {
  title: "Worldbuilding",
  description: "KRUPNI — an original sci-fi universe. Explore its stories, lore and characters.",
  alternates: { canonical: "/worldbuilding" },
};

export default async function WorldbuildingPage({ searchParams }: { searchParams: Promise<{ item?: string | string[]; map?: string | string[] }> }) {
  const { item, map } = await searchParams;
  const [items, imageRows, linkRows, videoRows, relationshipRows, mapRows, locationRows, appearance, wbOptions] = await Promise.all([
    db.select().from(worldbuildingEntries).orderBy(desc(worldbuildingEntries.year), asc(worldbuildingEntries.sortOrder)),
    db.select().from(worldbuildingImages).orderBy(asc(worldbuildingImages.sortOrder)),
    db.select().from(worldbuildingLinks).orderBy(asc(worldbuildingLinks.sortOrder)),
    db.select().from(worldbuildingVideos).orderBy(asc(worldbuildingVideos.sortOrder)),
    db.select().from(worldbuildingRelationships).orderBy(asc(worldbuildingRelationships.sortOrder)),
    db.select().from(worldMaps).orderBy(asc(worldMaps.sortOrder)),
    db.select().from(mapLocations).orderBy(asc(mapLocations.sortOrder)),
    getPageAppearance("worldbuilding"),
    getActiveWbMetadataOptionsByType(),
  ]);
  const entityTypeOptions = wbOptions.wb_entity_type;
  const imagesByItem = groupImagesByParent(imageRows, (r) => r.entryId);
  const videosByItem = groupImagesByParent(videoRows, (r) => r.entryId);
  const itemsWithImages = items.map((w) => ({
    ...w,
    images: imagesByItem.get(w.id) ?? [],
    videos: videosByItem.get(w.id) ?? [],
    links: linkRows.filter((l) => l.entryId === w.id),
  }));

  return (
    <div className="page" style={pageAppearanceVars(appearance)}>
      <PageHeader
        watermark="世界観"
        eyebrow="Lore & Stories"
        title="Worldbuilding Chronicles"
        subtitle="Explore stories, lore and characters from created worlds."
      />
      <WorldbuildingBrowser items={itemsWithImages} relationships={relationshipRows} maps={mapRows} locations={locationRows} entityTypeOptions={entityTypeOptions} initialItemId={parseContentItemId(item)} initialMapId={parseContentItemId(map)} />
    </div>
  );
}
