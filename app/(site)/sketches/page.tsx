import { desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { sketches, sketchImages, sketchLinks, sketchVideos } from "@/db/schema";
import SketchGrid from "@/components/SketchGrid";
import PageHeader from "@/components/PageHeader";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { groupImagesByParent } from "@/lib/group-images";

export default async function SketchesPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
  const [items, imageRows, linkRows, videoRows, appearance] = await Promise.all([
    db.select().from(sketches).orderBy(desc(sketches.year), asc(sketches.sortOrder)),
    db.select().from(sketchImages).orderBy(asc(sketchImages.sortOrder)),
    db.select().from(sketchLinks).orderBy(asc(sketchLinks.sortOrder)),
    db.select().from(sketchVideos).orderBy(asc(sketchVideos.sortOrder)),
    getPageAppearance("sketches"),
  ]);
  const imagesByItem = groupImagesByParent(imageRows, (r) => r.sketchId);
  const videosByItem = groupImagesByParent(videoRows, (r) => r.sketchId);
  const itemsWithImages = items.map((s) => ({
    ...s,
    images: imagesByItem.get(s.id) ?? [],
    videos: videosByItem.get(s.id) ?? [],
    links: linkRows.filter((l) => l.sketchId === s.id),
  }));

  return (
    <div className="page" style={pageAppearanceVars(appearance)}>
      <PageHeader
        watermark="落書き"
        eyebrow="Raw Drawings"
        title="Sketches"
        subtitle="Personal sketches and studies — unfiltered."
      />
      <SketchGrid items={itemsWithImages} initialYear={year} />
    </div>
  );
}
