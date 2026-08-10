import type { Metadata } from "next";
import { desc, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { models3d, model3dImages, model3dLinks, model3dVideos, model3dMetadataOptions, metadataOptions } from "@/db/schema";
import Model3DGrid from "@/components/Model3DGrid";
import PageHeader from "@/components/PageHeader";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { getActiveArtMetadataOptions } from "@/lib/art-metadata";
import { groupImagesByParent } from "@/lib/group-images";
import { parseContentItemId } from "@/lib/content-detail-href";

export const metadata: Metadata = {
  title: "3D",
  description: "Personal 3D studies and props by Ege Demir Ünal — unfiltered work outside the curated portfolio.",
  alternates: { canonical: "/3d" },
};

export default async function Model3DPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; category?: string; item?: string | string[] }>;
}) {
  const { year, category, item } = await searchParams;
  const [items, imageRows, linkRows, videoRows, appearance, categories, categoryRows] = await Promise.all([
    db.select().from(models3d).orderBy(desc(models3d.date), asc(models3d.sortOrder)),
    db.select().from(model3dImages).orderBy(asc(model3dImages.sortOrder)),
    db.select().from(model3dLinks).orderBy(asc(model3dLinks.sortOrder)),
    db.select().from(model3dVideos).orderBy(asc(model3dVideos.sortOrder)),
    getPageAppearance("3d"),
    getActiveArtMetadataOptions(),
    db
      .select({ modelId: model3dMetadataOptions.modelId, id: metadataOptions.id, name: metadataOptions.name, slug: metadataOptions.slug })
      .from(model3dMetadataOptions)
      .innerJoin(metadataOptions, eq(model3dMetadataOptions.metadataOptionId, metadataOptions.id)),
  ]);
  const imagesByItem = groupImagesByParent(imageRows, (r) => r.modelId);
  const videosByItem = groupImagesByParent(videoRows, (r) => r.modelId);
  const categoryByModel = new Map(categoryRows.map((r) => [r.modelId, { id: r.id, name: r.name, slug: r.slug }]));
  const itemsWithImages = items.map((s) => ({
    ...s,
    images: imagesByItem.get(s.id) ?? [],
    videos: videosByItem.get(s.id) ?? [],
    links: linkRows.filter((l) => l.modelId === s.id),
    category: categoryByModel.get(s.id) ?? null,
  }));

  return (
    <div className="page" style={pageAppearanceVars(appearance)}>
      <PageHeader
        watermark="立体"
        eyebrow="Raw Models"
        title="3D"
        subtitle="Personal 3D studies and props — unfiltered."
      />
      <Model3DGrid
        items={itemsWithImages}
        categories={categories}
        initialYear={year}
        initialCategory={category}
        initialItemId={parseContentItemId(item)}
      />
    </div>
  );
}
