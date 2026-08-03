import { desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { models3d, model3dImages, model3dLinks, model3dVideos } from "@/db/schema";
import Model3DGrid from "@/components/Model3DGrid";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { groupImagesByParent } from "@/lib/group-images";

export default async function Model3DPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
  const [items, imageRows, linkRows, videoRows, appearance] = await Promise.all([
    db.select().from(models3d).orderBy(desc(models3d.year), asc(models3d.sortOrder)),
    db.select().from(model3dImages).orderBy(asc(model3dImages.sortOrder)),
    db.select().from(model3dLinks).orderBy(asc(model3dLinks.sortOrder)),
    db.select().from(model3dVideos).orderBy(asc(model3dVideos.sortOrder)),
    getPageAppearance("3d"),
  ]);
  const imagesByItem = groupImagesByParent(imageRows, (r) => r.modelId);
  const videosByItem = groupImagesByParent(videoRows, (r) => r.modelId);
  const itemsWithImages = items.map((s) => ({
    ...s,
    images: imagesByItem.get(s.id) ?? [],
    videos: videosByItem.get(s.id) ?? [],
    links: linkRows.filter((l) => l.modelId === s.id),
  }));

  return (
    <div className="page" style={pageAppearanceVars(appearance)}>
      <div className="ph">
        <div className="ph-wm">立体</div>
        <div className="ph-eyebrow">Raw Models</div>
        <h2 className="ph-title">3D</h2>
        <p className="ph-sub">Personal 3D studies and props — unfiltered.</p>
      </div>
      <Model3DGrid items={itemsWithImages} initialYear={year} />
    </div>
  );
}
